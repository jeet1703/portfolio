import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeRenderer, addEnv, keyLight, shadowFloor, visibleLoop, disposeAll } from './common';
import { rig } from '../bus';

/**
 * The hero power supply. Clicking it calls onToggle().
 * onLayout({sw, box, W, H}) reports the switch position and the PSU's screen box (px, relative
 * to the host) so the "click here" callout can sit beside the PSU instead of on top of it.
 */
export function createPsu(host, { onToggle, onLayout }) {
  const r = makeRenderer(host), scene = new THREE.Scene(); addEnv(r, scene);
  const cam = new THREE.PerspectiveCamera(28, 1, .1, 100);
  keyLight(scene, [4, 9, 6]);
  const rig3 = new THREE.Group(); scene.add(rig3);
  const metal = new THREE.MeshStandardMaterial({ color: 0x2c2a27, metalness: .55, roughness: .4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111110, roughness: .8 });
  const bodyM = new THREE.Mesh(new RoundedBoxGeometry(3, 1.6, 2.4, 5, .1), metal); bodyM.castShadow = true; rig3.add(bodyM);

  // fan on top
  const fan = new THREE.Group(); fan.position.y = .8; rig3.add(fan);
  const recess = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, .02, 72), new THREE.MeshStandardMaterial({ color: 0x121110, roughness: .95 })); recess.position.y = .005; fan.add(recess);
  const blades = new THREE.Group(); blades.position.y = .03; fan.add(blades);
  const bs = new THREE.Shape(); bs.moveTo(.12, 0); bs.bezierCurveTo(.25, .32, .6, .72, .92, .6); bs.bezierCurveTo(.68, .38, .38, .12, .12, 0);
  const bladeGeo = new THREE.ShapeGeometry(bs, 16), bladeMat = new THREE.MeshStandardMaterial({ color: 0x403c36, roughness: .55, metalness: .1, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const g = new THREE.Group(); g.rotation.y = i * Math.PI * 2 / 7; const m = new THREE.Mesh(bladeGeo, bladeMat); m.rotation.x = -Math.PI / 2; m.rotation.y = .18; g.add(m); blades.add(g); }
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xff5b2e, roughness: .4, emissive: 0x000000 });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .05, 48), hubMat); hub.position.y = .035; blades.add(hub);
  const chrome = new THREE.MeshStandardMaterial({ color: 0x6a655c, metalness: .85, roughness: .3 });
  [.32, .48, .64, .8, .96].forEach(rad => { const t = new THREE.Mesh(new THREE.TorusGeometry(rad, .013, 8, 120), chrome); t.rotation.x = Math.PI / 2; t.position.y = .075; fan.add(t); });
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.96, .02, .035), chrome); b.position.y = .075; b.rotation.y = k * Math.PI / 4; fan.add(b); }

  // spec sticker on the front face
  const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 520; const g = lc.getContext('2d');
  g.fillStyle = '#f6f2e8'; g.fillRect(0, 0, 1024, 520);
  g.fillStyle = '#1d1b18'; g.font = '800 70px "Bricolage Grotesque", sans-serif'; g.fillText('PS-2026', 48, 100);
  g.fillRect(668, 48, 308, 62); g.fillStyle = '#f6f2e8'; g.font = '700 30px "JetBrains Mono", monospace'; g.fillText('80+ BACKEND', 694, 90);
  const rowsL = [['AC INPUT', 'coffee, chai'], ['+12V RAIL', 'REST · SOAP APIs'], ['+5V RAIL', 'Kafka · Redis'], ['LOAD TESTED', '45,000 req/hr'], ['MADE IN', 'Delhi NCR, IN']];
  rowsL.forEach(([a, b], i) => {
    const y = 180 + i * 66; g.fillStyle = '#cfc5ae'; g.fillRect(48, y - 46, 928, 2);
    g.fillStyle = '#2f2b26'; g.font = '600 30px "JetBrains Mono", monospace'; g.textAlign = 'left'; g.fillText(a, 48, y);
    g.fillStyle = '#1d1b18'; g.font = '700 30px "JetBrains Mono", monospace'; g.textAlign = 'right'; g.fillText(b, 976, y); g.textAlign = 'left';
  });
  g.fillStyle = '#ff5b2e'; g.fillRect(0, 504, 1024, 16);
  const tex = new THREE.CanvasTexture(lc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const sticker = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 1.2), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 }));
  sticker.position.set(0, .05, 1.202); rig3.add(sticker);

  // power inlet, rocker switch and LED on the right side
  const iec = new THREE.Mesh(new THREE.BoxGeometry(.05, .46, .66), black); iec.position.set(1.51, .12, -.6); rig3.add(iec);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x9a958b, metalness: .9, roughness: .3 });
  for (let i = -1; i <= 1; i++) { const pin = new THREE.Mesh(new THREE.BoxGeometry(.03, .14, .05), pinMat); pin.position.set(1.54, .12 + (i === 0 ? .07 : 0), -.6 + i * .17); rig3.add(pin); }
  const housing = new THREE.Mesh(new THREE.BoxGeometry(.06, .66, .44), black); housing.position.set(1.51, .12, .32); rig3.add(housing);
  const rocker = new THREE.Group(); rocker.position.set(1.55, .12, .32); rig3.add(rocker);
  const rockerMesh = new THREE.Mesh(new THREE.BoxGeometry(.08, .54, .34), new THREE.MeshStandardMaterial({ color: 0x252321, roughness: .5 })); rocker.add(rockerMesh);
  const markOn = new THREE.MeshStandardMaterial({ color: 0x77716a, emissive: 0x000000 });
  const markI = new THREE.Mesh(new THREE.BoxGeometry(.02, .13, .035), markOn); markI.position.set(.045, .15, 0); rocker.add(markI);
  const markO = new THREE.Mesh(new THREE.TorusGeometry(.055, .013, 8, 32), new THREE.MeshStandardMaterial({ color: 0x77716a })); markO.position.set(.045, -.15, 0); markO.rotation.y = Math.PI / 2; rocker.add(markO);
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x3a1a12, emissive: 0x000000 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), ledMat); led.position.set(1.52, -.5, .32); rig3.add(led);
  const ledLight = new THREE.PointLight(0x3ddc5c, 0, 1.5); ledLight.position.set(1.7, -.5, .32); rig3.add(ledLight);

  // the output cable: leaves the front, drops out of frame and becomes the page cable
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x1d1b18, roughness: .55 });
  const conn = new THREE.Mesh(new RoundedBoxGeometry(.42, .24, .2, 3, .04), new THREE.MeshStandardMaterial({ color: 0x2a2825, roughness: .6 })); conn.position.set(-.85, -.45, 1.28); rig3.add(conn);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.85, -.45, 1.36), new THREE.Vector3(-.85, -.5, 1.75), new THREE.Vector3(-.8, -1.3, 2.05), new THREE.Vector3(-.7, -3, 2.15), new THREE.Vector3(-.65, -9, 2.15)]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, .075, 16), cableMat); tube.castShadow = true; rig3.add(tube);

  shadowFloor(scene, -1.32, 14, .22);

  // boot terminal: a little CRT that pops up over the PSU when it powers on
  const term = new THREE.Group(); term.visible = false; scene.add(term);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1c1b19, roughness: .5, metalness: .2 });
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(2.5, 1.5, .22, 4, .08), bezelMat); bezel.castShadow = true; term.add(bezel);
  const tc = document.createElement('canvas'); tc.width = 640; tc.height = 352; const tg = tc.getContext('2d');
  const ttex = new THREE.CanvasTexture(tc); ttex.colorSpace = THREE.SRGBColorSpace; ttex.anisotropy = 8;
  const screenMat = new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.265), screenMat); screen.position.z = .112; term.add(screen);
    const termLight = new THREE.PointLight(0xa6ff8f, 0, 3); termLight.position.set(0, 0, .6); term.add(termLight);
  let bootLines = [], blinkOn = true;
  const TERM_SCALE = .82, termBase = new THREE.Vector3(-1.7, 1.75, .1);
  // keep the open terminal fully inside the canvas: measure its on-screen box and nudge it in
  function fitTerm() {
    if (!W || !Hh) return;
    const base = new THREE.Vector3(-1.7, 1.75, .1), right = new THREE.Vector3(), up = new THREE.Vector3();
    cam.updateMatrixWorld(); right.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
    const pad = 12;
    for (let k = 0; k < 4; k++) {
      term.position.copy(base); term.quaternion.copy(cam.quaternion); term.rotateZ(.05); term.scale.setScalar(TERM_SCALE);
      term.updateMatrixWorld(true);
      let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
      for (const x of [-1.25, 1.25]) for (const y of [-.75, .75]) for (const z of [-.11, .11]) {
        const q = toScreen(new THREE.Vector3(x, y, z).applyMatrix4(term.matrixWorld));
        l = Math.min(l, q.x); r = Math.max(r, q.x); t = Math.min(t, q.y); b = Math.max(b, q.y);
      }
      const wpp = 2.5 * TERM_SCALE / Math.max(1, r - l); // world units per pixel at the terminal
      let dx = 0, dy = 0;
      if (l < pad) dx = pad - l; else if (r > W - pad) dx = W - pad - r;
      if (t < pad) dy = -(pad - t); else if (b > Hh - pad) dy = b - (Hh - pad);
      if (!dx && !dy) break;
      base.addScaledVector(right, dx * wpp).addScaledVector(up, dy * wpp);
    }
    termBase.copy(base);
  }
  function drawTerm() {
    tg.fillStyle = '#0b0e0a'; tg.fillRect(0, 0, 640, 352);
    const gr = tg.createRadialGradient(320, 176, 40, 320, 176, 380); gr.addColorStop(0, 'rgba(166,255,143,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
    tg.fillStyle = gr; tg.fillRect(0, 0, 640, 352);
    tg.font = '600 15px "JetBrains Mono", monospace'; tg.fillStyle = '#6c8f63'; tg.fillText('PS-2026 · boot', 26, 34);
    tg.font = '500 19px "JetBrains Mono", monospace';
    bootLines.forEach(([a, b], i) => {
      const y = 70 + i * 36; tg.fillStyle = '#a6ff8f'; tg.fillText(a, 26, y);
      tg.fillStyle = '#ffffff'; tg.textAlign = 'right'; tg.fillText(b, 614, y); tg.textAlign = 'left';
    });
    if (blinkOn) { tg.fillStyle = '#a6ff8f'; tg.fillRect(26, 70 + bootLines.length * 36 - 16, 11, 20); }
    tg.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < 352; y += 3) tg.fillRect(0, y, 640, 1);
    ttex.needsUpdate = true;
  }
  drawTerm();

  // shockwave rings that roll out across the desk when the PSU is clicked
  const waves = [0, 1].map(() => {
    const m = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 96), new THREE.MeshBasicMaterial({ color: 0x3ddc5c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = -1.3; scene.add(m); return m;
  });
  let kickT = 0;

  let W = 1, Hh = 1;
  const v3 = new THREE.Vector3();
  const toScreen = p => { v3.copy(p).project(cam); return { x: (v3.x + 1) / 2 * W, y: (1 - v3.y) / 2 * Hh }; };
  function resize() {
    W = host.clientWidth; Hh = host.clientHeight; if (!W || !Hh) return;
    r.setSize(W, Hh, false); cam.aspect = W / Hh;
    cam.fov = W < 520 ? 34 : 28;
    cam.position.set(5.6, 4.2, 7.2); cam.lookAt(0, -.15, 0); cam.updateProjectionMatrix();
    rig3.updateMatrixWorld(true);
    rig.cableStart = cableStart; rig.rebuildCable();
    // where the switch is, and the screen box of the PSU body (+ fan) for the callout
    const sw = toScreen(rocker.getWorldPosition(new THREE.Vector3()));
    const box = { l: 1e9, t: 1e9, r: -1e9, b: -1e9 };
    for (const x of [-1.5, 1.6]) for (const y of [-.8, .9]) for (const z of [-1.2, 1.2]) {
      const p = toScreen(new THREE.Vector3(x, y, z).applyMatrix4(rig3.matrixWorld));
      box.l = Math.min(box.l, p.x); box.r = Math.max(box.r, p.x); box.t = Math.min(box.t, p.y); box.b = Math.max(box.b, p.y);
    }
    onLayout?.({ sw, box, W, H: Hh });
    fitTerm();
  }
  // find where the 3D cable crosses the bottom edge of the canvas, in page pixels
  function cableStart() {
    const rect = host.getBoundingClientRect(); if (!rect.width) return null;
    const v = new THREE.Vector3(), prev = { x: 0, y: 0 };
    for (let i = 0; i <= 300; i++) {
      v.copy(curve.getPoint(i / 300)).applyMatrix4(rig3.matrixWorld).project(cam);
      const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * Hh;
      if (sy >= Hh) {
        const k = i ? (Hh - prev.y) / (sy - prev.y) : 0, x = prev.x + (sx - prev.x) * k;
        const p = curve.getPoint(i / 300).applyMatrix4(rig3.matrixWorld), a = p.clone().project(cam), b = p.clone().add(new THREE.Vector3(.075, 0, 0)).project(cam);
        const w = Math.abs((b.x - a.x) / 2 * W) * 2;
        return { x: rect.left + scrollX + x, y: rect.top + scrollY + Hh - 1, w };
      }
      prev.x = sx; prev.y = sy;
    }
    return null;
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  r.compile(scene, cam); // compile shaders now, not on first scroll into view

  // click the PSU (or its switch) to power the page
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let hover = false;
  const hitTargets = [bodyM, sticker, rockerMesh, housing, recess, iec];
  function pick(e) { const b = r.domElement.getBoundingClientRect(); ptr.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ptr, cam); return ray.intersectObjects(hitTargets, false)[0]; }
  const onMove = e => { hover = !!pick(e); r.domElement.style.cursor = hover ? 'pointer' : ''; };
  const onLeave = () => { hover = false; };
  const onClick = e => { if (pick(e)) onToggle(e); };
  r.domElement.addEventListener('pointermove', onMove);
  r.domElement.addEventListener('pointerleave', onLeave);
  r.domElement.addEventListener('click', onClick);

  let fanSpeed = 0, rock = -.22, glow = 0, termOpen = 0;
  const stop = visibleLoop(host, (dt, t) => {
    const on = rig.powered;
    fanSpeed += ((on ? 22 : 0) - fanSpeed) * Math.min(1, dt * (on ? 1.1 : .6));
    blades.rotation.y -= fanSpeed * dt;
    rock += ((on ? .22 : -.22) - rock) * Math.min(1, dt * 18); rocker.rotation.z = rock;
    glow += ((on ? 1 : 0) - glow) * Math.min(1, dt * 4);
    ledMat.emissive.setRGB(.24 * glow, .86 * glow, .36 * glow); ledLight.intensity = glow * 1.2;
    markOn.emissive.setRGB(glow, .36 * glow, .18 * glow);
    hubMat.emissive.setRGB(.35 * glow, .1 * glow, .03 * glow);
    const hv = hover && !rig.reduce ? 1 : 0;
    rig3.position.y = (rig.reduce ? 0 : Math.sin(t * 1.4) * .03) + hv * .04;
    rig3.position.x = on && !rig.reduce ? Math.sin(t * 95) * .0025 * glow : 0;
    // click: hop, squash-and-stretch, shockwaves
    if (kickT > 0) {
      kickT = Math.max(0, kickT - dt * 1.4); const p = 1 - kickT;
      const sq = rig.reduce ? 0 : Math.sin(p * Math.PI * 3) * Math.exp(-p * 4) * .14;
      rig3.scale.set(1 + sq * .5, 1 - sq, 1 + sq * .5);
      if (!rig.reduce) rig3.position.y += Math.sin(Math.min(1, p * 2.4) * Math.PI) * .22;
      waves.forEach((w, i) => { const q = Math.max(0, Math.min(1, p * 1.25 - i * .22)); w.scale.setScalar(1.2 + q * 4.5); w.material.opacity = q > 0 && q < 1 ? (1 - q) * .85 : 0; });
      hubMat.emissive.setRGB(.35 * glow + kickT, .1 * glow + kickT * .35, .03 * glow);
    } else rig3.scale.set(1, 1, 1);
    // boot terminal rises out of the PSU with a little overshoot
    termOpen += ((on ? 1 : 0) - termOpen) * Math.min(1, dt * (on ? 3.2 : 6));
    term.visible = termOpen > .02;
    if (term.visible) {
      const e = termOpen * TERM_SCALE, ov = 1 + Math.sin(termOpen * Math.PI) * .12;
      term.scale.set(e * ov, e * ov, e * ov);
      // rises out of the PSU into its fitted spot, with a gentle bob
      term.position.copy(termBase); term.position.y += (termOpen - 1) * .85 + (rig.reduce ? 0 : Math.sin(t * 1.1) * .04);
      term.quaternion.copy(cam.quaternion); term.rotateZ(.05);
      termLight.intensity = e * 1.4 * (rig.reduce ? 1 : .9 + Math.random() * .1);
      const b = Math.floor(t * 2) % 2 === 0; if (b !== blinkOn) { blinkOn = b; drawTerm(); }
    }
    r.render(scene, cam);
  });

  return {
    kick(on) { kickT = 1; waves.forEach(w => w.material.color.set(on ? 0x3ddc5c : 0xff5b2e)); },
    setBoot(lines) { bootLines = lines; drawTerm(); },
    dispose() {
      stop(); ro.disconnect();
      if (rig.cableStart === cableStart) rig.cableStart = null;
      tex.dispose(); ttex.dispose(); disposeAll(scene, r);
    },
  };
}
