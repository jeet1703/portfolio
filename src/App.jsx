import { useCallback, useEffect, useRef, useState } from 'react';
import { rig, webglOK, SECTIONS } from './rig/bus';
import S from './rig/sound';
import Cable from './components/Cable';
import Hero from './components/Hero';
import Rails from './components/Rails';
import Keys from './components/Keys';
import Projects from './components/Projects';
import Post from './components/Post';
import Contact from './components/Contact';
import { Nav, Dock } from './components/Chrome';

const BLOCK_KEYS = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home'];
const isLocked = () => document.documentElement.classList.contains('locked');

export default function App() {
  const [has3d] = useState(webglOK);
  const [powered, setPowered] = useState(false);
  const [soundOn, setSoundOn] = useState(S.enabled);
  const [section, setSection] = useState(0);
  const [live, setLive] = useState({});
  const [plugged, setPlugged] = useState(false);
  const [toast, setToast] = useState(false);
  const [nudgeN, setNudgeN] = useState(0);
  const sectionRef = useRef(0), nudgeT = useRef(0);
  const keysApi = useRef({}), projApi = useRef({}), contactApi = useRef({});

  // body classes drive most of the "powered" styling in rig.css
  useEffect(() => {
    const b = document.body.classList;
    b.toggle('on', powered); b.toggle('snd', soundOn); b.toggle('plugged', plugged);
    b.toggle('has3d', has3d); b.toggle('no3d', !has3d);
  }, [powered, soundOn, plugged, has3d]);

  const togglePower = useCallback(() => {
    const on = !rig.powered;
    rig.powered = on; setPowered(on);
    S.init(); S.thunk();
    if (on) { S.humStart(); S.beep(1.1); } else S.humStop();
  }, []);

  const nudge = useCallback(() => {
    const now = Date.now(); if (now - nudgeT.current < 1200) return; nudgeT.current = now;
    setToast(true); setTimeout(() => setToast(false), 1800);
    setNudgeN(n => n + 1);
    S.init(); S.tone({ freq: 220, type: 'square', dur: .08, gain: .04 }); S.tone({ freq: 180, type: 'square', dur: .1, gain: .04, when: .1 });
  }, []);

  const go = useCallback(i => {
    i = Math.max(0, Math.min(SECTIONS.length - 1, i));
    if (isLocked() && i > 0) { nudge(); return; }
    rig.scrollTo(document.getElementById(SECTIONS[i].id).getBoundingClientRect().top + scrollY);
  }, [nudge]);

  // block touch scrolling only while locked: a non-passive touchmove listener makes the phone wait
  // for JS on every finger move, so it must not stay attached once the page is powered
  useEffect(() => {
    if (powered) return;
    const onTouch = e => { e.preventDefault(); nudge(); };
    addEventListener('touchmove', onTouch, { passive: false });
    return () => removeEventListener('touchmove', onTouch);
  }, [powered, nudge]);

  // the page stays locked until the visitor powers it on
  useEffect(() => {
    const root = document.documentElement;
    if (!powered) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      root.classList.add('locked'); scrollTo(0, 0);
    } else { root.classList.remove('locked'); rig.rebuildCable(); }
  }, [powered]);

  useEffect(() => {
    const wake = () => { if (S.enabled) S.init(); };
    // wheel: slower steps; the page eases there and waits for the wire (see Cable)
    const onWheel = e => {
      if (isLocked()) { e.preventDefault(); if (e.deltaY > 0) nudge(); return; }
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      rig.scrollTo((rig.wantY ?? scrollY) + dy * .45);
    };
    const onScroll = () => {
      const mid = innerHeight * .4; let idx = 0;
      SECTIONS.forEach((s, i) => { const el = document.getElementById(s.id); if (el && el.getBoundingClientRect().top <= mid) idx = i; });
      if (idx !== sectionRef.current) { if (rig.powered) S.tick(); sectionRef.current = idx; setSection(idx); }
    };
    const onKey = e => {
      wake();
      if (isLocked() && BLOCK_KEYS.includes(e.key)) { e.preventDefault(); nudge(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target, cur = sectionRef.current;
      if (t.matches?.('input,textarea,[contenteditable]')) return;
      if (e.key === ' ' && cur === 0 && !t.closest('button,a,[role=button]')) { e.preventDefault(); togglePower(); return; }
      if (/^[1-6]$/.test(e.key)) { S.key(); go(+e.key - 1); return; }
      if (cur === 3 && e.key === 'ArrowLeft') { projApi.current.step?.(-1); return; }
      if (cur === 3 && e.key === 'ArrowRight') { projApi.current.step?.(1); return; }
      if (cur === 5 && e.key === 'Enter' && !t.closest('a,button')) { contactApi.current.enter?.(); return; }
      if (cur === 2 && /^[a-z]$/i.test(e.key) && !e.repeat) keysApi.current.letter?.(e.key.toLowerCase());
    };
    addEventListener('pointerdown', wake, { passive: true });
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      removeEventListener('pointerdown', wake); removeEventListener('wheel', onWheel);
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', onScroll);
    };
  }, [nudge, go, togglePower]);

  const onLive = useCallback((id, on) => setLive(l => ({ ...l, [id]: on })), []);
  const onSound = () => { S.init(); const on = !S.enabled; S.setEnabled(on); setSoundOn(on); if (on) S.click(); };

  return (
    <>
      <Cable onLive={onLive} onPlugged={setPlugged} />
      <Nav section={section} soundOn={soundOn} onSound={onSound} onGo={go} />
      <Hero powered={powered} onToggle={togglePower} nudgeN={nudgeN} has3d={has3d} />
      <main>
        <Rails live={live.rails} liveMap={live} />
        <Keys live={live.keys} on={live['jack-keys']} has3d={has3d} apiRef={keysApi} />
        <Projects live={live.mouse} on={live['jack-mouse']} has3d={has3d} apiRef={projApi} />
        <Post live={live.post} on={live['jack-post']} />
        <Contact live={live.contact} plugged={plugged} apiRef={contactApi} />
      </main>
      <footer>
        <div className="wrap"><span>© 2026 Prabhjeet Singh · prabhjeetsingh.tech</span><span>Built with one PSU, one keyboard, one mouse and one very long, very tangled cable.</span></div>
      </footer>
      <div className={'toast' + (toast ? ' show' : '')}><b>Power on first.</b> Flip the switch on the PSU.</div>
      <Dock section={section} powered={powered} onGo={go} />
    </>
  );
}
