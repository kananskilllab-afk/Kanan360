import { AnimatePresence, motion } from 'framer-motion';
import { X, Ruler, Armchair, Users, Building2 } from 'lucide-react';
import { usePublicAreas } from '@/hooks/usePublicData';
import { useCurrentPublicBranch } from '@/hooks/useCurrentPublicBranch';
import { usePublicSceneStore } from '@/store/publicSceneStore';

const TYPE_LABELS: Record<string, string> = {
  CABIN: 'Cabin',
  OPEN_WORKSPACE: 'Open Workspace',
  MEETING_ROOM: 'Meeting Room',
  RECEPTION: 'Reception',
  DEPARTMENT_ZONE: 'Department Zone',
  UTILITY: 'Utility',
  CAFETERIA: 'Cafeteria',
  OTHER: 'Other',
};

// The floating panel a 3D area click opens — see ARCH-SPEC "AREA
// INTERACTION". Reads from the same cached query FloorScene already
// populated (same key, via usePublicAreas), so opening it never fires a
// second network request. Deliberately shows only what's "permitted area
// information" for a public visitor: no employee names.
export function PublicAreaPanel() {
  const { branch, activeFloor } = useCurrentPublicBranch();
  const selectedAreaCode = usePublicSceneStore((s) => s.selectedAreaCode);
  const setSelectedAreaCode = usePublicSceneStore((s) => s.setSelectedAreaCode);
  const { data: areas } = usePublicAreas(activeFloor?._id);

  const area = areas?.find((a) => a.areaCode === selectedAreaCode);

  return (
    <AnimatePresence>
      {area && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pointer-events-auto absolute right-5 top-1/2 z-10 w-80 -translate-y-1/2 overflow-hidden rounded-xl border border-black/10 bg-white/95 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-black/5 p-4">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-semibold text-neutral-900">{area.name}</h3>
              <p className="font-mono text-[11px] text-neutral-500">{area.areaCode}</p>
            </div>
            <button
              onClick={() => setSelectedAreaCode(null)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <Field label="Area Type" value={TYPE_LABELS[area.type] ?? area.type} />
              <Field label="Department" value={area.departmentId?.name ?? '—'} />
              <Field label="Floor" value={activeFloor?.name ?? '—'} />
              <Field label="Branch" value={branch?.name ?? '—'} />
            </dl>

            <div className="grid grid-cols-3 gap-2 rounded-lg bg-neutral-50 p-3 text-center">
              <MiniStat icon={Ruler} value={area.areaSqFt.toLocaleString('en-IN')} label="Sq. Ft." />
              <MiniStat icon={Armchair} value={area.seatingCapacity} label="Capacity" />
              <MiniStat icon={Users} value={area.occupiedSeats} label="Occupied" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Utilization</span>
                <span className="font-mono font-semibold text-neutral-800">{area.utilization}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-[#8a4e1a] transition-all"
                  style={{ width: `${Math.min(area.utilization, 100)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500">{area.availableSeats} of {area.seatingCapacity} seats available</p>
            </div>

            {branch && (
              <a
                href={`/admin/branches/${branch._id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600"
              >
                <Building2 className="h-3 w-3" />
                Managed in the admin console
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-neutral-400">{label}</dt>
      <dd className="truncate font-medium text-neutral-800">{value}</dd>
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof Ruler; value: string | number; label: string }) {
  return (
    <div>
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-neutral-400" />
      <div className="font-mono text-sm font-semibold text-neutral-800">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-neutral-400">{label}</div>
    </div>
  );
}
