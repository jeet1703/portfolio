// Shared, non-React state that the imperative parts (three.js loops, cable, audio) read every frame.
export const rig = {
  powered: false,
  reduce: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  // phones/tablets: lighter rendering, and touch scrolling is never held back by the wire
  touch: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
  cableStart: null,          // set by the PSU scene: () => {x,y,w} in page px
  rebuildCable: () => {},    // set by <Cable/>
  // scroll steering: where the visitor wants to be. The page follows it, but never past the
  // wire's tip, so you can't outrun the cable. Driven by <Cable/>'s frame loop.
  wantY: null, steerY: 0,
  // ask the page to go somewhere (wheel, nav, dock); it gets there as fast as the wire allows
  scrollTo(y) {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (this.wantY === null) this.steerY = scrollY;
    this.wantY = Math.max(0, Math.min(max, y));
  },
};

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const SECTIONS = [
  { id: 'power', name: 'POWER', nav: 'Power' },
  { id: 'rails', name: 'EXPERIENCE', nav: 'Experience' },
  { id: 'keys', name: 'SKILLS', nav: 'Skills' },
  { id: 'mouse', name: 'PROJECTS', nav: 'Projects' },
  { id: 'post', name: 'RECORD', nav: 'Record' },
  { id: 'contact', name: 'CONTACT', nav: 'Contact' },
];

// handy for poking at the rig from the console while developing
if (import.meta.env.DEV) window.__rig = rig;
