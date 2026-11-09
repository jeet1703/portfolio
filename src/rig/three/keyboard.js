import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeRenderer, addEnv, keyLight, visibleLoop, disposeAll } from './common';

/** The 3D skills keyboard. keys = flat list from data.js */
export function createKeyboard(host, keys, { onHover, onPress, onCue }) {
  const r = makeRenderer(host), scene = new THREE.Scene(); addEnv(r, scene);
  scene.environmentIntensity = .55; r.toneMappingExposure = .95;
  keyLight(scene, [-4, 12, 7]);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 200);
  const board = new THREE.Group(); scene.add(board);
  const WID = { '': 1.5, w2: 2.3, w3: 3.1, space: 7.4 }, GAP = .14, KD = 1.25, KH = .46;
  const COL = { hot: 0xf2552a, mod: 0x7f786b, '': 0xefe9dc };
  const textures = [];
  let dirty = true;
  const items = keys.map((k, i) => {
    const w = WID[k.w] || 1.5;
    const mat = new THREE.MeshStandardMaterial({ color: COL[k.kind] || COL[''], roughness: .55, metalness: 0, emissive: 0x000000 });
    const cap = new THREE.Mesh(new RoundedBoxGeometry(w, KH, KD, 3, .12), mat); cap.castShadow = true; cap.receiveShadow = true;
    // printed legend
    const pxU = 120, c = document.createElement('canvas'); c.width = Math.round(w * pxU); c.height = Math.round(KD * pxU);
    const g = c.getContext('2d'), dark = k.kind === 'hot' || k.kind === 'mod';
    g.fillStyle = dark ? (k.kind === 'hot' ? 'rgba(255,224,212,.9)' : 'rgba(230,222,206,.9)') : '#8a8274';
    g.font = '600 17px "JetBrains Mono", monospace'; g.fillText(k.cat.split(' ')[0].toUpperCase(), 16, 30);
    g.fillStyle = dark ? '#ffffff' : '#2a2722';
    let fs = 30; g.font = '600 ' + fs + 'px "JetBrains Mono", monospace';
    while (g.measureText(k.label).width > c.width - 30 && fs > 14) { fs--; g.font = '600 ' + fs + 'px "JetBrains Mono", monospace'; }
    g.fillText(k.label, 16, c.height - 22);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; textures.push(tex);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(w - .16, KD - .16), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    lab.rotation.x = -Math.PI / 2; lab.position.y = KH / 2 + .002;
    const grp = new THREE.Group(); grp.add(cap); grp.add(lab); board.add(grp);
    cap.userData.i = i;
    return { grp, cap, mat, w, press: 0, hover: 0, sel: 0, kind: k.kind };
  });
  let caseMesh = null, layoutKey = '', fitted = { w: 1, d: 1 };
  function layout() {
    const W = host.clientWidth || 600, narrow = W < 640;
    const key = narrow ? 'n' : 'w'; if (key === layoutKey) return fit(); layoutKey = key;
    let rows = [];
    items.forEach(it => { it.sx = 1; });
    if (!narrow) { keys.forEach((k, i) => { (rows[k.row] = rows[k.row] || []).push(i); }); }
    else {
      const MAX = 7.4; let cur = [], cw = 0;
      keys.forEach((k, i) => { const w = items[i].w; if (cur.length && cw + GAP + w > MAX + .01) { rows.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? GAP : 0) + w; });
      if (cur.length) rows.push(cur);
      // stretch each row to the full width so the edges line up
      rows.forEach(rw => { const tw = rw.reduce((a, i) => a + items[i].w, 0) + GAP * (rw.length - 1); const sc = MAX / tw; rw.forEach(i => { items[i].sx = sc; }); });
    }
    const rowW = rows.map(rw => rw.reduce((a, i) => a + items[i].w * items[i].sx, 0) + GAP * (rw.length - 1)); const maxW = Math.max(...rowW);
    rows.forEach((rw, ri) => {
      let x = -rowW[ri] / 2; const z = (ri - (rows.length - 1) / 2) * (KD + GAP);
      rw.forEach(i => { const it = items[i], ww = it.w * it.sx; it.grp.scale.x = it.sx; it.grp.position.set(x + ww / 2, 0, z); x += ww + GAP; });
    });
    const cw = maxW + .7, cd = rows.length * (KD + GAP) - GAP + .7;
    if (caseMesh) { board.remove(caseMesh); caseMesh.geometry.dispose(); caseMesh.material.dispose(); }
    caseMesh = new THREE.Mesh(new RoundedBoxGeometry(cw, .5, cd, 4, .22), new THREE.MeshStandardMaterial({ color: 0xd3cab5, roughness: .6 }));
    caseMesh.position.y = -KH / 2 - .18; caseMesh.receiveShadow = true; caseMesh.castShadow = true; board.add(caseMesh);
    fitted = { w: cw, d: cd };
    fit();
  }
  const ELEV = .92; // camera elevation (radians above the desk)
  function fit() {
    const W = host.clientWidth || 600;
    const visW = fitted.w * 1.04, visH = fitted.d * Math.sin(ELEV) + .9 * Math.cos(ELEV) + .5;
    const H = Math.round(W * visH / visW); host.style.height = H + 'px';
    r.setSize(W, H, false); dirty = true;
    cam.left = -visW / 2; cam.right = visW / 2; cam.top = visH / 2; cam.bottom = -visH / 2;
    cam.position.set(0, Math.sin(ELEV) * 40, Math.cos(ELEV) * 40); cam.lookAt(0, -.1, 0); cam.updateProjectionMatrix();
    // tell the page where the first key is, for the "click me" cue
    if (onCue) {
      const v = items[0].grp.getWorldPosition(new THREE.Vector3()); v.y += KH / 2; v.project(cam);
      onCue({ x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H });
    }
  }
  board.updateMatrixWorld(true);
  const ro = new ResizeObserver(() => { layout(); }); ro.observe(host); layout();
  r.compile(scene, cam); // compile shaders now, not on first scroll into view

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), caps = items.map(it => it.cap);
  let hoverI = -1, selI = -1, downAt = null;
  const el = r.domElement;
  function pick(e) { const b = el.getBoundingClientRect(); ptr.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ptr, cam); const h = ray.intersectObjects(caps, false)[0]; return h ? h.object.userData.i : -1; }
  const onMove = e => { if (e.pointerType !== 'mouse') return; const i = pick(e); hoverI = i; el.style.cursor = i >= 0 ? 'pointer' : ''; if (i >= 0) onHover(i); };
  const onLeave = () => { hoverI = -1; };
  const onDown = e => { downAt = { x: e.clientX, y: e.clientY, i: pick(e) }; if (e.pointerType === 'mouse' && downAt.i >= 0) onPress(downAt.i); };
  const onUp = e => { if (!downAt) return; if (e.pointerType !== 'mouse' && downAt.i >= 0 && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 10) onPress(downAt.i); downAt = null; };
  el.addEventListener('pointermove', onMove); el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointerup', onUp);

  const stop = visibleLoop(host, dt => {
    let moving = dirty; dirty = false;
    items.forEach((it, i) => {
      const before = it.press + it.hover + it.sel;
      it.press = Math.max(0, it.press - dt * 5);
      it.hover += ((i === hoverI ? 1 : 0) - it.hover) * Math.min(1, dt * 14);
      it.sel += ((i === selI ? 1 : 0) - it.sel) * Math.min(1, dt * 10);
      const p = Math.sin(Math.min(1, it.press) * Math.PI / 2);
      it.grp.position.y = it.hover * .07 - p * .26;
      it.mat.emissive.setRGB(.28 * it.sel, .08 * it.sel, .02 * it.sel);
      if (Math.abs(it.press + it.hover + it.sel - before) > 1e-4) moving = true;
    });
    if (moving) r.render(scene, cam);
  });

  return {
    press(i) { items[i].press = 1; dirty = true; },
    select(i) { selI = i; dirty = true; },
    dispose() {
      stop(); ro.disconnect();
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointerup', onUp);
      textures.forEach(t => t.dispose());
      host.style.height = '';
      disposeAll(scene, r);
    },
  };
}
