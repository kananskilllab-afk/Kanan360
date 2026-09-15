import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublicSceneStore } from '@/store/publicSceneStore';

// How long the panorama stays on screen once it's actually visible --
// measured from the iframe's load event, not from the click, so slow
// network doesn't eat into how long the user actually gets to see it.
const HOLD_MS = 4200;
// If the iframe never fires `load` (blocked, very slow connection), don't
// get stuck on a black screen forever.
const LOAD_FALLBACK_MS = 3000;

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [reveal]);

  useEffect(() => {
    if (!reveal) return;
    const fallback = setTimeout(() => setLoaded(true), LOAD_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [reveal]);

  useEffect(() => {
    if (!reveal || !loaded) return;
    const timer = setTimeout(() => {
      navigate(reveal.targetPath);
      setPendingReveal(null);
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [reveal, loaded, navigate, setPendingReveal]);

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
            transition={{ duration: (HOLD_MS + LOAD_FALLBACK_MS) / 1000, ease: 'easeOut' }}
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
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
