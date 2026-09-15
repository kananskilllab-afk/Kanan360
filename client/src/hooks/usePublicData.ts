// Shared React Query hooks for the public site — used by both the 3D
// scene components (inside <Canvas>) and the floating DOM chrome
// (breadcrumb, floor selector) around it. Same query key from both sides
// means one network request, not two.
import { useQuery } from '@tanstack/react-query';
import {
  getPublicOverview,
  listPublicAreas,
  listPublicBranches,
  listPublicFloors,
} from '@/services/public/publicApi';

export function usePublicOverview() {
  return useQuery({ queryKey: ['public', 'overview'], queryFn: getPublicOverview });
}

export function usePublicBranches() {
  return useQuery({ queryKey: ['public', 'branches'], queryFn: listPublicBranches });
}

export function usePublicFloors(branchId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'floors', branchId],
    queryFn: () => listPublicFloors(branchId as string),
    enabled: !!branchId,
  });
}

export function usePublicAreas(floorId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'areas', floorId],
    queryFn: () => listPublicAreas(floorId as string),
    enabled: !!floorId,
  });
}
