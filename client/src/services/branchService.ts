import type { Branch } from '@kanan-baroda/shared';
import { apiClient } from '@/lib/apiClient';

export interface BranchWithStats extends Branch {
  totalAreas: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  utilization: number;
}

export async function listBranches(): Promise<BranchWithStats[]> {
  const { data } = await apiClient.get<{ branches: BranchWithStats[] }>('/admin/branches');
  return data.branches;
}

export async function getBranch(id: string): Promise<Branch> {
  const { data } = await apiClient.get<{ branch: Branch }>(`/admin/branches/${id}`);
  return data.branch;
}

export interface BranchInput {
  code: string;
  name: string;
  location: string;
  address: string;
}

export async function createBranch(input: BranchInput): Promise<Branch> {
  const { data } = await apiClient.post<{ branch: Branch }>('/admin/branches', input);
  return data.branch;
}

export async function updateBranch(id: string, input: Partial<BranchInput>): Promise<Branch> {
  const { data } = await apiClient.put<{ branch: Branch }>(`/admin/branches/${id}`, input);
  return data.branch;
}

export async function deactivateBranch(id: string): Promise<void> {
  await apiClient.delete(`/admin/branches/${id}`);
}
