import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useCurrentPublicBranch } from '@/hooks/useCurrentPublicBranch';

// Top-left wordmark + breadcrumb — the only persistent chrome on the
// public site besides the toolbar (ARCH-SPEC "PUBLIC UI": "keep public UI
// minimal... floating controls rather than traditional dashboard-heavy
// layouts").
export function PublicTopBar() {
  const { code, branch } = useCurrentPublicBranch();

  return (
    <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2">
      <Link
        to="/"
        className="pointer-events-auto rounded-full border border-black/10 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02]"
      >
        <BrandLogo className="h-9 rounded-full px-3" />
      </Link>

      {code && (
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs text-neutral-600 shadow-sm backdrop-blur-sm">
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="font-medium text-neutral-800">{branch?.name ?? code}</span>
        </div>
      )}
    </div>
  );
}
