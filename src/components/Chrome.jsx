import { useEffect, useLayoutEffect, useRef } from 'react';
import { SECTIONS } from '../rig/bus';
import S from '../rig/sound';

export function Nav({ section, soundOn, onSound, onGo }) {
  const seg = useRef(null), pill = useRef(null);
  // slide the dark pill under the active section's link
  useLayoutEffect(() => {
    const place = () => {
      const a = seg.current?.querySelectorAll('a')[section], p = pill.current;
      if (!a || !p) return;
      p.style.width = a.offsetWidth + 'px'; p.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    place();
    addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => removeEventListener('resize', place);
  }, [section]);
  return (
    <nav className="top" aria-label="Main">
      <a className="brand" href="#power" onClick={e => { e.preventDefault(); onGo(0); }}>
        <span className="brand-psu" aria-hidden="true"><i></i><i></i></span>Prabhjeet Singh
      </a>
      <div className="seg" ref={seg}>
        <span className="pill" ref={pill} aria-hidden="true"></span>
        {SECTIONS.map((s, i) => (
          <a key={s.id} className={i === section ? 'active' : ''} href={'#' + s.id} aria-current={i === section ? 'true' : undefined}
            onClick={e => { e.preventDefault(); S.key(); onGo(i); }}>
            {s.nav === 'Power' ? 'Home' : s.nav}
          </a>
        ))}
      </div>
      <div className="right">
        <span className="npill status"><i></i>Open to work</span>
        <button className="npill" id="sndBtn" aria-pressed={soundOn} onClick={onSound}>
          <span className="eq"><i></i><i></i><i></i></span><span>{soundOn ? 'Sound on' : 'Sound off'}</span>
        </button>
      </div>
    </nav>
  );
}

export function Dock({ section, powered, onGo }) {
  const bar = useRef(null), wheel = useRef(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
      wheel.current?.setAttribute('transform', 'translate(0 ' + (-(scrollY / 6) % 12) + ')');
    };
    addEventListener('scroll', on, { passive: true }); on();
    return () => removeEventListener('scroll', on);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="dock">
      <div className="lcd"><b>{SECTIONS[section].name}</b><span>{pad(section + 1)} / {pad(SECTIONS.length)}</span><div className="bar"><i ref={bar}></i></div></div>
      <svg className="minimouse" viewBox="0 0 200 300" role="group" aria-label="Section navigator">
        <path d="M100 40 C 160 40, 180 90, 180 150 L 180 200 C 180 255, 145 290, 100 290 C 55 290, 20 255, 20 200 L 20 150 C 20 90, 40 40, 100 40Z" fill="#d9d1bf" />
        <path className="btn" role="button" aria-label="Previous section" d="M97 44 C 50 47, 24 92, 22 146 L 97 146Z" fill="#f2ecdf"
          onClick={() => { S.click(); onGo(section - 1); }} />
        <path className="btn" role="button" aria-label="Next section" d="M103 44 C 150 47, 176 92, 178 146 L 103 146Z" fill="#f2ecdf"
          onClick={() => { S.click(); onGo(section + 1); }}
          onContextMenu={e => { e.preventDefault(); S.click(); onGo(section + 1); }} />
        <rect x="86" y="62" width="28" height="60" rx="14" fill="#2a2825" />
        <g clipPath="url(#wc2)"><g ref={wheel}>
          {[50, 62, 74, 86, 98, 110, 122, 134].map(y => <rect key={y} x="92" y={y} width="16" height="5" fill="#77716a" />)}
        </g></g>
        <defs><clipPath id="wc2"><rect x="90" y="66" width="20" height="52" rx="10" /></clipPath></defs>
        <circle cx="100" cy="232" r="9" fill={powered ? '#3ddc5c' : '#7d766a'} />
      </svg>
    </div>
  );
}
