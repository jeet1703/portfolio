import { useEffect, useRef, useState } from 'react';
import { POST_ROWS } from '../rig/data';
import { rig } from '../rig/bus';
import S from '../rig/sound';
import Jack from './Jack';

export default function Post({ live, on }) {
  const box = useRef(null);
  const [shown, setShown] = useState(0);
  // the self test runs once the cable plugs into the screen
  useEffect(() => {
    if (!on) return;
    const timers = POST_ROWS.map((_, i) => setTimeout(() => {
      setShown(n => Math.max(n, i + 1)); S.tick(); if (i === POST_ROWS.length - 1) S.beep(.15);
    }, rig.reduce ? 0 : 400 + i * 190));
    return () => timers.forEach(clearTimeout);
  }, [on]);

  return (
    <section id="post" className={'powerable' + (live ? ' live' : '')} data-name="RECORD">
      <div className="wrap">
        <div className="tag">05 · Power-on self test</div>
        <h2>Everything checks out.</h2>
        <div className={'post-dev dev' + (on ? ' on' : '')} id="jack-post" data-jack="right" data-jack-mid="">
        <Jack color="#a6ff8f" />
        <div className="post" ref={box}>
          <div className="hdr"><span>PRABHJEET BIOS v26.11 · POST</span><span>CPU: curiosity @ 4.9 GHz</span></div>
          {POST_ROWS.map(([a, b, amber], i) => (
            <div className={'row' + (i < shown ? ' show' : '')} key={a}>
              <span>{a}</span><span className={'st' + (amber ? ' amber' : '')}>{b}</span>
            </div>
          ))}
          <div className="foot">All checks passed. Press <b>ENTER</b> to hire <span className="cursor"></span></div>
        </div>
        </div>
      </div>
    </section>
  );
}
