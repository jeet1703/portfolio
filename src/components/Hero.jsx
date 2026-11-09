import { useEffect, useRef, useState } from 'react';
import { createPsu } from '../rig/three/psu';
import { BOOT_LINES } from '../rig/data';
import { rig } from '../rig/bus';
import S from '../rig/sound';

/** Work out where the CLICK HERE label goes so it never covers the PSU itself. */
function placeCallout({ sw, box, W, H }) {
  const LW = W < 420 ? 140 : 156, LH = 48, pad = 6; // room the label needs (it sizes to its text)
  const fits = c => c.x >= pad && c.y >= pad && c.x + LW <= W - pad && c.y + LH <= H - pad;
  const cands = [
    { x: Math.min(W - LW - pad, sw.x - LW / 2), y: box.t - LH - 16 }, // on top of the PSU
    { x: box.r + 18, y: sw.y - LH / 2 },                           // to the right of it
    { x: Math.min(W - LW - pad, sw.x + 4), y: box.b + 16 },          // under it, by the switch
  ];
  let c = cands.find(fits);
  if (!c) { c = { ...cands[0] }; c.x = Math.max(pad, Math.min(W - LW - pad, c.x)); c.y = Math.max(pad, Math.min(H - LH - pad, c.y)); }
  // arrow: from the label edge nearest the switch to just outside the pulsing ring
  const ax = Math.max(c.x + 12, Math.min(c.x + LW - 12, sw.x)), ay = sw.y < c.y ? c.y : sw.y > c.y + LH ? c.y + LH : c.y + LH / 2;
  const dx = sw.x - ax, dy = sw.y - ay, len = Math.hypot(dx, dy) || 1;
  const ex = sw.x - dx / len * 24, ey = sw.y - dy / len * 24;
  const bend = Math.min(40, len * .3);
  const qx = (ax + ex) / 2 - dy / len * bend, qy = (ay + ey) / 2 + dx / len * bend;
  const ang = Math.atan2(ey - qy, ex - qx), hd = 9;
  const head = [ang + 2.6, ang - 2.6].map(a => P(ex + Math.cos(a) * hd, ey + Math.sin(a) * hd));
  const arrowLong = len > 34;
  return {
    ring: { left: sw.x, top: sw.y },
    label: { left: c.x, top: c.y },
    arrow: arrowLong ? `M${P(ax, ay)} Q${P(qx, qy)} ${P(ex, ey)}` : '',
    head: arrowLong ? `M${head[0]} L${P(ex, ey)} L${head[1]}` : '',
  };
}
const P = (a, b) => Math.round(a) + ' ' + Math.round(b);

export default function Hero({ powered, onToggle, nudgeN, has3d }) {
  const host = useRef(null);
  const [lay, setLay] = useState(null);
  const [lines, setLines] = useState([]);
  const [shake, setShake] = useState(false);
  const api = useRef(null), firstPower = useRef(true);
  const toggleRef = useRef(onToggle);
  useEffect(() => { toggleRef.current = onToggle; }, [onToggle]);

  useEffect(() => {
    if (!has3d) return;
    let dead = false;
    document.fonts.ready.then(() => {
      if (dead) return;
      api.current = createPsu(host.current, { onToggle: () => toggleRef.current(), onLayout: l => setLay(placeCallout(l)) });
    });
    return () => { dead = true; api.current?.dispose(); api.current = null; };
  }, [has3d]);

  // boot log types out after power-on
  useEffect(() => {
    if (!powered) return;
    let i = 0;
    const step = () => {
      if (i >= BOOT_LINES.length) return false;
      const n = ++i; setLines(BOOT_LINES.slice(0, n)); S.tick(); return true;
    };
    if (rig.reduce) { const t = setTimeout(() => setLines(BOOT_LINES)); return () => clearTimeout(t); }
    let id = 0;
    const t0 = setTimeout(() => { setLines([]); step(); id = setInterval(() => { if (!step()) clearInterval(id); }, 230); });
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [powered]);

  // every power flip makes the PSU hop and send shockwaves out
  useEffect(() => {
    if (firstPower.current) { firstPower.current = false; return; }
    api.current?.kick(powered);
  }, [powered]);
  useEffect(() => { api.current?.setBoot(lines); }, [lines]);

  useEffect(() => {
    if (!nudgeN) return;
    const r = requestAnimationFrame(() => setShake(true));
    const t = setTimeout(() => setShake(false), 520);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  }, [nudgeN]);

  return (
    <section id="power" data-name="POWER">
      <div className="wrap hero">
        <div>
          <div className="tag">01 · Power supply</div>
          <h1>Prabhjeet<br />Singh. <span className="hl">I keep things running.</span></h1>
          <p className="sub">Software engineer. I build the backend nobody notices until it goes down, so I make sure it doesn't.</p>
          <div className="badges">
            <span className="badge solid"><i></i>Open to work · joins immediately</span>
            <span className="badge">Delhi NCR · Remote</span>
            <span className="badge">Java · Spring Boot · Go · Node.js</span>
          </div>
          <div className="hint">
            <button className="pwr" onClick={onToggle}>{powered ? 'Power off' : 'Power on'}</button>
            {powered
              ? <span>Now scroll. The cable will follow you down.</span>
              : <span>or flip the switch on the PSU<span className="kbd-only"> · <kbd>Space</kbd></span></span>}
          </div>
          <p className="sndnote">Turn your sound on. This rig hums.</p>
        </div>

        <div className="psu-wrap">
          <div id="psu3d" ref={host} aria-label="3D power supply. Click it to switch the page on." role="img"></div>
          <div className="psu" aria-hidden="true"><div className="fan2"></div></div>
          <div className={'bootlog' + (has3d ? ' b3d' : '')} aria-live="polite">
            {lines.map(([a, b]) => <div key={a}>{a} <span className="ok">{b}</span></div>)}
          </div>
          {lay && (
            <div className={'clickhere ready' + (shake ? ' nudge' : '')} aria-hidden="true">
              <div className="ch-rings" style={lay.ring}><div className="ring"></div><div className="ring r2"></div></div>
              <svg className="ch-arrow">
                <path d={lay.arrow} />
                <path d={lay.head} />
              </svg>
              <div className="ch-label" key={nudgeN} style={lay.label}>
                <b>CLICK HERE</b><small>flip the switch</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
