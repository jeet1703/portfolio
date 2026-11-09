import { useEffect, useRef, useState } from 'react';
import { EMAIL, GITHUB, LINKEDIN, RESUME } from '../rig/data';
import S from '../rig/sound';

export default function Contact({ live, plugged, apiRef }) {
  const [copyTxt, setCopyTxt] = useState('Copy');
  const [down, setDown] = useState(false);
  const enter = useRef(null), mail = useRef(null);

  useEffect(() => {
    const api = apiRef.current;
    api.enter = () => {
      setDown(true); S.thunk();
      setTimeout(() => { setDown(false); enter.current?.click(); }, 150);
    };
    return () => { api.enter = null; };
  }, [apiRef]);

  const copy = async () => {
    S.key();
    try { await navigator.clipboard.writeText(EMAIL); setCopyTxt('Copied'); }
    catch {
      const r = document.createRange(); r.selectNodeContents(mail.current);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); setCopyTxt('Selected, press Ctrl+C');
    }
    setTimeout(() => setCopyTxt('Copy'), 2200);
  };

  return (
    <section id="contact" className={'powerable' + (live ? ' live' : '')} data-name="CONTACT">
      <div className="wrap contact">
        <div>
          <div className="tag">06 · Enter</div>
          <h2>Looking for an engineer who keeps the lights on?</h2>
          <p className="lede">I'm looking for software engineer, SDE and backend roles, and DevOps work too. Delhi NCR first, remote welcome, and I can start right away.</p>
          <div className="mail"><span ref={mail}>{EMAIL}</span><button className="copy" onClick={copy}>{copyTxt}</button></div>
          <div className="socials">
            <a className="btnlink dark" href={RESUME} target="_blank" rel="noopener">Résumé ↗</a>
            <a className="btnlink" href={LINKEDIN} target="_blank" rel="noopener">LinkedIn ↗</a>
            <a className="btnlink" href={GITHUB} target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
        <div className="rig">
          <div className="crt">
            <div className="crt-screen">
              <div className="nosig">NO SIGNAL</div>
              <div className="sig" aria-live="polite">
                <p style={{ '--d': 0 }}>$ power --connect prabhjeet</p>
                <p style={{ '--d': 1 }}>[ok] signal ok · open to work</p>
                <p className="big" style={{ '--d': 2 }}>Let's build something reliable.</p>
                <p style={{ '--d': 3 }}>mail → <a href={'mailto:' + EMAIL}>{EMAIL}</a></p>
                <p style={{ '--d': 4 }}>gh → <a href={GITHUB} target="_blank" rel="noopener">github.com/jeet1703</a></p>
                <p style={{ '--d': 5 }}>press ENTER to say hi_</p>
              </div>
            </div>
            <div className="crt-chin"><span>PS · 2026</span><i></i></div>
            <div className="socket" id="socket"><span>DC IN</span></div>
          </div>
          <div className="crt-neck"></div><div className="crt-foot"></div>
          <div className="enter-wrap">
            <a className={'enter' + (down ? ' down' : '')} ref={enter} href={'mailto:' + EMAIL + '?subject=Hi%20Prabhjeet'} aria-label="Email Prabhjeet"
              onPointerDown={() => { S.init(); S.thunk(); }}>
              <small>press to email</small><span>ENTER ↵</span>
            </a>
          </div>
          <div className="plugtxt">{plugged ? '● monitor powered · press Enter to email me' : 'monitor has no power yet · keep scrolling'}</div>
        </div>
      </div>
    </section>
  );
}
