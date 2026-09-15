// Wire-format types — the shape the API returns as JSON. These mirror the
// Mongoose schemas in /server but use plain `string` ids (never ObjectId)
// since that's what actually crosses the HTTP boundary. Client and server
// both import from here so a field can never silently rename on one side.

import type {
  AreaStatus,
  AreaType,
  AuditAction,
  BranchStatus,
  EmployeeStatus,
  FloorStatus,
  Role,
  SeatStatus,
} from './enums.js';

export interface Branch {
  _id: string;
  code: string;
  name: string;
  location: string;
  address: string;
  geo?: { lat: number; lng: number };
  totalFloors: number;
  totalAreaSqFt: number;
  thumbnailUrl?: string;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  _id: string;
  branchId: string;
  name: string;
  floorNumber: number;
  totalAreaSqFt: number;
  floorPlan2DUrl?: string;
  floorPlan3DUrl?: string;
  floorPlanMetaVersion?: string;
  status: FloorStatus;
}

// Present only for areas digitized from a real architectural drawing —
// see the `layout` field comment on the server's Area model.
export interface AreaLayout {
  x: number;
  z: number;
  widthFt: number;
  depthFt: number;
}

export interface Area {
  _id: string;
  branchId: string;
  floorId: string;
  areaCode: string;
  name: string;
  type: AreaType;
  departmentId?: string;
  areaSqFt: number;
  seatingCapacity: number;
  geometryId: string;
  layout?: AreaLayout;
  managerId?: string;
  status: AreaStatus;
}

export interface Seat {
  _id: string;
  branchId: string;
  floorId: string;
  areaId: string;
  seatCode: string;
  geometryId: string;
  position: { x: number; y: number; z?: number };
  status: SeatStatus;
  employeeId?: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  branchId: string;
  floorId: string;
  areaId: string;
  seatId?: string;
  managerId?: string;
  status: EmployeeStatus;
  joiningDate: string;
  profileImageUrl?: string;
  isDemoData?: boolean;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  headOfDepartmentId?: string;
  colorToken: string;
  branchIds: string[];
}

// The single Super Admin identity — there is exactly one of these, created
// once by the seed script. No registration flow creates more.
export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AssignmentHistoryEntry {
  _id: string;
  employeeId: string;
  from: { branchId?: string; floorId?: string; areaId?: string; seatId?: string };
  to: { branchId?: string; floorId?: string; areaId?: string; seatId?: string };
  movedAt: string;
  movedBy: string;
  reason?: string;
}

export interface AuditLogEntry {
  _id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}
