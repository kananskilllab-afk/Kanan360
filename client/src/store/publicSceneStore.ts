import { create } from 'zustand';

export type CameraPreset = 'perspective' | 'top' | 'iso';

// Just the handful of imperative methods every scene component actually
// calls — kept as a local interface instead of importing the full
// `camera-controls` type so this store doesn't need to know which camera
// library drei happens to wrap underneath <CameraControls>.
export interface CameraControlsHandle {
  setLookAt: (
    px: number,
    py: number,
    pz: number,
    tx: number,
    ty: number,
    tz: number,
    enableTransition?: boolean,
  ) => Promise<void>;
  rotateTo: (azimuthAngle: number, polarAngle: number, enableTransition?: boolean) => Promise<void>;
  dolly: (distance: number, enableTransition?: boolean) => Promise<void>;
}

interface PublicSceneState {
  // Registered once by <CameraRig> on mount — every scene component that
  // needs to fly the camera somewhere reads it from here rather than
  // threading a ref through props (ARCH-SPEC "3D FLOOR EXPERIENCE").
  cameraControls: CameraControlsHandle | null;
  setCameraControls: (c: CameraControlsHandle | null) => void;

  hoveredBranchCode: string | null;
  setHoveredBranchCode: (code: string | null) => void;

  hoveredAreaCode: string | null;
  setHoveredAreaCode: (code: string | null) => void;

  selectedAreaCode: string | null;
  setSelectedAreaCode: (code: string | null) => void;

  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;

  showSeats: boolean;
  showLabels: boolean;
  toggleShowSeats: () => void;
  toggleShowLabels: () => void;

  // Bumped by the toolbar's Reset button; the active scene's own
  // establishing-shot effect depends on this and re-runs it rather than
  // the toolbar trying to know scene-specific framing itself.
  resetSignal: number;
  requestReset: () => void;

  // Set by BranchSelectionScene when a clicked building has a real Street
  // View on file (see branchStreetView.ts) — StreetViewReveal.tsx (a
  // <Canvas> sibling, DOM overlays can't live inside R3F) shows the
  // full-screen reveal and navigates to targetPath itself once it's done.
  pendingReveal: { title: string; embedUrl: string; caption: string; targetPath: string } | null;
  setPendingReveal: (reveal: PublicSceneState['pendingReveal']) => void;
}

export const usePublicSceneStore = create<PublicSceneState>((set) => ({
  cameraControls: null,
  setCameraControls: (cameraControls) => set({ cameraControls }),

  hoveredBranchCode: null,
  setHoveredBranchCode: (hoveredBranchCode) => set({ hoveredBranchCode }),

  hoveredAreaCode: null,
  setHoveredAreaCode: (hoveredAreaCode) => set({ hoveredAreaCode }),

  selectedAreaCode: null,
  setSelectedAreaCode: (selectedAreaCode) => set({ selectedAreaCode }),

  cameraPreset: 'perspective',
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),

  showSeats: true,
  showLabels: true,
  toggleShowSeats: () => set((s) => ({ showSeats: !s.showSeats })),
  toggleShowLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  resetSignal: 0,
  requestReset: () => set((s) => ({ resetSignal: s.resetSignal + 1 })),

  pendingReveal: null,
  setPendingReveal: (pendingReveal) => set({ pendingReveal }),
}));
