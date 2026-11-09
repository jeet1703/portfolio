import { useEffect, useRef } from 'react';
import { rig } from '../rig/bus';
import S from '../rig/sound';

const fx = n => Math.round(n * 10) / 10;
const P = (...a) => a.map(fx).join(' ');
const STOP_IDS = ['rails', 'keys', 'mouse', 'post', 'contact'];
const absY = el => el.getBoundingClientRect().top + scrollY;

/**
 * Build the cable's SVG path: down the page margins, swooping across between sections with a
 * loop-the-loop each time.
 */
function buildPath(start, W) {
  const mob = W <= 920, content = Math.min(1180, W), edge = (W - content) / 2 + (W <= 560 ? 22 : 28);
  const off = mob ? 13 : 38, Lx = Math.max(9, edge - off), Rx = Math.min(W - 9, W - edge + off);
  const R = mob ? 24 : 42;
  const clampX = (v, r) => Math.max(r + 8, Math.min(W - r - 8, v));

  let x = start.x, y = start.y, side = Lx;
  const exits = [];
  const lead = start.dx !== undefined && start.dy > .2; // continue the 3D cable's heading
  // Path builder. Alongside the SVG string it records a polyline of the same curve so we never
  // have to ask the browser for getPointAtLength (that was ~2 ms per call on this path).
  let d = 'M' + P(x, y), px = x, py = y;
  const pts = [[x, y]];
  const Cc = (x1, y1, x2, y2, x3, y3) => {
    d += ' C' + P(x1, y1, x2, y2, x3, y3);
    const x0 = px, y0 = py;
    const n = Math.max(6, Math.ceil((Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2)) / 7));
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      pts.push([a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3]);
    }
    px = x3; py = y3;
  };
  // every arc here is a half circle (SVG grows the radius to fit the chord), centred on the chord
  const Ar = (r, sw, x2, y2) => {
    d += ' A' + P(r, r) + ' 0 0 ' + sw + ' ' + P(x2, y2);
    const cx = (px + x2) / 2, cy = (py + y2) / 2, rr = Math.hypot(x2 - px, y2 - py) / 2;
    const a0 = Math.atan2(py - cy, px - cx), da = sw ? Math.PI : -Math.PI, n = Math.max(10, Math.ceil(rr * Math.PI / 5));
    for (let i = 1; i <= n; i++) { const a = a0 + da * i / n; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    px = x2; py = y2;
  };
  const Ln = (x2, y2) => {
    d += ' L' + P(x2, y2);
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - px, y2 - py) / 8));
    for (let i = 1; i <= n; i++) pts.push([px + (x2 - px) * i / n, py + (y2 - py) * i / n]);
    px = x2; py = y2;
  };
  const Qq = (x1, y1, x2, y2) => {
    d += ' Q' + P(x1, y1, x2, y2);
    const x0 = px, y0 = py;
    for (let i = 1; i <= 16; i++) { const t = i / 16, u = 1 - t; pts.push([u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2]); }
    px = x2; py = y2;
  };

  // a full loop sitting above a horizontal run at (cx, by)
  const loopUp = (cx, by, r, dir) => {
    const sw = dir > 0 ? 0 : 1;
    Ar(r, sw, cx, by - 2 * r); Ar(r, sw, cx, by);
  };
  STOP_IDS.forEach((id, i) => {
    const el = document.getElementById(id); if (!el) return;
    const top = absY(el), last = i === STOP_IDS.length - 1;
    const tx = last ? Rx : side;
    const yIn = top - (mob ? 62 : 86), yOut = top + (mob ? 76 : 104);
    const r1 = R, by = top + (mob ? 14 : 26) + r1;
    if (lead && i === 0 && yIn > y + 40) {
      // leave the canvas edge on the 3D cable's own heading, then ease into a straight drop
      const k = Math.min(120, (yIn - y) * .5), ex = x + start.dx / start.dy * k * .5;
      Cc(x + start.dx * k * .45, y + start.dy * k * .45, ex, y + k * .55, ex, y + k);
      x = ex; y += k;
    }
    if (yIn > y) { Ln(x, yIn); y = yIn; }
    let dir = tx >= x ? 1 : -1, cx;
    if (Math.abs(tx - x) < 80) { dir = x > W / 2 ? -1 : 1; cx = x + dir * (R * 3.2); }
    else cx = x + (tx - x) * (i % 2 ? .62 : .38);
    cx = clampX(cx, r1);
    const k = R * 2.4;
    Cc(x, y + (by - y) * .75, cx - dir * k, by, cx, by);
    loopUp(cx, by, r1, dir);
    Cc(cx + dir * k, by, tx, by + (yOut - by) * .35, tx, yOut);
    x = tx; y = yOut; exits.push({ el, y: yOut }); side = tx === Lx ? Rx : Lx;
    // devices with a connector (experience cards, keyboard, mouse pad, POST screen): run past each
    // one, crossing over in the gap above it if it plugs in on the other side. Each powers on when
    // the cable reaches its connector.
    const jacks = el.querySelectorAll('[data-jack]');
    if (jacks.length) {
      jacks.forEach(card => {
        const ct = absY(card), want = card.dataset.jack === 'right' ? Rx : Lx;
        if (want !== x) {
          const prev = card.previousElementSibling, pb = prev ? prev.getBoundingClientRect().bottom + scrollY : ct - 72;
          const gMid = (pb + ct) / 2, r = Math.max(4, Math.min(18, (ct - pb) / 2 - 2)), dir = want > x ? 1 : -1;
          if (gMid - r > y) Ln(x, gMid - r);
          Qq(x, gMid, x + dir * r, gMid); Ln(want - dir * r, gMid); Qq(want, gMid, want, gMid + r);
          x = want; y = gMid + r;
        }
        const stubY = ct + 34; // the connector stub sits 30-38px below the card top
        if (stubY > y) { Ln(x, stubY); y = stubY; }
        exits.push({ el: card, y: stubY });
      });
      side = x === Lx ? Rx : Lx;
    }
  });

  // final run into the monitor's DC IN socket
  const so = document.getElementById('socket');
  if (so) {
    const b = so.getBoundingClientRect();
    const sy = b.top + scrollY + b.height / 2, sx = b.right + scrollX - 4;
    const turn = Math.min(70, Math.abs(x - sx) * .9);
    Ln(x, sy - turn); Qq(x, sy, x - turn, sy); Ln(sx, sy);
  }
  return { d, pts, exits, Lx, Rx };
}

