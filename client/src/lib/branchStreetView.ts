// Real-world Street View embeds for branches with one on file, keyed by
// branch code. Clicking a landing-page building for a branch listed here
// gets a full-screen reveal of the actual building before the camera
// carries into its 3D floor (see StreetViewReveal.tsx) -- branches
// without an entry navigate straight in, no reveal step.
export interface BranchStreetView {
  embedUrl: string;
  caption: string;
  // Which floor the reveal should land on -- Iscon Janmahaal's digitized
  // floor is its 2nd, not the default first floor every other branch opens.
  floorNumber?: number;
}

export const BRANCH_STREET_VIEW: Record<string, BranchStreetView> = {
  VAD05: {
    embedUrl:
      'https://www.google.com/maps/embed?pb=!4v1789467508837!6m8!1m7!1sbCoS7s-hO1xxi8gz63vW2w!2m2!1d22.31118588861243!2d73.1817828085798!3f11.703036405891211!4f28.555180528453505!5f0.7820865974627469',
    caption: '255-256, 2nd Floor, Iscon Janmahaal Complex, Sayajigunj, Vadodara',
    floorNumber: 2,
  },
};
