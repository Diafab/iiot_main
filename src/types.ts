export type MachineState = "TRABAJANDO" | "DETENIDA" | "MANTENIMIENTO" | "FALLA" | "CORTE ENERGIA";

export interface LiveMachineData {
  state: MachineState;
  gsm: boolean;
  wifi: boolean;
  power: boolean;
  updatedAt: number;
  source: string;
}

export type EventType = "TECHNICIAN_CALL" | "INTERVENTION_STARTED" | "POWER_OUTAGE";

export interface LatestEventData {
  id?: string;
  type: EventType;
  state: string;
  active: boolean;
  smsSent: boolean;
  timestamp: number;
  source: string;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export interface HistoricalEvent extends LatestEventData {
  id: string;
}

export type UserRole = "admin" | "maintenance_manager" | "technician" | "production_manager";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
  lastLogin: number;
}

export type InterventionType = "CORRECTIVA" | "PREVENTIVA" | "PREDICTIVA" | "EMERGENCIA";

export interface InterventionRecord {
  id?: string;
  technician: string;
  technicianUid?: string;
  cause: string;
  interventionType: InterventionType;
  replacedPart: string;
  observations: string;
  startTime: string; // ISO string or format "YYYY-MM-DD THH:mm"
  endTime: string;   // ISO string or format "YYYY-MM-DD THH:mm"
  createdAt: number;
  machineId: string;
}

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingVars: string[];
}
