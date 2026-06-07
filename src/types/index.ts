export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface OilWell {
  id: string;
  wellNumber: string;
  name: string;
  position: Position3D;
  productionRate: number;
  waterCut: number;
  dynamicFluidLevel: number;
  pumpEfficiency: number;
  status: 'normal' | 'warning' | 'alarm' | 'maintenance';
  h2sLevel: number;
  ch4Level: number;
  productionHistory: { time: string; value: number }[];
  dynamometerCard: number[];
  lastWaterCut: number;
}

export interface MeteringStation {
  id: string;
  name: string;
  position: Position3D;
  totalLiquid: number;
  avgWaterCut: number;
  lastWaterCut: number;
  connectedWells: string[];
  status: 'normal' | 'warning' | 'alarm';
}

export interface Separator {
  id: string;
  name: string;
  liquidLevel: number;
  pressure: number;
  maxLevel: number;
  isActive: boolean;
  isStandby: boolean;
}

export interface UnionStation {
  id: string;
  name: string;
  position: Position3D;
  separators: Separator[];
  status: 'normal' | 'warning' | 'alarm';
}

export interface PressurePoint {
  id: string;
  position: number;
  pressure: number;
  lastPressure: number;
  isLeak: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  startPoint: Position3D;
  endPoint: Position3D;
  length: number;
  pressurePoints: PressurePoint[];
  status: 'normal' | 'leak' | 'warning';
}

export interface InjectionWell {
  id: string;
  name: string;
  position: Position3D;
  injectionPressure: number;
  injectionRate: number;
  status: 'normal' | 'warning' | 'alarm';
  lastPressure: number;
}

export type AlarmType = 'pump' | 'waterCut' | 'leak' | 'pressure' | 'h2s' | 'ch4' | 'level' | 'injection';
export type AlarmLevel = 'warning' | 'danger' | 'critical';
export type AlarmStatus = 'pending' | 'confirmed' | 'resolved';

export interface Alarm {
  id: string;
  type: AlarmType;
  level: AlarmLevel;
  targetId: string;
  targetName: string;
  message: string;
  timestamp: string;
  status: AlarmStatus;
  workOrderId?: string;
}

export type WorkOrderType = 'maintenance' | 'repair' | 'emergency';
export type WorkOrderStatus = 'pending' | 'inProgress' | 'completed';

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  targetId: string;
  targetName: string;
  description: string;
  assignedTeam: string;
  status: WorkOrderStatus;
  createdAt: string;
  completedAt?: string;
}

export type UserRole = 'worker' | 'leader' | 'manager';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  lastLogin: string;
  avatar?: string;
}

export interface ProductionForecast {
  wellId: string;
  wellName: string;
  historicalData: { date: string; value: number }[];
  forecastData: { date: string; value: number }[];
  isLowProduction: boolean;
  suggestion: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface DailyReportData {
  date: string;
  wellData: {
    wellNumber: string;
    production: number;
    waterCut: number;
    pumpEfficiency: number;
    status: string;
  }[];
  faults: {
    time: string;
    type: string;
    target: string;
    description: string;
  }[];
  environmentEvents: {
    time: string;
    type: string;
    location: string;
    level: string;
  }[];
  totalProduction: number;
  avgWaterCut: number;
  faultCount: number;
  envEventCount: number;
}
