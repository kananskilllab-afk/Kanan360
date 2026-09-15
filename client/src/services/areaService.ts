import type { Area, Employee } from '@kanan-baroda/shared';
import { apiClient } from '@/lib/apiClient';

export interface AreaWithOccupancy extends Area {
  occupiedSeats: number;
  availableSeats: number;
  utilization: number;
}

export async function listAreas(params: { floorId?: string; branchId?: string }): Promise<AreaWithOccupancy[]> {
  const { data } = await apiClient.get<{ areas: AreaWithOccupancy[] }>('/admin/areas', { params });
  return data.areas;
}

export async function getArea(id: string): Promise<{ area: AreaWithOccupancy; employees: Employee[] }> {
  const { data } = await apiClient.get(`/admin/areas/${id}`);
  return data;
}

// The lookup the future 2D/3D floor-plan renderers will call on a click —
// see ARCH-SPEC IDX·03. Exposed now so it's ready the moment Phase 3/4
// wires a real SVG/GLB id into it.
export async function getAreaByCode(areaCode: string): Promise<{ area: AreaWithOccupancy; employees: Employee[] }> {
  const { data } = await apiClient.get(`/admin/areas/code/${areaCode}`);
  return data;
}
