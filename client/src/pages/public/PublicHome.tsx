import { BranchSelectionScene } from '@/three/BranchSelectionScene';
import { usePublicBranches } from '@/hooks/usePublicData';

// Pure 3D content — rendered inside <PublicLayout>'s <Canvas> via the
// router's Outlet. No DOM here; floating UI lives in PublicLayout as a
// sibling of the canvas, not a child of it.
export function PublicHome() {
  const { data: branches } = usePublicBranches();
  if (!branches?.length) return null;
  return <BranchSelectionScene branches={branches} />;
}
