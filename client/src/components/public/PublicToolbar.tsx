import { useState } from 'react';
import {
  Box,
  Grid2x2,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Armchair,
  Tag,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePublicSceneStore, type CameraPreset } from '@/store/publicSceneStore';

const PRESETS: Record<CameraPreset, { azimuth: number; polar: number; icon: typeof Box; label: string }> = {
  perspective: { azimuth: 0.55, polar: 1.0, icon: Box, label: 'Perspective view' },
  top: { azimuth: 0, polar: 0.02, icon: Grid2x2, label: 'Top view' },
  iso: { azimuth: Math.PI / 4, polar: 0.85, icon: Layers, label: 'Isometric view' },
};

// Floating bottom-right controls — the only other persistent chrome on
// the public site (ARCH-SPEC "FLOOR PLAN TOOLBAR" / "PUBLIC UI").
export function PublicToolbar() {
  const cameraControls = usePublicSceneStore((s) => s.cameraControls);
  const cameraPreset = usePublicSceneStore((s) => s.cameraPreset);
  const setCameraPreset = usePublicSceneStore((s) => s.setCameraPreset);
  const requestReset = usePublicSceneStore((s) => s.requestReset);
  const showSeats = usePublicSceneStore((s) => s.showSeats);
  const toggleShowSeats = usePublicSceneStore((s) => s.toggleShowSeats);
  const showLabels = usePublicSceneStore((s) => s.showLabels);
  const toggleShowLabels = usePublicSceneStore((s) => s.toggleShowLabels);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function applyPreset(preset: CameraPreset) {
    setCameraPreset(preset);
    const { azimuth, polar } = PRESETS[preset];
    cameraControls?.rotateTo(azimuth, polar, true);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }

  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-10 flex flex-col items-end gap-2">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-black/10 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
        {(Object.keys(PRESETS) as CameraPreset[]).map((preset) => {
          const { icon: Icon, label } = PRESETS[preset];
          return (
            <ToolButton key={preset} label={label} active={cameraPreset === preset} onClick={() => applyPreset(preset)}>
              <Icon className="h-4 w-4" />
            </ToolButton>
          );
        })}

        <div className="mx-0.5 h-5 w-px bg-black/10" />

        <ToolButton label="Toggle seats" active={showSeats} onClick={toggleShowSeats}>
          <Armchair className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Toggle labels" active={showLabels} onClick={toggleShowLabels}>
          <Tag className="h-4 w-4" />
        </ToolButton>

        <div className="mx-0.5 h-5 w-px bg-black/10" />

        <ToolButton label="Zoom in" onClick={() => cameraControls?.dolly(2, true)}>
          <ZoomIn className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Zoom out" onClick={() => cameraControls?.dolly(-2, true)}>
          <ZoomOut className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Reset camera" onClick={requestReset}>
          <RotateCcw className="h-4 w-4" />
        </ToolButton>
        <ToolButton label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            active ? 'bg-[#8a4e1a] text-white' : 'text-neutral-600 hover:bg-neutral-100',
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
