import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCurrentPublicBranch } from '@/hooks/useCurrentPublicBranch';

export function PublicFloorSelector() {
  const { code, branch, floors, activeFloor } = useCurrentPublicBranch();
  const navigate = useNavigate();

  if (!code || !floors || floors.length < 2) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
        {floors.map((floor) => (
          <button
            key={floor._id}
            onClick={() => navigate(`/branch/${branch?.code ?? code}?floor=${floor.floorNumber}`)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeFloor?._id === floor._id
                ? 'bg-[#8a4e1a] text-white'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            {floor.name}
          </button>
        ))}
      </div>
    </div>
  );
}
