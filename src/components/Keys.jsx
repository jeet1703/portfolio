import { useCallback, useEffect, useRef, useState } from 'react';
import { KEYS, KEY_ROWS } from '../rig/data';
import { createKeyboard } from '../rig/three/keyboard';
import { rig } from '../rig/bus';
import S from '../rig/sound';
import Jack from './Jack';

export default function Keys({ live, on, has3d, apiRef }) {
  const host = useRef(null), lineRef = useRef(null), kb3d = useRef(null);
  // phones and narrow screens get the flat keyboard: it lays out cleanly in a grid (the 3D one has
  // to squash its rows) and saves a WebGL scene
  const [use3d] = useState(() => has3d && !rig.touch && innerWidth > 720);
  const [sel, setSel] = useState(-1);
  const [down, setDown] = useState(-1);
  const [cat, setCat] = useState('Ready');
  const [cue, setCue] = useState(null); // where the "click me" cue points, until a key is pressed
  const [used, setUsed] = useState(false);
  const selRef = useRef(-1), typeT = useRef(0), letterIdx = useRef({});

  const typeOut = useCallback(s => {
    clearInterval(typeT.current);
    const el = lineRef.current; if (!el) return;
    if (rig.reduce) { el.textContent = s; return; }
    let i = 0; el.textContent = '';
    typeT.current = setInterval(() => { el.textContent = s.slice(0, i += 3); if (i >= s.length) clearInterval(typeT.current); }, 12);
  }, []);

  const show = useCallback(i => {
    if (i === selRef.current) return;
    selRef.current = i; setSel(i);
    const k = KEYS[i]; setCat(k.cat);
    typeOut(k.label.split(' · ')[0] + ' → ' + k.detail);
    kb3d.current?.select(i);
  }, [typeOut]);

  const press = useCallback(i => {
    selRef.current = -1; show(i); S.key(KEYS[i].kind); setUsed(true);
    if (kb3d.current) kb3d.current.press(i);
    else { setDown(i); setTimeout(() => setDown(d => (d === i ? -1 : d)), 130); }
  }, [show]);

  useEffect(() => {
    if (!use3d) return;
    let dead = false;
    document.fonts.ready.then(() => {
      if (dead) return;
      kb3d.current = createKeyboard(host.current, KEYS, { onHover: () => {}, onPress: press, onCue: setCue });
      if (selRef.current >= 0) kb3d.current.select(selRef.current);
    });
    return () => { dead = true; kb3d.current?.dispose(); kb3d.current = null; };
  }, [use3d, show, press]);

  // typing a letter on your own keyboard presses a matching key
  useEffect(() => {
    const api = apiRef.current;
    api.letter = ch => {
      const m = KEYS.map((k, i) => [k, i]).filter(([k]) => k.label[0].toLowerCase() === ch);
      if (!m.length) return;
      letterIdx.current[ch] = ((letterIdx.current[ch] ?? -1) + 1) % m.length;
      press(m[letterIdx.current[ch]][1]);
    };
    return () => { api.letter = null; clearInterval(typeT.current); };
  }, [apiRef, press]);

  const rows = Array.from({ length: KEY_ROWS }, (_, r) => KEYS.map((k, i) => [k, i]).filter(([k]) => k.row === r));

  return (
    <section id="keys" className={'powerable' + (live ? ' live' : '')} data-name="SKILLS">
      <div className="wrap">
        <div className="tag">03 · Keyboard</div>
        <h2>Every key is something I use.</h2>
        <p className="lede">Click or tap a key to see where I've used it. On a computer you can also type on your own keyboard: each letter presses a matching key.</p>
        <div className={'kb-desk' + (use3d ? ' k3d' : '')}>
          <div className="kb-screen" aria-live="polite">
            <div className="cat">{cat}</div>
            <div className="line"><span ref={lineRef}>Press any key.</span> <span className="cursor"></span></div>
          </div>
          <div className={'kb-stage dev' + (on ? ' on' : '')} id="jack-keys" data-jack="right" data-jack-mid="">
            <Jack color="#ff7a52" />
            <div id="kb3d" ref={host} aria-hidden="true"></div>
            <div className="keyboard">
              {rows.map((row, ri) => (
                <div className="krow" key={ri}>
                  {row.map(([k, i]) => (
                    <button key={k.label}
                      className={['key', k.kind, k.w, sel === i && 'sel', down === i && 'down'].filter(Boolean).join(' ')}
                      title={k.label}
                      onClick={() => press(i)}>
                      <small>{k.cat.split(' ')[0].toUpperCase()}</small><span>{k.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {!used && (
              <div className="kcue" aria-hidden="true" style={use3d && cue ? { left: cue.x, top: cue.y } : undefined}>
                <i className="kc-tap"></i>
                <svg className="kc-cursor" viewBox="0 0 40 46" width="40" height="46">
                  <path d="M4 4 L7.5 36.5 L15.5 28 L23 42 L30 38.5 L22.5 24.5 L34.5 22.5 Z" />
                </svg>
                <span className="kc-text">click the keys</span>
              </div>
            )}
          </div>
          <p className="kb-note">Orange = what I reach for first · grey = tools and platforms · space bar = how I work every day</p>
        </div>
      </div>
    </section>
  );
}
