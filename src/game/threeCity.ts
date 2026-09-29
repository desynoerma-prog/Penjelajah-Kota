import * as THREE from 'three';
import {
  CameraMode,
  TrafficLight,
  TrafficSign,
  ZebraCrossing,
  Pedestrian3D,
  Building,
  RoadSegment,
  Checkpoint,
  CharacterType,
  VehicleType,
  NPCVehicle3D,
  RailwayCrossing,
} from './types';
import {
  ROADS_3D,
  ZEBRAS_3D,
  BUILDINGS_3D,
  TRAFFIC_LIGHTS_3D,
  TRAFFIC_SIGNS_3D,
  PEDESTRIANS_3D,
  INITIAL_NPC_VEHICLES,
  RAILWAY_CROSSING_DATA,
} from './cityData';

export class ThreeCityScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Player Vehicle & Character Group
  public playerVehicleGroup: THREE.Group;
  private wheelsToSpin: THREE.Mesh[] = [];
  private steerableParts: THREE.Group[] = [];

  // Environment & Props
  private trafficLightMeshes: Map<string, { red: THREE.Mesh; yellow: THREE.Mesh; green: THREE.Mesh }> = new Map();
  private pedestrianMeshes: Map<string, THREE.Group> = new Map();
  private flagMesh: THREE.Mesh | null = null;
  private fountainWater: THREE.Mesh | null = null;
  private checkpointMarker: THREE.Group;
  private targetMarker: THREE.Group;

  // Railway Crossing 3D Objects
  private railBarriers: THREE.Group[] = [];
  private trainGroup: THREE.Group | null = null;
  private railwayData: RailwayCrossing = { ...RAILWAY_CROSSING_DATA };

  // NPC Vehicles 3D Objects
  private npcMeshes: Map<string, THREE.Group> = new Map();
  private npcVehicles: NPCVehicle3D[] = JSON.parse(JSON.stringify(INITIAL_NPC_VEHICLES));

  // Traffic Signs Edu-Zones & Halos
  private signHaloMeshes: Map<
    string,
    { ring: THREE.Mesh; icon: THREE.Group; completed: boolean }
  > = new Map();

  // Flying Birds
  private birdGroup: THREE.Group | null = null;
  private birdWings: THREE.Mesh[] = [];

  // Vehicle Exhaust Particles
  private exhaustParticles: {
    mesh: THREE.Mesh;
    life: number;
    maxLife: number;
    vx: number;
    vy: number;
    vz: number;
  }[] = [];
  private exhaustParticleGroup: THREE.Group = new THREE.Group();

  // Camera Settings
  public cameraMode: CameraMode = 'third_near';
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private currentCameraPos: THREE.Vector3 = new THREE.Vector3();
  private currentLookAt: THREE.Vector3 = new THREE.Vector3();

  // Active configurations
  private activeCharacter: CharacterType = 'laki_laki';
  private activeVehicle: VehicleType = 'motor';

  // Textures and asset cache for fast loading & minimal memory
  private curbTexture: THREE.CanvasTexture;
  private zebraTexture: THREE.CanvasTexture;
  private signTextureCache: Map<string, THREE.CanvasTexture> = new Map();
  private sharedExhaustGeo = new THREE.SphereGeometry(0.14, 5, 4);
  private sharedExhaustMat = new THREE.MeshBasicMaterial({
    color: '#cbd5e1',
    transparent: true,
    opacity: 0.45,
  });

  constructor(container: HTMLElement, character: CharacterType = 'laki_laki', vehicle: VehicleType = 'motor') {
    this.container = container;
    this.activeCharacter = character;
    this.activeVehicle = vehicle;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#7dd3fc');
    this.scene.fog = new THREE.FogExp2('#7dd3fc', 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(-140, 6, 130);

    // 3. WebGL Renderer (Optimized for smooth 60 FPS performance on laptops and Chromebooks)
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 4. Procedural Textures
    this.curbTexture = this.createBlackWhiteCurbTexture();
    this.zebraTexture = this.createZebraTexture();

    // 5. Lighting
    this.setupLighting();

    // 6. Build 3D City
    this.buildGroundAndRoads();
    this.buildRailwayTracks();
    this.buildBuildings();
    this.buildTrafficLights();
    this.buildTrafficSignsHD();
    this.buildStreetFurniture();
    this.buildPowerLinesAndPoles();
    this.buildIndonesianStreetVibes();
    this.buildBirds();
    this.buildPedestrians();
    this.buildNPCVehicles();

    // 7. Navigation Markers (Hidden by default in memory mode!)
    this.checkpointMarker = this.createCheckpointMarker();
    this.targetMarker = this.createTargetMarker();
    this.checkpointMarker.visible = false;
    this.scene.add(this.checkpointMarker);
    this.scene.add(this.targetMarker);

    // 8. Vehicle Exhaust Group
    this.scene.add(this.exhaustParticleGroup);

    // 9. Build Player Vehicle & Character
    this.playerVehicleGroup = this.buildPlayerVehicleGroup(this.activeVehicle, this.activeCharacter);
    this.scene.add(this.playerVehicleGroup);

    // Handle Window Resize
    window.addEventListener('resize', this.onResize);
  }

  // --- Lighting Setup ---
  private setupLighting() {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.3);
    sunLight.position.set(100, 140, 70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 320;
    const shadowD = 140;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.001;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#3f6212', 0.6);
    this.scene.add(hemiLight);
  }

  // --- Procedural Textures ---
  private createBlackWhiteCurbTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const blockWidth = 32;
    for (let x = 0; x < canvas.width; x += blockWidth * 2) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 0, blockWidth, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + blockWidth, 0, blockWidth, canvas.height);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 1);
    return texture;
  }

  private createZebraTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    const stripeH = 32;
    for (let y = 0; y < canvas.height; y += stripeH * 2) {
      ctx.fillRect(6, y + 6, canvas.width - 12, stripeH);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // --- Ground, Roads & Curbs ---
  private buildGroundAndRoads() {
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#1e392a',
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.85,
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.8,
    });

    const curbMat = new THREE.MeshStandardMaterial({
      map: this.curbTexture,
      roughness: 0.7,
    });

    ROADS_3D.forEach((road) => {
      const roadGeo = new THREE.PlaneGeometry(road.width, road.depth);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.position.set(road.x, 0.01, road.z);
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);

      const isH = road.direction === 'h';
      const lineGeo = isH
        ? new THREE.PlaneGeometry(road.width, 0.35)
        : new THREE.PlaneGeometry(0.35, road.depth);
      const lineMat = new THREE.MeshBasicMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.85,
      });
      const centerLine = new THREE.Mesh(lineGeo, lineMat);
      centerLine.rotation.x = -Math.PI / 2;
      centerLine.position.set(road.x, 0.02, road.z);
      this.scene.add(centerLine);

      const curbHeight = 0.35;
      const curbWidth = 0.55;
      const walkWidth = 3.5;

      if (isH) {
        const northWalkGeo = new THREE.BoxGeometry(road.width, 0.25, walkWidth);
        const northWalk = new THREE.Mesh(northWalkGeo, sidewalkMat);
        northWalk.position.set(road.x, 0.12, road.z - road.depth / 2 - walkWidth / 2);
        northWalk.receiveShadow = true;
        this.scene.add(northWalk);

        const northCurbGeo = new THREE.BoxGeometry(road.width, curbHeight, curbWidth);
        const northCurb = new THREE.Mesh(northCurbGeo, curbMat);
        northCurb.position.set(road.x, curbHeight / 2, road.z - road.depth / 2 - curbWidth / 2);
        northCurb.castShadow = true;
        northCurb.receiveShadow = true;
        this.scene.add(northCurb);

        const southWalkGeo = new THREE.BoxGeometry(road.width, 0.25, walkWidth);
        const southWalk = new THREE.Mesh(southWalkGeo, sidewalkMat);
        southWalk.position.set(road.x, 0.12, road.z + road.depth / 2 + walkWidth / 2);
        southWalk.receiveShadow = true;
        this.scene.add(southWalk);

        const southCurbGeo = new THREE.BoxGeometry(road.width, curbHeight, curbWidth);
        const southCurb = new THREE.Mesh(southCurbGeo, curbMat);
        southCurb.position.set(road.x, curbHeight / 2, road.z + road.depth / 2 + curbWidth / 2);
        southCurb.castShadow = true;
        southCurb.receiveShadow = true;
        this.scene.add(southCurb);
      } else {
        const westWalkGeo = new THREE.BoxGeometry(walkWidth, 0.25, road.depth);
        const westWalk = new THREE.Mesh(westWalkGeo, sidewalkMat);
        westWalk.position.set(road.x - road.width / 2 - walkWidth / 2, 0.12, road.z);
        westWalk.receiveShadow = true;
        this.scene.add(westWalk);

        const westCurbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, road.depth);
        const westCurb = new THREE.Mesh(westCurbGeo, curbMat);
        westCurb.position.set(road.x - road.width / 2 - curbWidth / 2, curbHeight / 2, road.z);
        westCurb.castShadow = true;
        westCurb.receiveShadow = true;
        this.scene.add(westCurb);

        const eastWalkGeo = new THREE.BoxGeometry(walkWidth, 0.25, road.depth);
        const eastWalk = new THREE.Mesh(eastWalkGeo, sidewalkMat);
        eastWalk.position.set(road.x + road.width / 2 + walkWidth / 2, 0.12, road.z);
        eastWalk.receiveShadow = true;
        this.scene.add(eastWalk);

        const eastCurbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, road.depth);
        const eastCurb = new THREE.Mesh(eastCurbGeo, curbMat);
        eastCurb.position.set(road.x + road.width / 2 + curbWidth / 2, curbHeight / 2, road.z);
        eastCurb.castShadow = true;
        eastCurb.receiveShadow = true;
        this.scene.add(eastCurb);
      }
    });

    const zebraMat = new THREE.MeshBasicMaterial({
      map: this.zebraTexture,
      transparent: true,
      opacity: 0.95,
    });
    ZEBRAS_3D.forEach((zb) => {
      const zGeo = new THREE.PlaneGeometry(zb.width, zb.depth);
      const zMesh = new THREE.Mesh(zGeo, zebraMat);
      zMesh.rotation.x = -Math.PI / 2;
      zMesh.position.set(zb.x, 0.03, zb.z);
      this.scene.add(zMesh);
    });

    const zossGeo = new THREE.PlaneGeometry(20, 24);
    const zossMat = new THREE.MeshBasicMaterial({
      color: '#dc2626',
      transparent: true,
      opacity: 0.85,
    });
    const zossMesh = new THREE.Mesh(zossGeo, zossMat);
    zossMesh.rotation.x = -Math.PI / 2;
    zossMesh.position.set(-20, 0.025, -95);
    this.scene.add(zossMesh);
  }

  // --- Perlintasan Kereta Api 3D (Rel, Palang Pintu Otomatis & Lokomotif) ---
  private buildRailwayTracks() {
    const railGroup = new THREE.Group();
    const trackZ = 60;

    // Gravel Bed
    const ballastGeo = new THREE.BoxGeometry(480, 0.15, 6);
    const ballastMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, 0.08, trackZ);
    railGroup.add(ballast);

    // Sleepers (Bantalan Rel Kayu)
    const sleeperGeo = new THREE.BoxGeometry(0.5, 0.2, 4.8);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    for (let x = -240; x <= 240; x += 2.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(x, 0.15, trackZ);
      railGroup.add(sleeper);
    }

    // Steel Rails (Rel Baja Ganda)
    const railSteelGeo = new THREE.BoxGeometry(480, 0.22, 0.18);
    const railSteelMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 });
    const rail1 = new THREE.Mesh(railSteelGeo, railSteelMat);
    rail1.position.set(0, 0.32, trackZ - 1.4);
    railGroup.add(rail1);

    const rail2 = new THREE.Mesh(railSteelGeo, railSteelMat);
    rail2.position.set(0, 0.32, trackZ + 1.4);
    railGroup.add(rail2);

    // Palang Pintu Perlintasan Kereta Api (North & South of Jl. Pahlawan)
    const barrierPositions = [
      { x: -9, z: trackZ - 4.5, side: 'north' },
      { x: -31, z: trackZ + 4.5, side: 'south' },
    ];

    barrierPositions.forEach((bp) => {
      const barrierUnit = new THREE.Group();
      barrierUnit.position.set(bp.x, 0, bp.z);

      // Post Base
      const baseGeo = new THREE.BoxGeometry(1.0, 2.2, 1.0);
      const baseMat = new THREE.MeshStandardMaterial({ color: '#334155' });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 1.1;
      barrierUnit.add(base);

      // Warning Cross Sign (Silang Perlintasan Kereta)
      const crossGeo = new THREE.BoxGeometry(1.6, 0.3, 0.1);
      const crossMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const cross1 = new THREE.Mesh(crossGeo, crossMat);
      cross1.position.set(0, 2.7, 0);
      cross1.rotation.z = Math.PI / 4;
      barrierUnit.add(cross1);
      const cross2 = new THREE.Mesh(crossGeo, crossMat);
      cross2.position.set(0, 2.7, 0);
      cross2.rotation.z = -Math.PI / 4;
      barrierUnit.add(cross2);

      // Alternating Red Flashing Lights
      const flasherGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const flasherMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
      const flasherL = new THREE.Mesh(flasherGeo, flasherMat);
      flasherL.position.set(-0.4, 2.2, 0.2);
      barrierUnit.add(flasherL);
      const flasherR = new THREE.Mesh(flasherGeo, flasherMat);
      flasherR.position.set(0.4, 2.2, 0.2);
      barrierUnit.add(flasherR);

      // Boom Barrier Arm (Striped Red & White)
      const armGroup = new THREE.Group();
      armGroup.position.set(0, 1.8, 0);

      const boomGeo = new THREE.BoxGeometry(12, 0.24, 0.24);
      // Striped texture on boom
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      for (let x = 0; x < canvas.width; x += 16) {
        ctx.fillStyle = (x / 16) % 2 === 0 ? '#dc2626' : '#ffffff';
        ctx.fillRect(x, 0, 16, 16);
      }
      const boomTex = new THREE.CanvasTexture(canvas);
      boomTex.wrapS = THREE.RepeatWrapping;
      boomTex.repeat.set(4, 1);
      const boomMat = new THREE.MeshBasicMaterial({ map: boomTex });

      const boom = new THREE.Mesh(boomGeo, boomMat);
      boom.position.set(bp.side === 'north' ? -6 : 6, 0, 0);
      armGroup.add(boom);

      barrierUnit.add(armGroup);
      this.railBarriers.push(armGroup);
      this.scene.add(barrierUnit);
    });

    // Indonesian Locomotive & Train
    const train = new THREE.Group();
    train.position.set(-280, 0, trackZ);

    // Locomotive Body (CC206 Style White, Orange & Blue)
    const locoGeo = new THREE.BoxGeometry(18, 4.2, 3.2);
    const locoMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
    const loco = new THREE.Mesh(locoGeo, locoMat);
    loco.position.y = 2.4;
    train.add(loco);

    // Blue Stripe
    const stripeGeo = new THREE.BoxGeometry(18.2, 0.8, 3.25);
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 2.0;
    train.add(stripe);

    // Cabin Windows
    const winGeo = new THREE.BoxGeometry(4.2, 1.2, 3.3);
    const winMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(6, 3.2, 0);
    train.add(win);

    // Train Headlight
    const trainHeadlight = new THREE.PointLight('#fef08a', 4.0, 35);
    trainHeadlight.position.set(9.2, 2.5, 0);
    train.add(trainHeadlight);

    // Passenger Coaches (Gerbong Penumpang)
    for (let i = 1; i <= 3; i++) {
      const coachGeo = new THREE.BoxGeometry(20, 3.8, 3.1);
      const coachMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 });
      const coach = new THREE.Mesh(coachGeo, coachMat);
      coach.position.set(-i * 22, 2.2, 0);
      train.add(coach);
    }

    this.trainGroup = train;
    this.scene.add(train);
    this.scene.add(railGroup);
  }

  // --- Cached Sign Textures (256x256, shared across signs) ---
  private getSignTexture(type: string): THREE.CanvasTexture {
    if (this.signTextureCache.has(type)) {
      return this.signTextureCache.get(type)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    switch (type) {
      case 'stop': {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * 2 * Math.PI) / 8 - Math.PI / 8;
          const px = 128 + 118 * Math.cos(angle);
          const py = 128 + 118 * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 68px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STOP', 128, 128);
        break;
      }

      case 'traffic_light': {
        ctx.save();
        ctx.translate(128, 128);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-90, -90, 180, 180);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 12;
        ctx.strokeRect(-90, -90, 180, 180);
        ctx.restore();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(95, 55, 66, 145);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(128, 80, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(128, 128, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(128, 175, 18, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'railway': {
        ctx.save();
        ctx.translate(128, 128);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-90, -90, 180, 180);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 12;
        ctx.strokeRect(-90, -90, 180, 180);
        ctx.restore();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(70, 100);
        ctx.lineTo(186, 100);
        ctx.moveTo(70, 156);
        ctx.lineTo(186, 156);
        ctx.stroke();

        for (let rx = 80; rx <= 175; rx += 19) {
          ctx.beginPath();
          ctx.moveTo(rx, 87);
          ctx.lineTo(rx, 168);
          ctx.stroke();
        }
        break;
      }

      case 'no_right_turn': {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(128, 128, 115, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 18;
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(85, 170);
        ctx.lineTo(85, 118);
        ctx.lineTo(150, 118);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(135, 90);
        ctx.lineTo(168, 118);
        ctx.lineTo(135, 145);
        ctx.stroke();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(55, 55);
        ctx.lineTo(201, 201);
        ctx.stroke();
        break;
      }

      case 'no_entry': {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(128, 128, 115, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(48, 105, 160, 46);
        break;
      }

      case 'zebra': {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(16, 16, 224, 224);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.strokeRect(16, 16, 224, 224);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(128, 38);
        ctx.lineTo(220, 210);
        ctx.lineTo(36, 210);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(128, 100, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(113, 125, 30, 50);
        break;
      }

      case 'school_zone': {
        ctx.save();
        ctx.translate(128, 128);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-90, -90, 180, 180);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 12;
        ctx.strokeRect(-90, -90, 180, 180);
        ctx.restore();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(105, 95, 18, 0, Math.PI * 2);
        ctx.arc(150, 110, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(95, 115, 21, 48);
        ctx.fillRect(142, 130, 18, 40);
        break;
      }

      default:
        break;
    }

    const tex = new THREE.CanvasTexture(canvas);
    this.signTextureCache.set(type, tex);
    return tex;
  }

  // --- Optimized HD Traffic Signs & Large Street Guide Boards ---
  private buildTrafficSignsHD() {
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.14, 4.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 });
    const signGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const ringGeo = new THREE.RingGeometry(3.0, 3.8, 16);
    const diamondGeo = new THREE.OctahedronGeometry(0.45, 0);

    TRAFFIC_SIGNS_3D.forEach((s) => {
      const group = new THREE.Group();
      group.position.set(s.x, 0, s.z);

      // Signpost Pole
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.4;
      group.add(pole);

      // Reused Cached Texture & Mesh
      const signTex = this.getSignTexture(s.type);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.y = 4.0;
      group.add(signMesh);

      // Interactive Ground Halo Ring on the Road/Sidewalk
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#facc15',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.08;
      group.add(ringMesh);

      // Floating Interactive Quiz Beacon above the sign (height 5.8m)
      const iconGroup = new THREE.Group();
      iconGroup.position.y = 5.8;

      const diamondMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        emissive: '#eab308',
        emissiveIntensity: 1.5,
        roughness: 0.2,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      iconGroup.add(diamond);

      group.add(iconGroup);

      this.signHaloMeshes.set(s.id, { ring: ringMesh, icon: iconGroup, completed: false });
      this.scene.add(group);
    });

    // Street Direction Pointer Boards (Plang Hijau Nama Tempat & Arah Khas Indonesia)
    const guideSigns = [
      { text: '⬅️ PUSKESMAS SEHAT', x: 80, z: -10, angle: 0 },
      { text: 'SEKOLAH SDN 1 ➡️', x: -40, z: -10, angle: 0 },
      { text: '⬅️ PERPUSTAKAAN NASIONAL', x: -10, z: -10, angle: Math.PI / 2 },
      { text: 'PASAR TRADISIONAL ➡️', x: 80, z: 110, angle: 0 },
      { text: '🚆 STASIUN KERETA API', x: -40, z: 75, angle: 0 },
    ];

    guideSigns.forEach((gs) => {
      const group = new THREE.Group();
      group.position.set(gs.x, 0, gs.z);
      group.rotation.y = gs.angle;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8),
        new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 })
      );
      pole.position.y = 2.1;
      group.add(pole);

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#15803d'; // Indonesian Highway Green
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, 496, 112);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gs.text, 256, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 0.9),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
      );
      board.position.y = 3.6;
      group.add(board);

      this.scene.add(group);
    });
  }

  // --- Dynamic NPC Vehicles (Lalu Lintas Kendaraan Warga) ---
  private buildNPCVehicles() {
    this.npcVehicles.forEach((npc) => {
      const group = new THREE.Group();
      group.position.set(npc.x, 0, npc.z);

      if (npc.type === 'car') {
        // Sedan NPC
        const bodyGeo = new THREE.BoxGeometry(2.0, 1.0, 4.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: npc.color, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        const cabinGeo = new THREE.BoxGeometry(1.7, 0.8, 2.2);
        const cabinMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.6, -0.2);
        group.add(cabin);

        // Headlights
        const hlMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), hlMat);
        hlL.position.set(-0.65, 0.8, 2.12);
        group.add(hlL);
        const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), hlMat);
        hlR.position.set(0.65, 0.8, 2.12);
        group.add(hlR);
      } else if (npc.type === 'angkot') {
        // Angkot Biru Indonesia
        const bodyGeo = new THREE.BoxGeometry(2.1, 1.8, 4.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: npc.color, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        const roofStripe = new THREE.Mesh(
          new THREE.BoxGeometry(2.15, 0.3, 4.65),
          new THREE.MeshBasicMaterial({ color: '#facc15' })
        );
        roofStripe.position.y = 1.95;
        group.add(roofStripe);
      } else if (npc.type === 'truck') {
        // Mobil Boks Logistik
        const cabGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
        const cabMat = new THREE.MeshStandardMaterial({ color: npc.color });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.set(0, 1.2, 1.4);
        cab.castShadow = true;
        group.add(cab);

        const boxGeo = new THREE.BoxGeometry(2.3, 2.4, 3.8);
        const boxMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0' });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(0, 1.6, -1.6);
        box.castShadow = true;
        group.add(box);
      } else {
        // Sepeda Motor NPC
        const bikeGeo = new THREE.BoxGeometry(0.7, 1.0, 2.0);
        const bikeMat = new THREE.MeshStandardMaterial({ color: npc.color });
        const bike = new THREE.Mesh(bikeGeo, bikeMat);
        bike.position.y = 0.7;
        bike.castShadow = true;
        group.add(bike);

        const riderMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshStandardMaterial({ color: '#334155' })
        );
        riderMesh.position.set(0, 1.4, 0);
        group.add(riderMesh);
      }

      this.npcMeshes.set(npc.id, group);
      this.scene.add(group);
    });
  }

  // --- 3D Buildings ---
  private buildBuildings() {
    BUILDINGS_3D.forEach((b) => {
      const group = new THREE.Group();
      group.position.set(b.x, 0, b.z);

      const wallMat = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.7 });
      const wallGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
      const walls = new THREE.Mesh(wallGeo, wallMat);
      walls.position.y = b.height / 2;
      walls.castShadow = true;
      walls.receiveShadow = true;
      group.add(walls);

      const roofMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.6 });
      const roofGeo = new THREE.ConeGeometry(Math.hypot(b.width, b.depth) * 0.52, b.height * 0.45, 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = b.height + (b.height * 0.45) / 2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      if (b.type === 'shop' || b.type === 'market' || b.type === 'supermarket') {
        const glassMat = new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          roughness: 0.1,
          metalness: 0.8,
          transparent: true,
          opacity: 0.75,
        });
        const glassGeo = new THREE.BoxGeometry(b.width * 0.85, 3.5, 0.6);
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(0, 2, b.depth / 2 + 0.3);
        group.add(glass);
      }

      if (b.type === 'school') {
        const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 12, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(-b.width * 0.35, 6, b.depth / 2 + 6);
        pole.castShadow = true;
        group.add(pole);

        const flagGeo = new THREE.PlaneGeometry(3.2, 1.8, 8, 4);
        const flagCanvas = document.createElement('canvas');
        flagCanvas.width = 128;
        flagCanvas.height = 64;
        const fCtx = flagCanvas.getContext('2d')!;
        fCtx.fillStyle = '#dc2626';
        fCtx.fillRect(0, 0, 128, 32);
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 32, 128, 32);
        const flagTex = new THREE.CanvasTexture(flagCanvas);
        const flagMat = new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(-b.width * 0.35 + 1.6, 11, b.depth / 2 + 6);
        this.flagMesh = flag;
        group.add(flag);
      }

      const signBoard = this.createBuildingPlaque(b.badgeIcon + ' ' + b.name);
      signBoard.position.set(0, b.height * 0.75, b.depth / 2 + 0.5);
      group.add(signBoard);

      this.scene.add(group);
    });
  }

  private createBuildingPlaque(text: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const geo = new THREE.PlaneGeometry(12, 1.8);
    return new THREE.Mesh(geo, mat);
  }

  // --- Traffic Lights (APILL) in 3D ---
  private buildTrafficLights() {
    TRAFFIC_LIGHTS_3D.forEach((tl) => {
      const group = new THREE.Group();
      group.position.set(tl.x, 0, tl.z);

      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 6.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.25;
      pole.castShadow = true;
      group.add(pole);

      const boxGeo = new THREE.BoxGeometry(0.8, 2.2, 0.7);
      const boxMat = new THREE.MeshStandardMaterial({ color: '#0f172a' });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 5.5, 0);
      group.add(box);

      const bulbGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const redMat = new THREE.MeshStandardMaterial({ color: '#581c1c', roughness: 0.2 });
      const yellowMat = new THREE.MeshStandardMaterial({ color: '#713f12', roughness: 0.2 });
      const greenMat = new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.2 });

      const redBulb = new THREE.Mesh(bulbGeo, redMat);
      redBulb.position.set(0, 6.1, 0.35);
      group.add(redBulb);

      const yellowBulb = new THREE.Mesh(bulbGeo, yellowMat);
      yellowBulb.position.set(0, 5.5, 0.35);
      group.add(yellowBulb);

      const greenBulb = new THREE.Mesh(bulbGeo, greenMat);
      greenBulb.position.set(0, 4.9, 0.35);
      group.add(greenBulb);

      this.trafficLightMeshes.set(tl.id, { red: redBulb, yellow: yellowBulb, green: greenBulb });
      this.scene.add(group);
    });
  }

  // --- Street Furniture & Trees ---
  private buildStreetFurniture() {
    const lampGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });

    const lampPositions = [
      { x: -125, z: -105 },
      { x: -125, z: 15 },
      { x: -125, z: 105 },
      { x: -35, z: -105 },
      { x: -35, z: 15 },
      { x: -35, z: 105 },
      { x: 85, z: -105 },
      { x: 85, z: 15 },
      { x: 85, z: 105 },
    ];

    lampPositions.forEach((pos) => {
      const pole = new THREE.Mesh(lampGeo, lampMat);
      pole.position.set(pos.x, 3.75, pos.z);
      this.scene.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.16), lampMat);
      arm.position.set(pos.x + 0.8, 7.4, pos.z);
      this.scene.add(arm);

      const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.35, 8), bulbMat);
      lampHead.position.set(pos.x + 1.4, 7.2, pos.z);
      this.scene.add(lampHead);
    });

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 3.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const leafGeo = new THREE.DodecahedronGeometry(2.4, 1);
    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });

    const treePositions = [
      { x: -90, z: -60 },
      { x: -10, z: -60 },
      { x: 145, z: -60 },
      { x: 195, z: -85 },
      { x: 195, z: -35 },
      { x: -50, z: 155 },
      { x: 75, z: 155 },
      { x: -110, z: 80 },
      { x: -110, z: -80 },
    ];

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.75;
      tree.add(trunk);
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.y = 4.2;
      tree.add(leaves);
      this.scene.add(tree);
    });
  }

  // --- Realisme Kota Indonesia: Tiang Listrik Beton & Kabel Bergantung ---
  private buildPowerLinesAndPoles() {
    const poleMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.8 });
    const crossarmMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7 });
    const wireMat = new THREE.LineBasicMaterial({ color: '#0f172a', linewidth: 1.5 });
    const insulatorMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.3 });

    // Rangkaian Tiang Listrik di Sepanjang Jalan Utama (Jl. Garuda Raya z = 14)
    const garudaPoles = [-170, -110, -50, 10, 70, 130, 180].map((x) => ({ x, y: 0, z: 14 }));
    // Rangkaian Tiang Listrik di Jl. Melati (z = 134)
    const melatiPoles = [-160, -90, -20, 50, 120].map((x) => ({ x, y: 0, z: 134 }));

    const createPoleGroup = (pos: { x: number; y: number; z: number }, hasTransformer = false) => {
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);

      // Tiang Beton Silinder
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.26, 9.5, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4.75;
      group.add(pole);

      // Palang Besi Atas (Crossarm)
      const armGeo = new THREE.BoxGeometry(2.4, 0.14, 0.14);
      const arm = new THREE.Mesh(armGeo, crossarmMat);
      arm.position.y = 9.0;
      group.add(arm);

      // 2 Isolator Keramik Cokelat
      [-0.8, 0.8].forEach((ox) => {
        const insGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.22, 6);
        const ins = new THREE.Mesh(insGeo, insulatorMat);
        ins.position.set(ox, 9.15, 0);
        group.add(ins);
      });

      // Kotak Trafo Distribusi (pada tiang tertentu)
      if (hasTransformer) {
        const trafoGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8);
        const trafoMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6 });
        const trafo = new THREE.Mesh(trafoGeo, trafoMat);
        trafo.position.set(0.45, 7.2, 0);
        group.add(trafo);
      }

      this.scene.add(group);
      return pos;
    };

    // Bangun tiang-tiang & hubungkan dengan kabel gantung melengkung (optimized 6-point curves)
    const connectWithCables = (poles: { x: number; y: number; z: number }[]) => {
      for (let i = 0; i < poles.length - 1; i++) {
        const p1 = poles[i];
        const p2 = poles[i + 1];

        [-0.8, 0.8].forEach((ox) => {
          const startPt = new THREE.Vector3(p1.x + ox, 9.2, p1.z);
          const endPt = new THREE.Vector3(p2.x + ox, 9.2, p2.z);
          const midPt = new THREE.Vector3(
            (p1.x + p2.x) / 2 + ox,
            8.6,
            (p1.z + p2.z) / 2
          );

          const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
          const points = curve.getPoints(6);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, wireMat);
          this.scene.add(line);
        });
      }
    };

    garudaPoles.forEach((p, idx) => createPoleGroup(p, idx === 2 || idx === 5));
    connectWithCables(garudaPoles);

    melatiPoles.forEach((p, idx) => createPoleGroup(p, idx === 1));
    connectWithCables(melatiPoles);
  }

  // --- Realisme Suasana Jalanan Indonesia: Warung, Halte Angkot, Tambal Ban, Pos Satpam ---
  private buildIndonesianStreetVibes() {
    // 1. Halte Angkot Kota (di Jl. Garuda Raya x: 35, z: 13)
    const halteGroup = new THREE.Group();
    halteGroup.position.set(35, 0, 13);

    const roofGeo = new THREE.CylinderGeometry(2.4, 2.4, 4.2, 12, 1, false, 0, Math.PI);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#0284c7', side: THREE.DoubleSide });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.z = Math.PI / 2;
    roof.position.set(0, 3.2, 0);
    halteGroup.add(roof);

    const pillarMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 });
    [-1.8, 1.8].forEach((ox) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), pillarMat);
      pillar.position.set(ox, 1.6, -0.9);
      halteGroup.add(pillar);
    });

    // Bangku Penumpang
    const benchGeo = new THREE.BoxGeometry(3.2, 0.12, 0.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.6, -0.6);
    halteGroup.add(bench);

    // Plang Halte
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0284c7';
    sCtx.fillRect(0, 0, 256, 64);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 22px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('🚏 HALTE ANGKOT', 128, 32);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signBoard.position.set(0, 2.9, 1.2);
    halteGroup.add(signBoard);

    this.scene.add(halteGroup);

    // 2. Warung Makan Khas Indonesia (Aroma Realistis Tepi Jalan)
    const warungGroup = new THREE.Group();
    warungGroup.position.set(-85, 0, 15);

    const warungRoof = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.2, 2.2),
      new THREE.MeshStandardMaterial({ color: '#dc2626' }) // Atap seng merah
    );
    warungRoof.position.set(0, 2.8, 0);
    warungRoof.rotation.x = 0.2;
    warungGroup.add(warungRoof);

    // Kain Spanduk Warung ("WARUNG MAKAN SEDAP")
    const wCanvas = document.createElement('canvas');
    wCanvas.width = 512;
    wCanvas.height = 128;
    const wCtx = wCanvas.getContext('2d')!;
    wCtx.fillStyle = '#fef08a';
    wCtx.fillRect(0, 0, 512, 128);
    wCtx.fillStyle = '#b91c1c';
    wCtx.font = '900 36px sans-serif';
    wCtx.textAlign = 'center';
    wCtx.textBaseline = 'middle';
    wCtx.fillText('WARUNG MAKAN SEDAP', 256, 48);
    wCtx.fillStyle = '#0f172a';
    wCtx.font = 'bold 22px sans-serif';
    wCtx.fillText('Soto Ayam • Nasi Goreng • Es Teh', 256, 92);

    const wBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 1.05),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wCanvas), side: THREE.DoubleSide })
    );
    wBanner.position.set(0, 2.2, 1.05);
    warungGroup.add(wBanner);

    // Meja & Kursi Warung
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.75, 1.2), new THREE.MeshStandardMaterial({ color: '#d97706' }));
    table.position.set(0, 0.45, 0);
    warungGroup.add(table);

    this.scene.add(warungGroup);

    // 3. Kios Tambal Ban & Pom Bensin Mini (di Jl. Melati x: -75, z: 106)
    const pomGroup = new THREE.Group();
    pomGroup.position.set(-75, 0, 106);

    // Kompresor Angin Merah
    const compTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 })
    );
    compTank.rotation.z = Math.PI / 2;
    compTank.position.set(-1.2, 0.4, 0);
    pomGroup.add(compTank);

    // Pom Bensin Mini (Kios Pertamini Khas)
    const dispenser = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.8, 0.7),
      new THREE.MeshStandardMaterial({ color: '#16a34a' })
    );
    dispenser.position.set(0.6, 0.9, 0);
    pomGroup.add(dispenser);

    // Plang Tambal Ban
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 256;
    pCanvas.height = 96;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.fillStyle = '#0f172a';
    pCtx.fillRect(0, 0, 256, 96);
    pCtx.fillStyle = '#facc15';
    pCtx.font = 'bold 24px sans-serif';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillText('TAMBAL BAN', 128, 32);
    pCtx.font = 'bold 18px sans-serif';
    pCtx.fillText('& POM MINI', 128, 68);
    const pBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pCanvas) }));
    pBoard.position.set(-0.3, 2.2, 0);
    pomGroup.add(pBoard);

    this.scene.add(pomGroup);

    // 4. Tempat Sampah Pilah 3 Warna Khas Sekolah Indonesia
    const binPositions = [
      { x: -14, z: -110 },
      { x: -130, z: -140 },
      { x: 95, z: -140 },
    ];

    binPositions.forEach((bp) => {
      const binGroup = new THREE.Group();
      binGroup.position.set(bp.x, 0, bp.z);

      const colors = ['#16a34a', '#eab308', '#dc2626']; // Hijau (Organik), Kuning (Anorganik), Merah (B3)
      colors.forEach((c, idx) => {
        const bin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.16, 0.65, 8),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })
        );
        bin.position.set((idx - 1) * 0.55, 0.35, 0);
        binGroup.add(bin);
      });

      this.scene.add(binGroup);
    });

    // 5. Sepeda Motor Warga Terparkir di Tepi Trotoar
    const bikeGroup = new THREE.Group();
    bikeGroup.position.set(-82, 0.35, 13);
    const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 1.4), new THREE.MeshStandardMaterial({ color: '#0f172a' }));
    bikeGroup.add(bikeBody);
    const bWheelMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const bWheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 8).rotateZ(Math.PI / 2);
    const bw1 = new THREE.Mesh(bWheelGeo, bWheelMat);
    bw1.position.set(0, -0.1, -0.5);
    bikeGroup.add(bw1);
    const bw2 = new THREE.Mesh(bWheelGeo, bWheelMat);
    bw2.position.set(0, -0.1, 0.5);
    bikeGroup.add(bw2);
    this.scene.add(bikeGroup);
  }

  // --- Kawanan Burung Merpati Terbang di Langit Kota ---
  private buildBirds() {
    const birdRoot = new THREE.Group();
    birdRoot.position.set(0, 42, 0);

    const birdMat = new THREE.MeshBasicMaterial({ color: '#f8fafc', side: THREE.DoubleSide });

    for (let i = 0; i < 7; i++) {
      const bird = new THREE.Group();
      const angle = (i / 7) * Math.PI * 2;
      const radius = 35 + (i % 3) * 8;
      bird.position.set(Math.cos(angle) * radius, (i % 2) * 2, Math.sin(angle) * radius);

      // Sayap Kiri & Kanan
      const wingGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        -0.6, 0.1, -0.3,
        0, 0, -0.4,
      ]);
      wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const wingL = new THREE.Mesh(wingGeo, birdMat);
      bird.add(wingL);
      this.birdWings.push(wingL);

      const wingR = wingL.clone();
      wingR.scale.x = -1;
      bird.add(wingR);
      this.birdWings.push(wingR);

      birdRoot.add(bird);
    }

    this.birdGroup = birdRoot;
    this.scene.add(birdRoot);
  }

  // --- Mekanisme Interaksi Rambu Edukasi: Tandai Rambu Selesai Dijawab ---
  public markSignAsAnswered(signId: string) {
    const item = this.signHaloMeshes.get(signId);
    if (!item) return;
    item.completed = true;

    // Ganti warna halo cincin di tanah menjadi hijau emerald
    const ringMat = item.ring.material as THREE.MeshBasicMaterial;
    ringMat.color.set('#10b981');
    ringMat.opacity = 0.35;

    // Ganti ikon melayang menjadi tanda bintang hijau berkilau
    const diamond = item.icon.children[0] as THREE.Mesh;
    if (diamond) {
      const mat = diamond.material as THREE.MeshStandardMaterial;
      mat.color.set('#10b981');
      mat.emissive.set('#10b981');
      mat.emissiveIntensity = 1.2;
    }
  }

  // --- Deteksi Mendekati Rambu Lalu Lintas (Pemain Berhenti untuk Kuis) ---
  public checkApproachingSign(
    playerPos: { x: number; z: number },
    answeredSigns: Set<string>
  ): TrafficSign | null {
    for (const sign of TRAFFIC_SIGNS_3D) {
      if (answeredSigns.has(sign.id)) continue;
      const dist = Math.hypot(playerPos.x - sign.x, playerPos.z - sign.z);
      if (dist <= sign.radius) {
        return sign;
      }
    }
    return null;
  }

  // --- 3D Pedestrians ---
  private buildPedestrians() {
    PEDESTRIANS_3D.forEach((ped) => {
      const group = new THREE.Group();
      group.position.set(ped.x, 0, ped.z);

      const shirtGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.7, 8);
      const shirtMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.y = 0.95;
      group.add(shirt);

      const skirtGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.5, 8);
      const skirtMat = new THREE.MeshStandardMaterial({ color: ped.color });
      const skirt = new THREE.Mesh(skirtGeo, skirtMat);
      skirt.position.y = 0.45;
      group.add(skirt);

      const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: '#fed7aa' });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.5;
      group.add(head);

      const hatGeo = new THREE.ConeGeometry(0.28, 0.25, 8);
      const hatMat = new THREE.MeshStandardMaterial({ color: '#dc2626' });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.y = 1.7;
      group.add(hat);

      this.pedestrianMeshes.set(ped.id, group);
      this.scene.add(group);
    });
  }

  // --- Dynamic Player Vehicle Builder (Motor / Mobil / Sepeda + Karakter Laki/Perempuan) ---
  public updatePlayerVehicle(vehicle: VehicleType, character: CharacterType) {
    this.activeVehicle = vehicle;
    this.activeCharacter = character;
    this.scene.remove(this.playerVehicleGroup);
    this.wheelsToSpin = [];
    this.steerableParts = [];
    this.playerVehicleGroup = this.buildPlayerVehicleGroup(vehicle, character);
    this.scene.add(this.playerVehicleGroup);
  }

  private buildPlayerVehicleGroup(vehicle: VehicleType, character: CharacterType): THREE.Group {
    const root = new THREE.Group();

    const jacketColor = character === 'laki_laki' ? '#16a34a' : '#0d9488';
    const helmetColor = character === 'laki_laki' ? '#22c55e' : '#14b8a6';

    if (vehicle === 'motor') {
      // 1. SKUTER KLASIK BIRU MUDA
      const bodyMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25, metalness: 0.35 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.1, metalness: 0.9 });
      const rubberMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });
      const seatMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });

      const floor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 1.8), bodyMat);
      floor.position.set(0, 0.35, 0);
      floor.castShadow = true;
      root.add(floor);

      const rearCowl = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.9, 12, 16), bodyMat);
      rearCowl.rotation.x = Math.PI / 2;
      rearCowl.position.set(0, 0.65, -0.45);
      rearCowl.castShadow = true;
      root.add(rearCowl);

      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.12), bodyMat);
      apron.position.set(0, 0.85, 0.7);
      apron.rotation.x = -0.15;
      root.add(apron);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.9), seatMat);
      seat.position.set(0, 0.92, -0.25);
      root.add(seat);

      // Rear Wheel
      const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const rWheel = new THREE.Mesh(wheelGeo, rubberMat);
      rWheel.position.set(0, 0.32, -0.65);
      rWheel.castShadow = true;
      root.add(rWheel);
      this.wheelsToSpin.push(rWheel);

      // Front Fork
      const fork = new THREE.Group();
      fork.position.set(0, 0.32, 0.82);

      const fWheel = new THREE.Mesh(wheelGeo, rubberMat);
      fork.add(fWheel);
      this.wheelsToSpin.push(fWheel);

      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8).rotateZ(Math.PI / 2), chromeMat);
      bar.position.set(0, 1.05, 0);
      fork.add(bar);

      const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.15, 12).rotateX(Math.PI / 2), chromeMat);
      headlight.position.set(0, 1.05, 0.14);
      fork.add(headlight);

      const headlampGlow = new THREE.PointLight('#fef08a', 2.0, 25);
      headlampGlow.position.set(0, 1.05, 0.4);
      fork.add(headlampGlow);

      root.add(fork);
      this.steerableParts.push(fork);

      // Character on Scooter
      const rider = this.buildRiderModel(jacketColor, helmetColor, character);
      rider.position.set(0, 0.95, -0.22);
      root.add(rider);

    } else if (vehicle === 'mobil') {
      // 2. MOBIL KOMPAK KOTA INDONESIA
      const carMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.3, metalness: 0.2 });
      const glassMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.8 });
      const rubberMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 });

      const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 3.6), carMat);
      carBody.position.y = 0.75;
      carBody.castShadow = true;
      root.add(carBody);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 2.0), glassMat);
      cabin.position.set(0, 1.5, -0.2);
      root.add(cabin);

      // 4 Wheels
      const carWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
      carWheelGeo.rotateZ(Math.PI / 2);

      const positions = [
        { x: -0.92, z: 1.1 },
        { x: 0.92, z: 1.1 },
        { x: -0.92, z: -1.1 },
        { x: 0.92, z: -1.1 },
      ];

      positions.forEach((wp) => {
        const wheel = new THREE.Mesh(carWheelGeo, rubberMat);
        wheel.position.set(wp.x, 0.38, wp.z);
        wheel.castShadow = true;
        root.add(wheel);
        this.wheelsToSpin.push(wheel);
      });

      // Headlights
      const hlLight = new THREE.PointLight('#fef08a', 2.5, 30);
      hlLight.position.set(0, 0.8, 2.2);
      root.add(hlLight);

      // Driver avatar visible through cabin
      const driver = this.buildRiderModel(jacketColor, helmetColor, character);
      driver.scale.set(0.85, 0.85, 0.85);
      driver.position.set(-0.35, 1.0, -0.15);
      root.add(driver);

    } else {
      // 3. SEPEDA ONTHEL CERIA
      const frameMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.6 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 });
      const rubberMat = new THREE.MeshStandardMaterial({ color: '#0f172a' });

      // Thin wheels
      const bikeWheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
      bikeWheelGeo.rotateZ(Math.PI / 2);

      const rWheel = new THREE.Mesh(bikeWheelGeo, rubberMat);
      rWheel.position.set(0, 0.36, -0.65);
      root.add(rWheel);
      this.wheelsToSpin.push(rWheel);

      const fork = new THREE.Group();
      fork.position.set(0, 0.36, 0.7);
      const fWheel = new THREE.Mesh(bikeWheelGeo, rubberMat);
      fork.add(fWheel);
      this.wheelsToSpin.push(fWheel);

      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8).rotateZ(Math.PI / 2), chromeMat);
      handle.position.set(0, 0.95, 0);
      fork.add(handle);

      root.add(fork);
      this.steerableParts.push(fork);

      // Bicycle tubular frame
      const frameTube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.3), frameMat);
      frameTube.position.set(0, 0.6, 0.05);
      root.add(frameTube);

      // Rider on bicycle
      const cyclist = this.buildRiderModel(jacketColor, helmetColor, character);
      cyclist.position.set(0, 0.85, -0.15);
      root.add(cyclist);
    }

    return root;
  }

  private buildRiderModel(jacketColor: string, helmetColor: string, character: CharacterType): THREE.Group {
    const rider = new THREE.Group();

    const jacketMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.2, metalness: 0.3 });

    // Torso
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.75, 10), jacketMat);
    jacket.position.y = 0.38;
    jacket.rotation.x = 0.15;
    jacket.castShadow = true;
    rider.add(jacket);

    // Legs
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.5, 8), pantsMat);
    thighL.position.set(-0.22, -0.05, 0.2);
    thighL.rotation.x = 0.8;
    rider.add(thighL);

    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.5, 8), pantsMat);
    thighR.position.set(0.22, -0.05, 0.2);
    thighR.rotation.x = 0.8;
    rider.add(thighR);

    // Arms
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8), jacketMat);
    armL.position.set(-0.32, 0.5, 0.4);
    armL.rotation.x = 0.85;
    armL.rotation.z = -0.3;
    rider.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8), jacketMat);
    armR.position.set(0.32, 0.5, 0.4);
    armR.rotation.x = 0.85;
    armR.rotation.z = 0.3;
    rider.add(armR);

    // Helmet & Character Head
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), helmetMat);
    helmet.position.set(0, 0.95, 0.08);
    helmet.castShadow = true;
    rider.add(helmet);

    // Dark Visor
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.255, 16, 8, 0, Math.PI * 0.8, Math.PI * 0.3, Math.PI * 0.4),
      new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.05, metalness: 0.95 })
    );
    visor.position.set(0, 0.95, 0.08);
    visor.rotation.y = -Math.PI * 0.4;
    rider.add(visor);

    // Aksesoris Karakter Perempuan (Siti) - Aksen Pita / Jilbab Ceria
    if (character === 'perempuan') {
      const bow = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.03, 8, 12),
        new THREE.MeshBasicMaterial({ color: '#f43f5e' })
      );
      bow.position.set(0.18, 1.05, 0.05);
      rider.add(bow);
    }

    return rider;
  }

  // --- Checkpoint & Target Markers ---
  private createCheckpointMarker(): THREE.Group {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 3.2, 24),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 2.4, 8),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    cone.rotation.x = Math.PI;
    cone.position.y = 4.5;
    group.add(cone);
    return group;
  }

  private createTargetMarker(): THREE.Group {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.0, 5.0, 32),
      new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.5, 7.0, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: '#facc15', transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    col.position.y = 3.5;
    group.add(col);
    return group;
  }

  // --- Main Update Loop ---
  public update(
    dt: number,
    player: {
      x: number;
      z: number;
      angle: number;
      speed: number;
      turnInput: number;
    },
    trafficLights: TrafficLight[],
    activeCheckpoint: Checkpoint | null,
    targetPoint: { x: number; z: number; radius: number } | null,
    showHintGuidance: boolean,
    clockTime: number
  ) {
    // 1. Player Vehicle Transform & Leaning
    this.playerVehicleGroup.position.set(player.x, 0, player.z);
    this.playerVehicleGroup.rotation.y = -player.angle + Math.PI / 2;

    const lean = -player.turnInput * Math.min(1.0, Math.abs(player.speed) / 10) * 0.2;
    this.playerVehicleGroup.rotation.z = lean;

    // Steering parts
    this.steerableParts.forEach((part) => {
      part.rotation.y = -player.turnInput * 0.45;
    });

    // Wheels rotation
    const spinAmt = player.speed * dt * 3.5;
    this.wheelsToSpin.forEach((w) => {
      w.rotation.x += spinAmt;
    });

    // 2. Camera POV Logic
    const pX = player.x;
    const pZ = player.z;
    const pAngle = player.angle;

    switch (this.cameraMode) {
      case 'third_near': {
        const dist = 6.2;
        const height = 2.8;
        this.targetCameraPos.set(pX - Math.cos(pAngle) * dist, height, pZ - Math.sin(pAngle) * dist);
        this.currentLookAt.set(pX + Math.cos(pAngle) * 3, 1.6, pZ + Math.sin(pAngle) * 3);
        break;
      }
      case 'third_far': {
        const dist = 10.5;
        const height = 4.8;
        this.targetCameraPos.set(pX - Math.cos(pAngle) * dist, height, pZ - Math.sin(pAngle) * dist);
        this.currentLookAt.set(pX + Math.cos(pAngle) * 4, 1.5, pZ + Math.sin(pAngle) * 4);
        break;
      }
      case 'first_person': {
        this.targetCameraPos.set(pX + Math.cos(pAngle) * 0.2, 1.9, pZ + Math.sin(pAngle) * 0.2);
        this.currentLookAt.set(pX + Math.cos(pAngle) * 8, 1.7, pZ + Math.sin(pAngle) * 8);
        break;
      }
      case 'top_down': {
        this.targetCameraPos.set(pX, 32, pZ);
        this.currentLookAt.set(pX, 0, pZ);
        break;
      }
    }

    this.currentCameraPos.lerp(this.targetCameraPos, Math.min(1.0, dt * 7.5));
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.currentLookAt);

    // 3. Traffic Lights Emissive
    trafficLights.forEach((tl) => {
      const meshes = this.trafficLightMeshes.get(tl.id);
      if (!meshes) return;

      const setBulb = (mesh: THREE.Mesh, active: boolean, colorHex: string) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (active) {
          mat.color.set(colorHex);
          mat.emissive.set(colorHex);
          mat.emissiveIntensity = 2.0;
        } else {
          mat.color.set('#1e293b');
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
        }
      };

      setBulb(meshes.red, tl.state === 'red', '#ef4444');
      setBulb(meshes.yellow, tl.state === 'yellow', '#facc15');
      setBulb(meshes.green, tl.state === 'green', '#22c55e');
    });

    // 4. Perlintasan Kereta Api Simulation (Palang Pintu Otomatis & Kereta Melintas)
    this.railwayData.timer -= dt;
    if (this.railwayData.timer <= 0) {
      this.railwayData.trainActive = true;
      this.railwayData.isClosed = true;
      this.railwayData.timer = 24; // Reset every 24 seconds
    }

    if (this.railwayData.trainActive && this.trainGroup) {
      // Kereta api melaju
      this.trainGroup.position.x += dt * 28;
      if (this.trainGroup.position.x > 260) {
        this.trainGroup.position.x = -280;
        this.railwayData.trainActive = false;
        this.railwayData.isClosed = false;
      }
    }

    // Rotasi Palang Pintu Rel (0 = buka, Math.PI / 2 = tutup)
    const targetBarrierAngle = this.railwayData.isClosed ? Math.PI / 2 : 0;
    this.railBarriers.forEach((barrierArm) => {
      barrierArm.rotation.z += (targetBarrierAngle - barrierArm.rotation.z) * Math.min(1.0, dt * 3.5);
    });

    // 5. Dynamic NPC Vehicles Movement
    this.npcVehicles.forEach((npc) => {
      const mesh = this.npcMeshes.get(npc.id);
      if (!mesh) return;

      const dist = npc.speed * dt;
      if (npc.direction === 'east') {
        npc.x += dist;
        if (npc.x > npc.maxCoord) npc.x = npc.minCoord;
        mesh.rotation.y = 0;
      } else if (npc.direction === 'west') {
        npc.x -= dist;
        if (npc.x < npc.minCoord) npc.x = npc.maxCoord;
        mesh.rotation.y = Math.PI;
      } else if (npc.direction === 'south') {
        npc.z += dist;
        if (npc.z > npc.maxCoord) npc.z = npc.minCoord;
        mesh.rotation.y = -Math.PI / 2;
      } else if (npc.direction === 'north') {
        npc.z -= dist;
        if (npc.z < npc.minCoord) npc.z = npc.maxCoord;
        mesh.rotation.y = Math.PI / 2;
      }
      mesh.position.set(npc.x, 0, npc.z);
    });

    // 6. Pedestrians Walking
    PEDESTRIANS_3D.forEach((ped) => {
      const mesh = this.pedestrianMeshes.get(ped.id);
      if (!mesh) return;
      if (ped.direction > 0) {
        ped.x += ped.speed;
        if (ped.x >= ped.targetX) ped.direction = -1;
      } else {
        ped.x -= ped.speed;
        if (ped.x <= ped.startX) ped.direction = 1;
      }
      mesh.position.set(ped.x, 0, ped.z);
      mesh.position.y = Math.abs(Math.sin(clockTime * 8)) * 0.15;
    });

    // 7. Flag waving
    if (this.flagMesh) {
      this.flagMesh.rotation.y = Math.sin(clockTime * 4) * 0.15;
    }

    // 8. Mekanisme Memori: Checkpoint HANYA terlihat jika tombol bantuan ditekan!
    if (activeCheckpoint && showHintGuidance) {
      this.checkpointMarker.visible = true;
      this.checkpointMarker.position.set(activeCheckpoint.x, 0, activeCheckpoint.z);
      const cone = this.checkpointMarker.children[1];
      if (cone) {
        cone.position.y = 4.2 + Math.sin(clockTime * 4) * 0.4;
      }
    } else {
      this.checkpointMarker.visible = false;
    }

    // Target Point B
    if (targetPoint) {
      this.targetMarker.visible = true;
      this.targetMarker.position.set(targetPoint.x, 0, targetPoint.z);
      this.targetMarker.rotation.y += dt * 0.6;
    } else {
      this.targetMarker.visible = false;
    }

    // 9. Animate Traffic Sign Halos & Floating Beacons
    let sIdx = 0;
    this.signHaloMeshes.forEach((item) => {
      sIdx++;
      if (!item.completed) {
        const pulse = 1.0 + Math.sin(clockTime * 4 + sIdx) * 0.08;
        item.ring.scale.set(pulse, pulse, 1);
      }
      item.icon.position.y = 5.8 + Math.sin(clockTime * 3.5 + sIdx) * 0.25;
      item.icon.rotation.y += dt * 1.6;
    });

    // 10. Animate Birds in the Sky
    if (this.birdGroup) {
      this.birdGroup.rotation.y += dt * 0.12;
      this.birdWings.forEach((wing, wIdx) => {
        wing.rotation.z = Math.sin(clockTime * 14 + wIdx) * 0.45;
      });
    }

    // 11. Vehicle Exhaust Smoke Puffs (Optimized Pooling & Shared Geometry)
    if (Math.abs(player.speed) > 1.2 && this.exhaustParticles.length < 8 && Math.random() < 0.25) {
      const puff = new THREE.Mesh(this.sharedExhaustGeo, this.sharedExhaustMat.clone());
      const rearX = player.x - Math.cos(player.angle) * 1.2 + (Math.random() - 0.5) * 0.15;
      const rearZ = player.z - Math.sin(player.angle) * 1.2 + (Math.random() - 0.5) * 0.15;
      puff.position.set(rearX, 0.35, rearZ);
      this.exhaustParticleGroup.add(puff);

      this.exhaustParticles.push({
        mesh: puff,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: 0.7 + Math.random() * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
      });
    }

    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const part = this.exhaustParticles[i];
      part.life += dt;
      if (part.life >= part.maxLife) {
        this.exhaustParticleGroup.remove(part.mesh);
        (part.mesh.material as THREE.Material).dispose();
        this.exhaustParticles.splice(i, 1);
      } else {
        part.mesh.position.x += part.vx * dt;
        part.mesh.position.y += part.vy * dt;
        part.mesh.position.z += part.vz * dt;
        const progress = part.life / part.maxLife;
        part.mesh.scale.setScalar(1 + progress * 1.8);
        (part.mesh.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - progress);
      }
    }

    // 12. Render
    this.renderer.render(this.scene, this.camera);
  }

  public isTrainPassing(): boolean {
    return this.railwayData.isClosed;
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public nextCameraMode(): CameraMode {
    const modes: CameraMode[] = ['third_near', 'third_far', 'first_person', 'top_down'];
    const idx = modes.indexOf(this.cameraMode);
    const next = modes[(idx + 1) % modes.length];
    this.setCameraMode(next);
    return next;
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  };

  public destroy() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
