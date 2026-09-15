// The public site's only data source — every call here hits /api/public/*,
// which requires no auth and never returns employee PII (see the server's
// public.controller.ts). Kept in its own module so it's obvious at a
// glance that nothing in this file can ever need a Bearer token.
import axios from 'axios';
import type { Area, Branch, Floor } from '@kanan-baroda/shared';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

export interface PublicBranch extends Branch {
  totalAreas: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  utilization: number;
}

export interface PublicArea extends Omit<Area, 'departmentId' | 'managerId'> {
  departmentId?: { _id: string; name: string; colorToken: string };
  occupiedSeats: number;
  availableSeats: number;
  utilization: number;
}

export interface PublicOverview {
  totalBranches: number;
  totalFloors: number;
  totalAreas: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  overallUtilization: number;
}

export async function getPublicOverview(): Promise<PublicOverview> {
  const { data } = await publicClient.get<PublicOverview>('/public/overview');
  return data;
}

export async function listPublicBranches(): Promise<PublicBranch[]> {
  const { data } = await publicClient.get<{ branches: PublicBranch[] }>('/public/branches');
  return data.branches;
}

export async function getPublicBranch(id: string): Promise<Branch> {
  const { data } = await publicClient.get<{ branch: Branch }>(`/public/branches/${id}`);
  return data.branch;
}

export async function listPublicFloors(branchId: string): Promise<Floor[]> {
  const { data } = await publicClient.get<{ floors: Floor[] }>('/public/floors', { params: { branchId } });
  return data.floors;
}

export async function listPublicAreas(floorId: string): Promise<PublicArea[]> {
  const { data } = await publicClient.get<{ areas: PublicArea[] }>('/public/areas', { params: { floorId } });
  return data.areas;
}

// The lookup a 3D scene click resolves through — see ARCH-SPEC IDX·03.
export async function getPublicAreaByCode(areaCode: string): Promise<PublicArea> {
  const { data } = await publicClient.get<{ area: PublicArea }>(`/public/areas/code/${areaCode}`);
  return data.area;
}
