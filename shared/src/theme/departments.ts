// Department color tokens — same pattern as status.ts. A department's
// chip, its chart series, and its floor-plan tint all read from here
// instead of each feature picking its own hue.
export const DEPARTMENT_PALETTE = [
  '--dept-1',
  '--dept-2',
  '--dept-3',
  '--dept-4',
  '--dept-5',
  '--dept-6',
  '--dept-7',
] as const;

export type DepartmentColorToken = (typeof DEPARTMENT_PALETTE)[number];
