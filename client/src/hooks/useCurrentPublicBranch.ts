import { useParams, useSearchParams } from 'react-router-dom';
import { usePublicBranches, usePublicFloors } from '@/hooks/usePublicData';

// Resolves the branch + active floor for the current /branch/:code URL.
// Used by both the 3D scene (PublicBranch) and the floating DOM chrome
// (breadcrumb, floor selector) so route parsing lives in exactly one
// place and both sides always agree on "where we are."
export function useCurrentPublicBranch() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();

  const { data: branches } = usePublicBranches();
  const branch = branches?.find((b) => b.code.toLowerCase() === code?.toLowerCase());

  const { data: floors } = usePublicFloors(branch?._id);
  const requestedFloor = searchParams.get('floor');
  const activeFloor = floors?.find((f) => String(f.floorNumber) === requestedFloor) ?? floors?.[0];

  return { code, branch, floors, activeFloor };
}
