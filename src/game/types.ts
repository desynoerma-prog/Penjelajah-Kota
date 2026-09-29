export type CameraMode = 'third_near' | 'third_far' | 'first_person' | 'top_down';

export type CharacterType = 'laki_laki' | 'perempuan';

export interface CharacterConfig {
  id: CharacterType;
  name: string;
  avatar: string;
  title: string;
  description: string;
  jacketColor: string;
  helmetColor: string;
  badge: string;
}

export type VehicleType = 'motor' | 'mobil' | 'sepeda';

export interface VehicleConfig {
  id: VehicleType;
  name: string;
  tagline: string;
  maxSpeed: number; // in m/s simulation units
  acceleration: number;
  brakeDecel: number;
  turnSpeed: number;
  icon: string;
  color: string;
  description: string;
  width: number;
  length: number;
}

export type TrafficLightColor = 'red' | 'yellow' | 'green';

export interface TrafficLight {
  id: string;
  x: number;
  z: number;
  roadDirection: 'h' | 'v';
  facing: 'left' | 'right' | 'up' | 'down';
  state: TrafficLightColor;
  timer: number;
  redDuration: number;
  yellowDuration: number;
  greenDuration: number;
  stopLineZ?: number;
  stopLineX?: number;
}

export type SignType =
  | 'stop'
  | 'traffic_light'
  | 'no_right_turn'
  | 'no_entry'
  | 'zebra'
  | 'school_zone'
  | 'railway'
  | 'guide';

export interface SignQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  curriculumConcept: string;
}

export interface TrafficSign {
  id: string;
  x: number;
  z: number;
  type: SignType;
  title: string;
  description: string;
  meaning: string;
  rotation?: number;
  radius: number;
  quiz?: SignQuiz;
}

export interface Building {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type:
    | 'school'
    | 'house'
    | 'library'
    | 'clinic'
    | 'market'
    | 'townhall'
    | 'park'
    | 'mosque'
    | 'police'
    | 'shop'
    | 'supermarket'
    | 'station';
  name: string;
  subname?: string;
  color: string;
  roofColor: string;
  badgeIcon: string;
}

export interface RoadSegment {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  name: string;
  direction: 'h' | 'v';
}

export interface ZebraCrossing {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  orientation: 'h' | 'v';
  name: string;
}

export interface Pedestrian3D {
  id: string;
  x: number;
  z: number;
  startX: number;
  startZ: number;
  targetX: number;
  targetZ: number;
  speed: number;
  direction: 1 | -1;
  name: string;
  color: string;
}

export interface NPCVehicle3D {
  id: string;
  type: 'car' | 'motor' | 'angkot' | 'truck';
  color: string;
  x: number;
  z: number;
  speed: number;
  direction: 'north' | 'south' | 'east' | 'west';
  minCoord: number;
  maxCoord: number;
}

export interface RailwayCrossing {
  id: string;
  x: number;
  z: number;
  isClosed: boolean;
  barrierAngle: number;
  trainActive: boolean;
  trainX: number;
  timer: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  z: number;
  radius: number;
  instructionText: string;
  subHint: string;
  completed: boolean;
  streetName?: string;
  requiredRule?: 'turn_left' | 'turn_right' | 'straight' | 'stop_line' | 'zebra_yield';
}

export interface Mission {
  id: number;
  title: string;
  locationFrom: string;
  locationTo: string;
  storyDescription: string;
  curriculumTopic: string;
  startPoint: { x: number; z: number; angle: number };
  targetPoint: { x: number; z: number; radius: number; label: string };
  checkpoints: Checkpoint[];
  targetTimeSeconds: number;
  routeRoadNames: string[];
}

export interface FeedbackNotice {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: number;
}
