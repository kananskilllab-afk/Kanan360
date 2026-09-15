import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublicSceneStore } from '@/store/publicSceneStore';

const REVEAL_MS = 2800;

// A brief full-screen look at the real building's Street View before the
// camera carries into its 3D floor — see branchStreetView.ts for which
// branches have one on file, and BranchSelectionScene.tsx for where this
// gets triggered. Rendered as a <Canvas> sibling in PublicLayout (DOM
// overlays can't live inside the R3F tree), driven entirely by the
// `pendingReveal` store slot so any scene component can trigger it.
export function StreetViewReveal() {
  const reveal = usePublicSceneStore((s) => s.pendingReveal);
  const setPendingReveal = usePublicSceneStore((s) => s.setPendingReveal);
  const navigate = useNavigate();

  useEffect(() => {
    if (!reveal) return;
    const timer = setTimeout(() => {
      navigate(reveal.targetPath);
      setPendingReveal(null);
    }, REVEAL_MS);
    return () => clearTimeout(timer);
  }, [reveal, navigate, setPendingReveal]);

  return (
    <AnimatePresence>
      {reveal && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.iframe
            key={reveal.embedUrl}
            title="Street View of the branch building"
            src={reveal.embedUrl}
            className="pointer-events-none h-full w-full"
            style={{ border: 0 }}
            initial={{ scale: 1.18 }}
            animate={{ scale: 1 }}
            transition={{ duration: REVEAL_MS / 1000, ease: 'easeOut' }}
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/75 to-transparent px-6 pb-8 pt-16 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="font-heading text-lg text-white">{reveal.title}</p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-white/65">{reveal.caption}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
