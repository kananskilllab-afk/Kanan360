import { apiClient } from '@/lib/apiClient';

export interface OverviewStats {
  totalBranches: number;
  totalFloors: number;
  totalAreas: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  totalOfficeAreaSqFt: number;
  usedAreaSqFt: number;
  availableAreaSqFt: number;
  overallUtilization: number;
  seatsByStatus: Record<'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'NOT_ASSIGNED', number>;
}

export interface BranchAnalyticsRow {
  branchId: string;
  code: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  totalAreaSqFt: number;
  utilization: number;
}

export interface DepartmentUtilizationRow {
  departmentId: string;
  name: string;
  colorToken: string;
  areaSqFt: number;
  utilization: number;
}

export async function getOverview(): Promise<OverviewStats> {
  const { data } = await apiClient.get<OverviewStats>('/admin/analytics/overview');
  return data;
}

export async function getBranchAnalytics(): Promise<BranchAnalyticsRow[]> {
  const { data } = await apiClient.get<{ branches: BranchAnalyticsRow[] }>('/admin/analytics/branches');
  return data.branches;
}

export async function getUtilization(params: {
  branchId?: string;
  floorId?: string;
}): Promise<{ departments: DepartmentUtilizationRow[] }> {
  const { data } = await apiClient.get('/admin/analytics/utilization', { params });
  return data;
}
