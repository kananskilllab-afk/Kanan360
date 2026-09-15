import { Boxes } from 'lucide-react';

export function FloorPlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Floor Plan Management</h2>
        <p className="text-sm text-muted-foreground">Upload and link floor-plan geometry to branch data.</p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Boxes className="h-8 w-8 text-muted-foreground" />
        <p className="max-w-md text-sm text-muted-foreground">
          The SVG/GLB upload workflow and geometry linter (CDR → SVG → GLB → JSON, see the architecture spec's
          FLO·07) ship alongside the 2D and 3D floor-plan engines in Phase 3–4. Branches, floors, and areas can
          already be managed today from each branch's page.
        </p>
      </div>
    </div>
  );
}
