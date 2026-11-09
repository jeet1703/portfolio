import { useEffect, useRef } from 'react';
import { RAILS } from '../rig/data';
import { rig } from '../rig/bus';

/* a meter that counts up from zero the moment power reaches the section */
function Meter({ value, label, live, delay }) {
  const el = useRef(null);
  useEffect(() => {
    const m = /^([^\d]*)([\d.]+)(.*)$/.exec(value);
    if (!live || !m || rig.reduce) { if (el.current) el.current.textContent = value; return; }
    const [, pre, num, post] = m, target = parseFloat(num), dec = num.includes('.') ? 1 : 0;
    let raf = 0, t0 = 0;
    const tick = t => {
      if (!t0) t0 = t;
      const p = Math.min(1, Math.max(0, (t - t0 - delay) / 1100)), e = 1 - Math.pow(1 - p, 3);
      if (el.current) el.current.textContent = pre + (target * e).toFixed(dec) + post;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, value, delay]);
  return <div className="meter"><b ref={el}>{value}</b><span>{label}</span></div>;
}

export default function Rails({ live, liveMap = {} }) {
  return (
    <section id="rails" className={'powerable' + (live ? ' live' : '')} data-name="EXPERIENCE">
      <div className="wrap">
        <div className="tag">02 · Output rails</div>
        <h2>Where the power has gone so far.</h2>
        <p className="lede">A power supply is judged by what it holds up under load. These are the systems I've kept up.</p>
        <div className="rails">
          {RAILS.map((r, ri) => {
            const on = !!liveMap['rail-' + ri];
            return (
            <article id={'rail-' + ri} data-jack={r.side === 'right' ? 'right' : 'left'} className={'rail' + (r.side === 'right' ? ' rail-r' : '') + (on ? ' on' : '')} key={r.org} style={{ '--rc': r.rc }}>
              <div className="rail-head">
                <div>
                  <h3><span className="volt">{r.volt}</span>{r.org}</h3>
                  <div className="role">{r.role}</div>
                </div>
                <div className="when">{r.when.map((w, i) => <div key={i}>{w}</div>)}</div>
              </div>
              {r.meters && (
                <div className="meters">
                  {r.meters.map(([b, s], mi) => <Meter key={b} value={b} label={s} live={on} delay={350 + mi * 120} />)}
                </div>
              )}
              <ul style={r.meters ? undefined : { marginTop: 18 }}>
                {r.points.map(p => <li key={p}>{p}</li>)}
              </ul>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
