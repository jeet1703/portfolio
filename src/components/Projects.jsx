import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../rig/data';
import { DUR, drawScene, fitCanvas } from '../rig/scenes';
import { createMouse } from '../rig/three/mouse';
import S from '../rig/sound';
import Jack from './Jack';

const N = PROJECTS.length;
const mmss = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
const pad2 = n => String(n).padStart(2, '0');

export default function Projects({ live, on, has3d, apiRef }) {
  const [proj, setProj] = useState(0);
  const [dir, setDir] = useState(1);
  const [cue, setCue] = useState(true); // "the mouse is clickable" hint, until it's been used
  const host = useRef(null), mouseApi = useRef(null), cueL = useRef(null), cueR = useRef(null);

  const step = useCallback(d => {
    setProj(p => (p + d + N) % N); setDir(d);
    S.click(); S.whoosh(d);
    mouseApi.current?.kick(d);
  }, []);
  useEffect(() => { apiRef.current.step = step; }, [apiRef, step]);

  useEffect(() => {
    if (!has3d) return;
    const onButtons = ({ l, r }) => {
      if (cueL.current) cueL.current.style.transform = `translate(${l.x}px,${l.y}px)`;
      if (cueR.current) cueR.current.style.transform = `translate(${r.x}px,${r.y}px)`;
    };
    mouseApi.current = createMouse(host.current, { onStep: d => { setCue(false); step(d); }, onButtons });
    return () => { mouseApi.current?.dispose(); mouseApi.current = null; };
  }, [has3d, step]);

  const pr = PROJECTS[proj];
  return (
    <section id="mouse" className={'powerable' + (live ? ' live' : '')} data-name="PROJECTS">
      <div className="wrap">
        <div className="tag">04 · Mouse</div>
        <h2>Click through what I've built.</h2>
        <p className="lede">Click the left button on the mouse to go back and the right button to go forward. Pick a clip under the player to see each part of a project. Arrow keys work too.</p>

        <div className="desk">
          <div className={'mousepad dev' + (cue && has3d ? ' cueing' : '') + (on ? ' on' : '')} id="jack-mouse" data-jack="left">
            <Jack color="#7cc4ff" />
            {has3d && (
              <div className="mcue-note" aria-hidden="true">
                <span className="hand" aria-hidden="true"><CursorIcon /></span>
                <span><b>This mouse is clickable.</b><br />Left button ‹ prev · right button next ›</span>
              </div>
            )}
            <div id="mouse3d" ref={host}>
              {has3d && cue && (
                <>
                  <div className="mcue" ref={cueL}><i></i><i className="r2"></i><span>L ‹</span></div>
                  <div className="mcue right" ref={cueR}><i></i><i className="r2"></i><span>› R</span></div>
                </>
              )}
            </div>
            <div className="pager">{PROJECTS.map((p, i) => <i key={p.name} className={i === proj ? 'on' : ''}></i>)}</div>
            <div className="mbtns">
              <button className="mbtn" onClick={() => step(-1)}>‹ L · prev</button>
              <button className="mbtn" onClick={() => step(1)}>next · R ›</button>
            </div>
          </div>
          <div className="monitor">
            <div className="monitor-screen">
              <div className="win-bar"><i></i><i></i><i></i><span>~/projects/{pr.name.toLowerCase().replace(/\s+/g, '-')}</span></div>
              <div className="proj" key={proj} style={{ '--dx': dir < 0 ? '-24px' : '24px' }}>
                <div className="num">{pad2(proj + 1)} / {pad2(N)}</div>
                <h3>{pr.name}</h3><div className="kind">{pr.kind}</div>
                {pr.links.length > 0 && (
                  <div className="links top">{pr.links.map(([t, u], i) => <a key={u} className={'btnlink' + (i === 0 ? ' dark' : '')} href={u} target="_blank" rel="noopener">{t}</a>)}</div>
                )}
                <Player pr={pr} />
                <div className="chips">{pr.tech.map(t => <span className="chip" key={t}>{t}</span>)}</div>
                <ul>{pr.points.map(x => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Media({ m }) {
  if (m.type === 'video') return <video src={m.src} muted loop playsInline autoPlay />;
  return <img src={m.src} alt={m.title} />;
}

function Thumb({ m, i, on, onPick }) {
  const c = useRef(null);
  useEffect(() => {
    if (!m.scene) return;
    const r = requestAnimationFrame(() => { fitCanvas(c.current); drawScene(m.scene, c.current, c.current.getContext('2d'), 3.1); });
    return () => cancelAnimationFrame(r);
  }, [m.scene]);
  return (
    <button className={'thumb' + (on ? ' on' : '')} onClick={onPick}>
      <div className="tw">{m.scene ? <canvas ref={c} /> : <Media m={m} />}</div>
      <span>{pad2(i + 1)} · {m.title}</span>
    </button>
  );
}

function Player({ pr }) {
  const [clip, setClip] = useState(0);
  const [playing, setPlaying] = useState(true);
  const el = useRef(null), canvas = useRef(null), video = useRef(null), bar = useRef(null), time = useRef(null);
  const st = useRef({ t: 0, playing: true });
  const m = pr.media[clip], dur = DUR[m.scene] || 8;

  useEffect(() => { st.current.playing = playing; if (video.current) { if (playing) video.current.play().catch(() => {}); else video.current.pause(); } }, [playing]);
  useEffect(() => { st.current.t = 0; if (canvas.current) fitCanvas(canvas.current); }, [clip]);

  useEffect(() => {
    let vis = false, raf = 0, last = performance.now();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    io.observe(el.current);
    const onResize = () => { if (canvas.current) fitCanvas(canvas.current); };
    addEventListener('resize', onResize);
    const loop = t => {
      const dt = Math.min(.1, (t - last) / 1000); last = t;
      if (vis) {
        const c = canvas.current, v = video.current, s = st.current;
        if (c && m.scene) {
          if (s.playing) s.t = (s.t + dt) % dur;
          drawScene(m.scene, c, c.getContext('2d'), s.t);
          bar.current.style.width = (s.t / dur * 100) + '%';
          time.current.textContent = mmss(s.t) + ' / ' + mmss(dur);
        } else if (v && v.duration) {
          bar.current.style.width = (v.currentTime / v.duration * 100) + '%';
          time.current.textContent = Math.floor(v.currentTime) + 's';
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onResize); };
  }, [m.scene, dur]);

  const toggle = () => { S.click(); setPlaying(p => !p); };
  const seek = e => {
    const r = e.currentTarget.getBoundingClientRect(), f = (e.clientX - r.left) / r.width;
    if (video.current?.duration) video.current.currentTime = f * video.current.duration; else st.current.t = f * dur;
    S.tick();
  };

  return (
    <>
      <div className={'player' + (playing ? '' : ' paused')} ref={el} tabIndex={-1}>
        <div className="pl-stage" onClick={toggle}>
          {m.scene ? <canvas ref={canvas} key={clip} /> : (m.type === 'video'
            ? <video ref={video} key={clip} src={m.src} muted loop playsInline autoPlay />
            : <img key={clip} src={m.src} alt={m.title + ' screenshot'} />)}
        </div>
        <div className="pl-badge"><i></i><span>{m.scene ? 'PREVIEW' : m.type === 'video' ? 'DEMO' : 'LIVE SITE'}</span></div>
        <div className="pl-title">{m.title}</div>
        {m.href && <a className="pl-visit" href={m.href} target="_blank" rel="noopener">Open live site ↗</a>}
        <button className="pl-big" aria-label="Play" onClick={() => { S.click(); setPlaying(true); }}>▶</button>
        <div className="pl-bar">
          <button className="pl-btn" aria-label="Play or pause" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
          <div className="pl-track" role="slider" aria-label="Seek" aria-valuenow={0} onClick={seek}><i ref={bar}></i></div>
          <span className="pl-time" ref={time}>0:00</span>
        </div>
      </div>
      <div className="thumbs">
        {pr.media.map((mm, i) => (
          <Thumb key={i} m={mm} i={i} on={i === clip} onPick={() => { S.click(); setClip(i); setPlaying(true); }} />
        ))}
      </div>
    </>
  );
}

export function CursorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" stroke="#1d1b18" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" />
    </svg>
  );
}
