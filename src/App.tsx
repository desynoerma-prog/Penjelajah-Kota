import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CameraMode,
  CharacterType,
  FeedbackNotice,
  TrafficLight,
  TrafficSign,
  VehicleType,
} from './game/types';
import {
  MISSIONS_3D,
  TRAFFIC_LIGHTS_3D,
  TRAFFIC_SIGNS_3D,
  VEHICLES,
  CHARACTERS,
} from './game/cityData';
import { ThreeCityScene } from './game/threeCity';
import { sound } from './game/sound';
import { SteeringTouchControls } from './components/SteeringTouchControls';
import { SpeedometerCurved } from './components/SpeedometerCurved';
import { PedalTouchControls } from './components/PedalTouchControls';
import { SmartPhoneGPSPanel } from './components/SmartPhoneGPSPanel';
import { StatusInfoPanel } from './components/StatusInfoPanel';
import { StartScreen } from './components/StartScreen';
import { VehicleMissionScreen } from './components/VehicleMissionScreen';
import { PoliceBriefingModal } from './components/PoliceBriefingModal';
import { EndGameModal } from './components/EndGameModal';
import { SignGuideModal } from './components/SignGuideModal';
import { RouteMemoryModal } from './components/RouteMemoryModal';
import { SignQuizModal } from './components/SignQuizModal';
import { Smartphone, Keyboard } from 'lucide-react';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ThreeCityScene | null>(null);

  // Flow States:
  // 1. start_screen: Halaman Depan dengan tombol "Start"
  // 2. vehicle_mission_selection: Halaman Kedua untuk memilih karakter, kendaraan & misi
  // 3. police_briefing: Percakapan petugas kepolisian menunjukkan denah kota & hafalan rute
  // 4. playing: Simulasi berkendara 3D
  // 5. end_modal: Layar penyelesaian misi
  const [gameState, setGameState] = useState<
    'start_screen' | 'vehicle_mission_selection' | 'police_briefing' | 'playing' | 'end_modal'
  >('start_screen');

  const [showSignGuide, setShowSignGuide] = useState<boolean>(false);
  const [showRouteMemoryModal, setShowRouteMemoryModal] = useState<boolean>(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('laki_laki');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('motor');
  const [selectedMissionId, setSelectedMissionId] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [vehicleCondition, setVehicleCondition] = useState<number>(100);
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [currentCameraMode, setCurrentCameraMode] = useState<CameraMode>('third_near');
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeNotice, setActiveNotice] = useState<FeedbackNotice | null>(null);

  // Memory Navigation Mode: Hint state (active only when requested by player)
  const [isHintActive, setIsHintActive] = useState<boolean>(false);
  const hintTimeoutRef = useRef<number | null>(null);

  // Interactive Traffic Sign Stopping & Educational Quiz
  const [activeSignQuiz, setActiveSignQuiz] = useState<TrafficSign | null>(null);
  const [answeredSignIds, setAnsweredSignIds] = useState<Set<string>>(new Set());
  const answeredSignIdsRef = useRef<Set<string>>(new Set());
  const isQuizCooldownRef = useRef<boolean>(false);

  // Laptop Keyboard vs IFP Touchscreen Adaptation
  const [isTouchControlsVisible, setIsTouchControlsVisible] = useState<boolean>(true);
  const [, setInputMode] = useState<'touch' | 'keyboard'>('touch');

  // Active inputs
  const steerRef = useRef({ left: false, right: false });
  const throttleRef = useRef({ gas: false, brake: false });
  const [steerState, setSteerState] = useState({ left: false, right: false });
  const [throttleState, setThrottleState] = useState({ gas: false, brake: false });
  const [displaySpeedKmh, setDisplaySpeedKmh] = useState<number>(0);

  // 3D Player Coordinates for minimap
  const currentMission = MISSIONS_3D.find((m) => m.id === selectedMissionId) || MISSIONS_3D[0];
  const [playerCoordinates, setPlayerCoordinates] = useState({
    x: currentMission.startPoint.x,
    z: currentMission.startPoint.z,
    angle: currentMission.startPoint.angle,
  });

  // Internal 60FPS simulation refs
  const playerPhys = useRef({
    x: currentMission.startPoint.x,
    z: currentMission.startPoint.z,
    angle: currentMission.startPoint.angle,
    speed: 0,
    turnInput: 0,
  });

  const trafficLightsRef = useRef<TrafficLight[]>(JSON.parse(JSON.stringify(TRAFFIC_LIGHTS_3D)));
  const evaluatedRedLights = useRef<Set<string>>(new Set());
  const evaluatedPedestrians = useRef<Set<string>>(new Set());
  const evaluatedRailway = useRef<boolean>(false);
  const completedCheckpointsRef = useRef<Set<string>>(new Set());
  const noticeTimeoutRef = useRef<number | null>(null);
  const lastUiUpdateRef = useRef<number>(0);
  const lastSpeedDisplayRef = useRef<number>(0);

  // Joyful Learning Toast Dispatcher
  const showNotice = useCallback((message: string, type: 'success' | 'warning' | 'info') => {
    setActiveNotice({
      id: Math.random().toString(),
      message,
      type,
      timestamp: Date.now(),
    });
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setActiveNotice(null);
    }, 4000);
  }, []);

  // Award compliance points
  const triggerPoints = useCallback(
    (pts: number, reason: string) => {
      setScore((prev) => prev + pts);
      sound.playPointChime();
      showNotice(`Hebat! ${reason} (+${pts} Poin)`, 'success');
    },
    [showNotice]
  );

  // Fullscreen Handler
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize Mission State
  const initMission = useCallback((missionId: number) => {
    const target = MISSIONS_3D.find((m) => m.id === missionId) || MISSIONS_3D[0];
    setSelectedMissionId(missionId);
    setScore(0);
    setTimeElapsed(0);
    setVehicleCondition(100);
    setViolationsCount(0);
    setCurrentCheckpointIndex(0);
    setIsHintActive(false);
    completedCheckpointsRef.current.clear();
    evaluatedRedLights.current.clear();
    evaluatedPedestrians.current.clear();
    evaluatedRailway.current = false;
    answeredSignIdsRef.current.clear();
    setAnsweredSignIds(new Set());
    setActiveSignQuiz(null);
    isQuizCooldownRef.current = false;

    playerPhys.current = {
      x: target.startPoint.x,
      z: target.startPoint.z,
      angle: target.startPoint.angle,
      speed: 0,
      turnInput: 0,
    };
    setPlayerCoordinates({
      x: target.startPoint.x,
      z: target.startPoint.z,
      angle: target.startPoint.angle,
    });
  }, []);

  // Selection handlers
  const handleSelectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    sceneRef.current?.updatePlayerVehicle(vehicle, selectedCharacter);
  };

  const handleSelectCharacter = (character: CharacterType) => {
    setSelectedCharacter(character);
    sceneRef.current?.updatePlayerVehicle(selectedVehicle, character);
  };

  // Keyboard controls listener (WASD, Arrows, Space, C, H) + Automatic Laptop Input Detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;
      const isDrivingKey = [
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Space',
      ].includes(code);

      // Adaptasi Laptop: Otomatis pudarkan tombol sentuh saat input keyboard terdeteksi
      if (isDrivingKey) {
        setIsTouchControlsVisible(false);
        setInputMode('keyboard');
      }

      if (code === 'KeyW' || code === 'ArrowUp') {
        throttleRef.current.gas = true;
        setThrottleState({ ...throttleRef.current });
      }
      if (code === 'KeyS' || code === 'ArrowDown' || code === 'Space') {
        throttleRef.current.brake = true;
        setThrottleState({ ...throttleRef.current });
      }
      if (code === 'KeyA' || code === 'ArrowLeft') {
        steerRef.current.left = true;
        setSteerState({ ...steerRef.current });
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        steerRef.current.right = true;
        setSteerState({ ...steerRef.current });
      }
      if (code === 'KeyC') {
        // Toggle camera view
        if (sceneRef.current) {
          const next = sceneRef.current.nextCameraMode();
          setCurrentCameraMode(next);
        }
      }
      if (code === 'KeyH') {
        sound.playHorn(selectedVehicle);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        throttleRef.current.gas = false;
        setThrottleState({ ...throttleRef.current });
      }
      if (code === 'KeyS' || code === 'ArrowDown' || code === 'Space') {
        throttleRef.current.brake = false;
        setThrottleState({ ...throttleRef.current });
      }
      if (code === 'KeyA' || code === 'ArrowLeft') {
        steerRef.current.left = false;
        setSteerState({ ...steerRef.current });
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        steerRef.current.right = false;
        setSteerState({ ...steerRef.current });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedVehicle]);

  // Screen Touch / Pointer detection: Restores virtual touch buttons on touchscreens / IFPs
  const handleScreenPointerDown = () => {
    if (!isTouchControlsVisible) {
      setIsTouchControlsVisible(true);
      setInputMode('touch');
    }
  };

  // Initialize Three.js Scene with 100% width and 100vh dynamic scaling
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new ThreeCityScene(mountRef.current, selectedCharacter, selectedVehicle);
    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Main 60FPS Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let clockTime = 0;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      clockTime += dt;

      const p = playerPhys.current;
      const isPlaying = gameState === 'playing';

      if (isPlaying) {
        setTimeElapsed((t) => t + dt);
      }

      // If sign quiz is active, freeze driving physics so student can answer peacefully
      if (activeSignQuiz) {
        p.speed = 0;
        animId = requestAnimationFrame(loop);
        return;
      }

      // 1. Dynamic Physics Tuning per Selected Vehicle
      const vConfig = VEHICLES[selectedVehicle] || VEHICLES.motor;
      const maxSpeed = vConfig.maxSpeed;
      const accel = vConfig.acceleration;
      const brakeDecel = vConfig.brakeDecel;
      const turnRate = vConfig.turnSpeed;

      const steer = steerRef.current;
      const throttle = throttleRef.current;

      let targetTurn = 0;
      if (steer.left) targetTurn = -1;
      if (steer.right) targetTurn = 1;
      // Smooth steering lerp
      p.turnInput += (targetTurn - p.turnInput) * Math.min(1.0, dt * 10);

      if (throttle.gas) {
        p.speed = Math.min(maxSpeed, p.speed + accel * dt);
      } else if (throttle.brake) {
        if (p.speed > 0) {
          p.speed = Math.max(0, p.speed - brakeDecel * dt);
        } else {
          // Reverse
          p.speed = Math.max(-maxSpeed * 0.35, p.speed - accel * 0.6 * dt);
        }
      } else {
        // Natural rolling friction
        p.speed *= Math.pow(0.85, dt * 5);
        if (Math.abs(p.speed) < 0.05) p.speed = 0;
      }

      // Turn angle based on speed direction
      if (Math.abs(p.speed) > 0.1) {
        const dir = p.speed >= 0 ? 1 : -1;
        p.angle += p.turnInput * turnRate * dt * dir;
      }

      // Position update
      p.x += Math.cos(p.angle) * p.speed * dt;
      p.z += Math.sin(p.angle) * p.speed * dt;

      // Clamp within city area
      p.x = Math.max(-210, Math.min(210, p.x));
      p.z = Math.max(-210, Math.min(210, p.z));

      // 2. Traffic Lights Timer & Real-time Evaluation
      trafficLightsRef.current.forEach((tl) => {
        tl.timer -= dt;
        if (tl.timer <= 0) {
          if (tl.state === 'green') {
            tl.state = 'yellow';
            tl.timer = tl.yellowDuration;
          } else if (tl.state === 'yellow') {
            tl.state = 'red';
            tl.timer = tl.redDuration;
          } else {
            tl.state = 'green';
            tl.timer = tl.greenDuration;
          }
        }

        // Evaluate compliance when approaching red light
        if (isPlaying && tl.state === 'red') {
          const distToLight = Math.hypot(p.x - tl.x, p.z - tl.z);
          if (distToLight < 22) {
            if (p.speed <= 0.8 && !evaluatedRedLights.current.has(tl.id)) {
              evaluatedRedLights.current.add(tl.id);
              triggerPoints(10, 'Tertib Berhenti di Lampu Merah! 🚦');
            } else if (p.speed > 5.0 && !evaluatedRedLights.current.has(tl.id)) {
              evaluatedRedLights.current.add(tl.id);
              setViolationsCount((v) => v + 1);
              sound.playWarningBoop();
              showNotice(
                'Hati-hati! Lampu masih merah, yuk berhenti sejenak sebelum garis marka putih.',
                'warning'
              );
            }
          }
        } else if (tl.state === 'green') {
          evaluatedRedLights.current.delete(tl.id);
        }
      });

      // 3. Railway Crossing Check (Rel di x: -20, z: 60)
      if (isPlaying && sceneRef.current) {
        const isTrainCrossing = sceneRef.current.isTrainPassing();
        const distToRail = Math.hypot(p.x - -20, p.z - 60);

        if (distToRail < 26 && isTrainCrossing) {
          if (p.speed <= 0.8 && !evaluatedRailway.current) {
            evaluatedRailway.current = true;
            triggerPoints(10, 'Sabar & Tertib Menunggu Kereta Api Melintas! 🚆');
          } else if (p.speed > 4.5 && !evaluatedRailway.current) {
            evaluatedRailway.current = true;
            setViolationsCount((v) => v + 1);
            sound.playWarningBoop();
            showNotice(
              'Awas! Palang pintu rel sedang tertutup dan ada kereta melintas!',
              'warning'
            );
          }
        } else if (!isTrainCrossing) {
          evaluatedRailway.current = false;
        }
      }

      // 4. Deteksi Berhenti di Rambu Lalu Lintas untuk Kuis Interaktif
      if (isPlaying && !activeSignQuiz && !isQuizCooldownRef.current && sceneRef.current) {
        const signFound = sceneRef.current.checkApproachingSign(
          { x: p.x, z: p.z },
          answeredSignIdsRef.current
        );
        if (signFound && signFound.quiz) {
          p.speed = 0;
          steerRef.current = { left: false, right: false };
          throttleRef.current = { gas: false, brake: false };
          setSteerState({ left: false, right: false });
          setThrottleState({ gas: false, brake: false });
          sound.playSignEncounterSfx();
          showNotice(`🛑 Zona Edukasi! Berhenti sejenak untuk Kuis ${signFound.title}.`, 'info');
          setActiveSignQuiz(signFound);
        }
      }

      // 5. Checkpoints & Step Progress (Mekanisme Memori: Tanpa suara otomatis!)
      if (isPlaying) {
        const cp = currentMission.checkpoints[currentCheckpointIndex];
        if (cp && !completedCheckpointsRef.current.has(cp.id)) {
          const distToCp = Math.hypot(p.x - cp.x, p.z - cp.z);
          if (distToCp <= cp.radius) {
            completedCheckpointsRef.current.add(cp.id);
            triggerPoints(10, 'Hebat! Mengingat Jalur Rute dengan Tepat! 🎯');

            if (currentCheckpointIndex + 1 < currentMission.checkpoints.length) {
              const nextIdx = currentCheckpointIndex + 1;
              setCurrentCheckpointIndex(nextIdx);
            }
          }
        }

        // 6. Check if Arrived at Target Point B (Misi Selesai)
        const target = currentMission.targetPoint;
        const distToTarget = Math.hypot(p.x - target.x, p.z - target.z);
        if (distToTarget <= target.radius) {
          p.speed = 0;
          sound.playMissionComplete();
          setGameState('end_modal');
        }
      }

      // 7. Update coordinates and speedometer (Throttled to ~10 FPS instead of 60 FPS to eliminate lag)
      const now = performance.now();
      if (now - lastUiUpdateRef.current > 100) {
        lastUiUpdateRef.current = now;

        const currentKmh = Math.abs(Math.round(p.speed * 3.2));
        if (currentKmh !== lastSpeedDisplayRef.current) {
          lastSpeedDisplayRef.current = currentKmh;
          setDisplaySpeedKmh(currentKmh);
        }

        setPlayerCoordinates({
          x: p.x,
          z: p.z,
          angle: p.angle,
        });
      }

      // 8. Update Three.js Scene
      if (sceneRef.current) {
        const activeCp =
          gameState === 'playing'
            ? currentMission.checkpoints[currentCheckpointIndex] || null
            : null;
        const targetPt =
          gameState === 'playing' || gameState === 'end_modal'
            ? currentMission.targetPoint
            : null;

        sceneRef.current.update(
          dt,
          p,
          trafficLightsRef.current,
          activeCp,
          targetPt,
          isHintActive,
          clockTime
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    currentMission,
    currentCheckpointIndex,
    selectedVehicle,
    isHintActive,
    activeSignQuiz,
    triggerPoints,
    showNotice,
  ]);

  // Camera Cycle
  const handleCycleCamera = () => {
    if (sceneRef.current) {
      const next = sceneRef.current.nextCameraMode();
      setCurrentCameraMode(next);
      sound.playClick();
    }
  };

  // Sound toggle
  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Start Simulation from Police Briefing (Tanpa Suara Otomatis!)
  const handleStartSimulation = () => {
    sound.playClick();
    sound.startBGM();
    setGameState('playing');
  };

  // Mekanisme Tombol Bantuan (Hint/Suara Pak Polisi)
  const handleActivateHint = useCallback(() => {
    sound.playClick();
    setIsHintActive(true);
    const activeCp = currentMission.checkpoints[currentCheckpointIndex];
    if (activeCp) {
      sound.speakIndonesian(activeCp.instructionText);
      showNotice(`Hint Pak Polisi: ${activeCp.instructionText}`, 'info');
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = window.setTimeout(() => {
      setIsHintActive(false);
    }, 9000);
  }, [currentMission, currentCheckpointIndex, showNotice]);

  // Handler Selesai Menjawab Kuis Rambu Lalu Lintas
  const handleSignQuizComplete = (isCorrect: boolean, ptsAwarded: number) => {
    if (!activeSignQuiz) return;
    const signId = activeSignQuiz.id;
    const signTitle = activeSignQuiz.title;

    answeredSignIdsRef.current.add(signId);
    setAnsweredSignIds(new Set(answeredSignIdsRef.current));
    sceneRef.current?.markSignAsAnswered(signId);

    setScore((prev) => prev + ptsAwarded);
    if (isCorrect) {
      showNotice(`Luar biasa! Menjawab kuis ${signTitle} dengan tepat (+${ptsAwarded} Poin) ✨`, 'success');
    } else {
      showNotice(`Terus belajar! Pengetahuan rambu ${signTitle} bertambah (+${ptsAwarded} Poin) 💡`, 'info');
    }

    setActiveSignQuiz(null);
    isQuizCooldownRef.current = true;
    window.setTimeout(() => {
      isQuizCooldownRef.current = false;
    }, 4500);
  };

  const handleNextMission = () => {
    sound.playClick();
    const nextId = selectedMissionId < MISSIONS_3D.length ? selectedMissionId + 1 : 1;
    initMission(nextId);
    setGameState('police_briefing');
  };

  const handleRetryMission = () => {
    sound.playClick();
    initMission(selectedMissionId);
    setGameState('police_briefing');
  };

  const handleReturnToStart = () => {
    sound.playClick();
    sound.stopBGM();
    setGameState('start_screen');
  };

  // Distance to active checkpoint
  const activeCheckpoint = currentMission.checkpoints[currentCheckpointIndex];
  const distanceToCheckpoint = activeCheckpoint
    ? Math.hypot(
        playerPhys.current.x - activeCheckpoint.x,
        playerPhys.current.z - activeCheckpoint.z
      )
    : 0;

  return (
    <div
      onPointerDown={handleScreenPointerDown}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* 1. 100% Width & 100vh Height WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full block touch-none" />

      {/* 2. Playing Overlays & Safe Zones (Keeping ~70% of Center View Completely Clear) */}
      {gameState === 'playing' && (
        <>
          {/* Pojok Kiri Atas: Tombol Kamera Putih & Panel Status */}
          <div className="fixed top-6 left-6 z-20">
            <StatusInfoPanel
              score={score}
              timeSeconds={timeElapsed}
              vehicleCondition={vehicleCondition}
              cameraMode={currentCameraMode}
              onCycleCamera={handleCycleCamera}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onOpenSignGuide={() => setShowSignGuide(true)}
              onReturnToMenu={handleReturnToStart}
            />
          </div>

          {/* Sisi Kanan: Panel Misi Pintar Berlatar Putih (Max-Width 340px Pinned Fixed) */}
          <SmartPhoneGPSPanel
            mission={currentMission}
            currentCheckpointIndex={currentCheckpointIndex}
            playerPos={playerCoordinates}
            distanceToCheckpoint={distanceToCheckpoint}
            isHintActive={isHintActive}
            onActivateHint={handleActivateHint}
            onOpenRouteMap={() => setShowRouteMemoryModal(true)}
            answeredSignCount={answeredSignIds.size}
            totalSignsCount={TRAFFIC_SIGNS_3D.length}
          />

          {/* Tengah Bawah: Indikator Kecepatan Melengkung Menempel Bawah (Tidak Menghalangi Jalan Tengah) */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <SpeedometerCurved speedKmh={displaySpeedKmh} />
          </div>

          {/* Kiri Bawah: Navigasi Kemudi (Hitbox Besar IFP 1.75x & Jarak Margin Bawah Layar) */}
          <div className="fixed bottom-8 left-8 sm:bottom-10 sm:left-10 lg:bottom-12 lg:left-12 z-20">
            <SteeringTouchControls
              onSteerChange={(dir) => {
                steerRef.current = dir;
                setSteerState(dir);
              }}
              activeSteer={steerState}
              isTouchVisible={isTouchControlsVisible}
            />
          </div>

          {/* Kanan Bawah: Pedal Gas & Rem (Hitbox Besar IFP 1.75x & Jarak Margin Bawah Layar) */}
          <div className="fixed bottom-8 right-8 sm:bottom-10 sm:right-10 lg:bottom-12 lg:right-12 z-20">
            <PedalTouchControls
              onThrottleChange={(throttle) => {
                throttleRef.current = throttle;
                setThrottleState(throttle);
              }}
              activeThrottle={throttleState}
              isTouchVisible={isTouchControlsVisible}
            />
          </div>

          {/* Indikator Mode Input & Tombol Kembalikan Kontrol Sentuh */}
          <div className="fixed bottom-4 left-6 z-20 pointer-events-auto">
            {!isTouchControlsVisible ? (
              <button
                type="button"
                onClick={() => {
                  setIsTouchControlsVisible(true);
                  setInputMode('touch');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 border border-white/30 rounded-xl text-white backdrop-blur-md text-[11px] font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Keyboard className="w-4 h-4 text-amber-300" />
                <span>Mode Laptop Aktif (WASD/Panah)</span>
                <span className="text-amber-300 underline font-black ml-1">Munculkan Tombol Sentuh</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-white/60 bg-black/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Layar Sentuh IFP Aktif</span>
              </div>
            )}
          </div>

          {/* Toast Notification Banner di Tengah Atas (Sementara, Tidak Mengganggu Pandangan Permanen) */}
          {activeNotice && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
              <div
                className={`px-5 py-2.5 rounded-2xl border-2 shadow-2xl flex items-center gap-3 backdrop-blur-md ${
                  activeNotice.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : activeNotice.type === 'warning'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-100'
                    : 'bg-sky-950/90 border-sky-400 text-sky-100'
                }`}
              >
                <span className="text-2xl">
                  {activeNotice.type === 'success' ? '✨' : activeNotice.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span className="font-black text-sm md:text-base">{activeNotice.message}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. HALAMAN DEPAN (Start Screen dengan tombol "START" besar) */}
      {gameState === 'start_screen' && (
        <StartScreen
          onStart={() => setGameState('vehicle_mission_selection')}
          onOpenSignGuide={() => setShowSignGuide(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* 4. HALAMAN KEDUA (Pemilihan Karakter, Kendaraan & Misi Perjalanan) */}
      {gameState === 'vehicle_mission_selection' && (
        <VehicleMissionScreen
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={handleSelectVehicle}
          selectedMissionId={selectedMissionId}
          onSelectMission={(id) => {
            setSelectedMissionId(id);
            initMission(id);
          }}
          missions={MISSIONS_3D}
          onProceedToBriefing={() => setGameState('police_briefing')}
          onBackToStart={handleReturnToStart}
          onTestHorn={(v) => sound.playHorn(v)}
        />
      )}

      {/* 5. SEBELUM SIMULASI: PERCAKAPAN PETUGAS KEPOLISIAN & DENAH HAFALAN RUTE */}
      {gameState === 'police_briefing' && (
        <PoliceBriefingModal
          mission={currentMission}
          vehicleType={selectedVehicle}
          characterType={selectedCharacter}
          onStartSimulation={handleStartSimulation}
          onBackToSelection={() => setGameState('vehicle_mission_selection')}
        />
      )}

      {/* 6. Layar Penyelesaian Misi (MISI SELESAI + Blur Effect) */}
      {gameState === 'end_modal' && (
        <EndGameModal
          mission={currentMission}
          score={score}
          timeSeconds={timeElapsed}
          violationsCount={violationsCount}
          answeredSignCount={answeredSignIds.size}
          onNextMission={handleNextMission}
          onRetryMission={handleRetryMission}
          onReturnToMenu={handleReturnToStart}
          hasNextMission={selectedMissionId < MISSIONS_3D.length}
        />
      )}

      {/* Kamus Rambu Kota */}
      {showSignGuide && (
        <SignGuideModal onClose={() => setShowSignGuide(false)} />
      )}

      {/* Pop-up Denah Rute Hafalan Saat Bermain */}
      {showRouteMemoryModal && (
        <RouteMemoryModal
          mission={currentMission}
          playerPos={playerCoordinates}
          onClose={() => setShowRouteMemoryModal(false)}
        />
      )}

      {/* 7. Kuis Interaktif Rambu Lalu Lintas (Pemain Berhenti Sejenak untuk Menjawab) */}
      {activeSignQuiz && (
        <SignQuizModal
          sign={activeSignQuiz}
          onAnswerComplete={handleSignQuizComplete}
        />
      )}
    </div>
  );
}
