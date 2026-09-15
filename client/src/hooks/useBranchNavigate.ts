import { useNavigate } from 'react-router-dom';
import type { PublicBranch } from '@/services/public/publicApi';
import { usePublicSceneStore } from '@/store/publicSceneStore';
import { BRANCH_STREET_VIEW } from '@/lib/branchStreetView';

// The one way anything on the public site (a map pin, a 3D building) sends
// the user into a branch: if it has a Street View on file, play the
// full-screen reveal first (StreetViewReveal.tsx navigates itself once
// done); otherwise jump straight to its floor page.
export function useBranchNavigate() {
  const navigate = useNavigate();
  const setPendingReveal = usePublicSceneStore((s) => s.setPendingReveal);

  return function goToBranch(branch: PublicBranch) {
    const streetView = BRANCH_STREET_VIEW[branch.code];
    const targetPath = streetView?.floorNumber
      ? `/branch/${branch.code}?floor=${streetView.floorNumber}`
      : `/branch/${branch.code}`;

    if (streetView) {
      setPendingReveal({ title: branch.name, embedUrl: streetView.embedUrl, caption: streetView.caption, targetPath });
      return;
    }
    navigate(targetPath);
  };
}
