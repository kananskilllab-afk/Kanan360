// Shared enums — imported by both /client and /server so a status string
// can never drift between the two (see ARCH-SPEC IDX·03 / DAT·02).

// Exactly two access states — no ADMIN/MANAGER/VIEWER/registration. The
// public site needs no account at all; every authenticated request is, by
// construction, the one Super Admin.
export const ROLES = ['SUPER_ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const BRANCH_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type BranchStatus = (typeof BRANCH_STATUSES)[number];

export const FLOOR_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type FloorStatus = (typeof FLOOR_STATUSES)[number];

export const AREA_TYPES = [
  'CABIN',
  'OPEN_WORKSPACE',
  'MEETING_ROOM',
  'RECEPTION',
  'DEPARTMENT_ZONE',
  'UTILITY',
  'CAFETERIA',
  'OTHER',
] as const;
export type AreaType = (typeof AREA_TYPES)[number];

export const AREA_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type AreaStatus = (typeof AREA_STATUSES)[number];

export const SEAT_STATUSES = [
  'AVAILABLE',
  'OCCUPIED',
  'RESERVED',
  'MAINTENANCE',
  'NOT_ASSIGNED',
] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const EMPLOYEE_STATUSES = ['ACTIVE', 'ON_LEAVE', 'RELOCATED', 'INACTIVE'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const AUDIT_ACTIONS = [
  'BRANCH_CREATE',
  'BRANCH_UPDATE',
  'BRANCH_DEACTIVATE',
  'FLOOR_CREATE',
  'FLOOR_UPDATE',
  'AREA_CREATE',
  'AREA_UPDATE',
  'AREA_DEACTIVATE',
  'SEAT_CREATE',
  'SEAT_ASSIGN',
  'SEAT_UNASSIGN',
  'EMPLOYEE_CREATE',
  'EMPLOYEE_UPDATE',
  'EMPLOYEE_MOVE',
  'DEPARTMENT_CREATE',
  'DEPARTMENT_UPDATE',
  'ASSET_UPLOAD',
  'SETTINGS_UPDATE',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
