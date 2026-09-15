import type { Floor } from '@kanan-baroda/shared';
import { apiClient } from '@/lib/apiClient';

export async function listFloors(branchId: string): Promise<Floor[]> {
  const { data } = await apiClient.get<{ floors: Floor[] }>('/admin/floors', { params: { branchId } });
  return data.floors;
}