export default function Cable({ onLive, onPlugged }) {
  const svgRef = useRef(null), cpRef = useRef(null), shadowRef = useRef(null), plugRef = useRef(null), sparksRef = useRef(null), pulseRef = useRef(null), hiliteRef = useRef(null);
  const cbs = useRef({ onLive, onPlugged });
  useEffect(() => { cbs.current = { onLive, onPlugged }; }, [onLive, onPlugged]);

  useEffect(() => {
    const svg = svgRef.current, cp = cpRef.current, plug = plugRef.current, sparks = sparksRef.current;
    const de = document.documentElement;
    let lines = [], total = 0, reach = [], cum = [], pts = [], drawn = 0, lastDrawn = 0, plugged = false, cableW = 14, stops = [];
    // point (and heading) at length L along the polyline
    const pointAt = L => {
      let lo = 0, hi = cum.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < L) lo = m + 1; else hi = m; }
      const i = Math.max(1, lo), a = pts[i - 1], b = pts[i], seg = cum[i] - cum[i - 1] || 1, t = Math.min(1, Math.max(0, (L - cum[i - 1]) / seg));
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    };

    function build() {
      const W = de.clientWidth;
      svg.style.height = '0px';
      const H = de.scrollHeight;
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.height = H + 'px'; svg.style.width = W + 'px';
      // start where the 3D cable leaves its canvas (or under the fallback PSU)
      let s = rig.cableStart && rig.cableStart();
      if (!s) { const r = document.querySelector('.psu-wrap').getBoundingClientRect(); s = { x: r.left + r.width * .35, y: r.bottom - 30 + scrollY, w: 14 }; }
      cableW = W <= 920 ? 8 : Math.max(8, Math.min(30, s.w || 14));
      // on phones the PSU sits above the intro text, so the cable drops in from the right margin instead
      if (W <= 920) {
        const hb = document.getElementById('power').getBoundingClientRect();
        const content = Math.min(1180, W), edge = (W - content) / 2 + (W <= 560 ? 22 : 28);
        s = { x: Math.min(W - 9, W - edge + 13), y: hb.bottom + scrollY - 40, w: s.w };
      }
      const built = buildPath(s, W), { d, exits, Lx, Rx } = built;
      lines = [shadowRef.current, cp, hiliteRef.current];
      lines.forEach(l => l.setAttribute('d', d));
      pts = built.pts; cum = [0]; reach = [pts[0][1]];
      for (let i = 1; i < pts.length; i++) {
        cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        // y reached so far (loops go up, so keep a running max)
        reach.push(Math.max(reach[i - 1], pts[i][1]));
      }
      total = cum[cum.length - 1];
      lines.forEach(l => l.setAttribute('pathLength', total)); // dash lengths in our own units
      lines.forEach(l => l.setAttribute('stroke-width', cableW));
      hiliteRef.current.setAttribute('stroke-width', Math.max(2, cableW * .2));
      const lenAtY = yy => { for (let i = 0; i < reach.length; i++) if (reach[i] >= yy) return cum[i]; return total; };
      stops = exits.map(e => ({ el: e.el, L: lenAtY(e.y - 2), live: e.el.classList.contains('live') }));
      plug.setAttribute('transform', 'scale(' + (cableW / 14) + ')');
      document.querySelectorAll('[data-jack]').forEach(r => {
        const b = r.getBoundingClientRect();
        r.style.setProperty('--stub', Math.max(20, r.dataset.jack === 'right' ? Rx - b.right : b.left - Lx) + 'px');
      });
      lastDrawn = -1;
    }

    function targetLen() {
      if (!reach.length || de.classList.contains('locked')) return 0;
      const want = rig.wantY ?? scrollY;
      if (want + innerHeight >= de.scrollHeight - 6) return total;
      const ty = want + innerHeight * .74;
      let lo = 0, hi = reach.length - 1; if (reach[0] > ty) return 0;
      while (lo < hi) { const mm = (lo + hi + 1) >> 1; if (reach[mm] <= ty) lo = mm; else hi = mm - 1; }
      return cum[lo];
    }

    function spark(x, y) {
      const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
      let html = '';
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2 + Math.random() * .4, r1 = 10, r2 = 28 + Math.random() * 22;
        html += '<line x1="' + Math.cos(a) * r1 + '" y1="' + Math.sin(a) * r1 + '" x2="' + Math.cos(a) * r1 + '" y2="' + Math.sin(a) * r1 + '" stroke="#ffb02e" stroke-width="2.5" stroke-linecap="round"><animate attributeName="x2" to="' + Math.cos(a) * r2 + '" dur=".35s" fill="freeze"/><animate attributeName="y2" to="' + Math.sin(a) * r2 + '" dur=".35s" fill="freeze"/><animate attributeName="opacity" from="1" to="0" begin=".15s" dur=".35s" fill="freeze"/></line>';
      }
      html += '<circle r="6" fill="none" stroke="#ff5b2e" stroke-width="3"><animate attributeName="r" from="6" to="46" dur=".6s" fill="freeze"/><animate attributeName="opacity" from="1" to="0" dur=".6s" fill="freeze"/></circle><circle r="7" fill="#fff6d6"><animate attributeName="opacity" from="1" to="0" dur=".3s" fill="freeze"/></circle>';
      g.innerHTML = html; sparks.appendChild(g); setTimeout(() => g.remove(), 900);
    }

    const pulseG = pulseRef.current, dots = [];
    const GAP = 340, SPEED = .13; // px between pulses, px per ms
    function movePulses(t) {
      const on = rig.powered && drawn > 40 && !rig.reduce;
      const n = on ? Math.min(80, Math.ceil(drawn / GAP)) : 0;
      while (dots.length < n) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('fill', '#ff5b2e'); pulseG.appendChild(c); dots.push(c);
      }
      const top = scrollY - 60, bot = scrollY + innerHeight + 60, off = (t * SPEED) % GAP;
      const r = Math.max(2, cableW * .17);
      dots.forEach((c, i) => {
        const L = i * GAP + off;
        if (i >= n || L > drawn) { c.style.display = 'none'; return; }
        const p = pointAt(L);
        if (p.y < top || p.y > bot) { c.style.display = 'none'; return; }
        c.style.display = ''; c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', r);
      });
    }
    // ---- scroll gate: the page can't move further down than the wire's tip
    let limit = Infinity, setY = -1;
    const reachAtLen = L => {
      let lo = 0, hi = cum.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (cum[m] <= L) lo = m; else hi = m - 1; }
      return reach[lo] ?? 0;
    };
    const setScroll = y => { setY = Math.round(y); scrollTo({ top: y, behavior: 'instant' }); };
    function steer(dt) {
      if (de.classList.contains('locked')) { rig.wantY = null; return; }
      limit = !total || drawn >= total - 3 ? Infinity : Math.max(0, reachAtLen(drawn) - innerHeight * .74 + 70);
      if (rig.wantY === null) return;
      const max = de.scrollHeight - innerHeight;
      const goal = Math.min(rig.wantY, limit, max);
      const d = goal - rig.steerY;
      if (Math.abs(d) > .5) {
        rig.steerY += rig.reduce ? d : d * Math.min(1, dt * .006);
        setScroll(rig.steerY);
      } else if (goal >= Math.min(rig.wantY, max) - .5) rig.wantY = null; // arrived: hand scrolling back
    }
    // native scrolling (touch, scrollbar, keys): hold the page at the wire, keep the intent
    const onScroll = () => {
      if (Math.abs(scrollY - setY) <= 2) return;
      if (scrollY > limit + 2) {
        const want = Math.max(rig.wantY ?? 0, scrollY);
        rig.steerY = limit; rig.wantY = want; setScroll(limit);
      } else if (rig.wantY !== null && Math.abs(scrollY - rig.steerY) > 2) {
        rig.wantY = null; // the visitor took over (e.g. scrolled back up)
      }
    };
    addEventListener('scroll', onScroll, { passive: true });

    let lastT = performance.now(), raf = 0;
    function frame(t) {
      const dt = Math.min(64, t - lastT); lastT = t;
      const target = targetLen();
      if (rig.reduce) drawn = target;
      else {
        let stepL = (target - drawn) * Math.min(1, dt * .0026);
        const cap = dt * .85; // at most ~850 px of cable per second
        stepL = Math.max(-cap, Math.min(cap, stepL));
        drawn += stepL;
      }
      if (Math.abs(target - drawn) < .5) drawn = target;
      if (Math.abs(drawn - lastDrawn) > .2 && total > 0) {
        const dash = Math.max(.01, drawn) + ' ' + (total + 100);
        lines.forEach(l => l.setAttribute('stroke-dasharray', dash));
        const p = pointAt(Math.max(drawn, 4)), a = p.ang * 180 / Math.PI;
        plug.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + a + ') scale(' + (cableW / 14) + ')');
        if (lastDrawn >= 0) S.spool((drawn - lastDrawn) / (dt || 16) * 16);
        lastDrawn = drawn;
        // light up each section the moment the cable reaches it
        stops.forEach(st => {
          const on = drawn >= st.L - 1;
          if (on !== st.live) {
            st.live = on; cbs.current.onLive(st.el.id, on);
            if (on) { const pp = pointAt(Math.min(total, st.L)); spark(pp.x, pp.y); S.zap(); }
          }
        });
      } else S.spool(0);
      movePulses(t);
      steer(dt);
      const isPlugged = total > 0 && drawn >= total - 3;
      if (isPlugged !== plugged) {
        plugged = isPlugged; cbs.current.onPlugged(plugged);
        if (plugged) { const pp = pointAt(total); spark(pp.x, pp.y); S.connect(); }
      }
      raf = requestAnimationFrame(frame);
    }

    let rb = 0;
    const rebuild = () => { clearTimeout(rb); rb = setTimeout(build, 120); };
    rig.rebuildCable = rebuild;
    addEventListener('resize', rebuild);
    addEventListener('load', rebuild);
    const ro = new ResizeObserver(rebuild); ro.observe(document.querySelector('main'));
    document.fonts?.ready.then(rebuild);
    build();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(rb); ro.disconnect();
      removeEventListener('resize', rebuild); removeEventListener('load', rebuild); removeEventListener('scroll', onScroll);
      if (rig.rebuildCable === rebuild) rig.rebuildCable = () => {};
      S.spool(0);
    };
  }, []);

  return (
    <svg id="cable" ref={svgRef} aria-hidden="true">
      {/* three real paths, not <use> clones: Chrome rebuilds every <use> copy whenever the
          referenced path changes, and the reveal dash changes every frame */}
      <path ref={shadowRef} className="cable-line shadow" stroke="rgba(0,0,0,.16)" transform="translate(5 8)" />
      <path ref={cpRef} id="cablePath" className="cable-line" stroke="#1d1b18" />
      <path ref={hiliteRef} className="cable-line hilite" stroke="rgba(255,255,255,.22)" transform="translate(-2 -2)" />
      <g ref={pulseRef} className="pulses" />
      <g ref={sparksRef} />
      <g ref={plugRef}>
        <rect x="-6" y="-17" width="40" height="34" rx="5" fill="#2a2825" stroke="#111" strokeWidth="2" />
        <rect x="30" y="-13" width="14" height="26" rx="2" fill="#efe9dc" stroke="#111" strokeWidth="2" />
        <rect x="2" y="-11" width="22" height="3" rx="1.5" fill="#55504a" />
        <rect x="2" y="-4" width="22" height="3" rx="1.5" fill="#55504a" />
        <rect x="2" y="3" width="22" height="3" rx="1.5" fill="#55504a" />
        <circle cx="13" cy="11" r="2.2" fill="#ff5b2e" />
      </g>
    </svg>
  );
}
