export type UserRole = 'admin' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Tractor {
  id: string;
  patrimony: string;
  brand: string;
  model: string;
  year: number;
  power: number;
  hourmeter: number;
  tankCapacity: number;
  serialNumber: string;
  chassis: string;
  farm: string;
  sector: string;
  status: 'active' | 'maintenance' | 'inactive';
  photos?: string[];
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tire {
  id: string;
  tractorId: string;
  position: 'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight';
  brand: string;
  model: string;
  size: string;
  recommendedPressure: number;
  currentPressure: number;
  lifespan: number;
  installationDate: Date;
  status: 'good' | 'warning' | 'critical';
}

export interface Refuel {
  id: string;
  date: Date;
  tractorId: string;
  operatorId: string;
  initialHourmeter: number;
  finalHourmeter: number;
  liters: number;
  dieselPrice: number;
  observation?: string;
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'nok';
  notes?: string;
}

export interface Checklist {
  id: string;
  date: Date;
  tractorId: string;
  operatorId: string;
  items: ChecklistItem[];
  result: 'approved' | 'approved_with_reservations' | 'rejected';
  observations?: string;
  photos?: string[];
  signature?: string;
  createdAt: Date;
}

export interface Maintenance {
  id: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'oil_change' | 'filter_change' | 'lubrication' | 'general_review';
  tractorId: string;
  responsibleId: string;
  description: string;
  parts?: string[];
  value: number;
  nextReview?: Date;
  status: 'scheduled' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface DashboardStats {
  activeTractors: number;
  todayConsumption: number;
  tiresWithAlert: number;
  inMaintenance: number;
  pendingChecklists: number;
  monthlyDieselCost: number;
  fleetEfficiency: number;
  activeOperators: number;
}
