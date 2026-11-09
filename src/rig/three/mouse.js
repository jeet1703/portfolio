import * as THREE from 'three';
import { makeRenderer, addEnv, keyLight, visibleLoop, disposeAll } from './common';
import { rig } from '../bus';

/**
 * The projects mouse. Left button = previous, right button = next, drag to spin.
 * onButtons({l:{x,y}, r:{x,y}}) is called every frame with the screen position of each button
 * (px, relative to the host) so the "this is clickable" cue can track them.
 */
export function createMouse(host, { onStep, onButtons }) {
  const r = makeRenderer(host), scene = new THREE.Scene(); addEnv(r, scene);
  r.toneMappingExposure = .82; scene.environmentIntensity = .45;
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  keyLight(scene, [-2.5, 6, 2.5]);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x2a2825, roughness: .95 }));
  pad.rotation.x = -Math.PI / 2; pad.receiveShadow = true; scene.add(pad);

  const mouse = new THREE.Group(); scene.add(mouse);
  // shell: a squashed sphere with button seams painted in vertex colours
  const geo = new THREE.SphereGeometry(1, 80, 56); geo.scale(.62, .38, 1);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), cA = new THREE.Color(0xc9bfa8), cB = new THREE.Color(0xe4ddcc), cS = new THREE.Color(0x5e584f), tmp = new THREE.Color();
  const SPLIT = -.08;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const top = ss(.0, .08, y), front = ss(SPLIT + .02, SPLIT - .02, z);
    tmp.copy(cA).lerp(cB, front * top);
    const seam = Math.max(front * (1 - ss(.012, .032, Math.abs(x))), 1 - ss(.01, .03, Math.abs(z - SPLIT))) * top;
    tmp.lerp(cS, seam * .85);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const shell = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .42, clearcoat: .5, clearcoatRoughness: .35 }));
  shell.castShadow = true; mouse.add(shell);
  // scroll wheel with ridges
  const wheel = new THREE.Group(); wheel.position.set(0, .35, -.42); mouse.add(wheel);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2a2825, roughness: .55 });
  const wh = new THREE.Mesh(new THREE.CylinderGeometry(.095, .095, .075, 40), wheelMat); wh.rotation.z = Math.PI / 2; wheel.add(wh);
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x4a4640 });
  for (let i = 0; i < 16; i++) { const rd = new THREE.Mesh(new THREE.BoxGeometry(.078, .02, .012), ridgeMat); const a = i / 16 * Math.PI * 2; rd.position.set(0, Math.cos(a) * .097, Math.sin(a) * .097); rd.rotation.x = a; wheel.add(rd); }
  const slot = new THREE.Mesh(new THREE.BoxGeometry(.11, .06, .3), new THREE.MeshStandardMaterial({ color: 0x151412 })); slot.position.set(0, .31, -.42); mouse.add(slot);
  const mled = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff5b2e, emissive: 0x8a2a0e })); mled.position.set(0, .2, .86); mouse.add(mled);
  // cord off the back, toward the PSU somewhere up the page
  const cord = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .03, .98), new THREE.Vector3(0, .03, 1.5), new THREE.Vector3(.35, .03, 2.1), new THREE.Vector3(1.1, .03, 2.6), new THREE.Vector3(2.4, .03, 3.2)]);
  const cordM = new THREE.Mesh(new THREE.TubeGeometry(cord, 80, .04, 10), new THREE.MeshStandardMaterial({ color: 0x1d1b18, roughness: .6 })); cordM.castShadow = true; mouse.add(cordM);

  let W = 1, H = 1;
  function resize() { W = host.clientWidth; H = host.clientHeight; if (!W || !H) return; r.setSize(W, H, false); cam.aspect = W / H; cam.position.set(1.0, 3.9, 2.5); cam.lookAt(0, 0, -.15); cam.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  r.compile(scene, cam); // compile shaders now, not on first scroll into view

  // interactions: click buttons, drag to spin
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let tilt = 0, tiltZ = 0, wheelV = 0, yaw = .22, yawV = 0, dragging = false, dragX = 0, moved = 0;
  const toLocal = new THREE.Matrix4();
  function hit(e) { const b = r.domElement.getBoundingClientRect(); ptr.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ptr, cam); const h = ray.intersectObject(shell, false)[0]; if (!h) return null; toLocal.copy(shell.matrixWorld).invert(); return h.point.clone().applyMatrix4(toLocal); }
  function kick(dir) { tilt = .07; tiltZ = dir * .06; wheelV += dir * 14; }
  const el = r.domElement;
  const onDown = e => { dragging = true; dragX = e.clientX; moved = 0; el.setPointerCapture(e.pointerId); };
  const onMove = e => {
    if (dragging) { const dx = e.clientX - dragX; dragX = e.clientX; moved += Math.abs(dx); yawV = dx * .012; yaw += dx * .012; }
    else if (e.pointerType === 'mouse') el.style.cursor = hit(e) ? 'pointer' : 'grab';
  };
  const onUp = e => {
    dragging = false; if (moved > 6) return;
    const p = hit(e); if (!p) return;
    if (p.z < SPLIT) onStep(p.x < 0 ? -1 : 1); else onStep(1);
  };
  const onCtx = e => e.preventDefault();
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp); el.addEventListener('contextmenu', onCtx);

  // button centres on the shell surface, in mouse-local space
  const BL = new THREE.Vector3(-.3, .27, -.52), BR = new THREE.Vector3(.3, .27, -.52), tv = new THREE.Vector3();
  const scr = p => { tv.copy(p).applyMatrix4(mouse.matrixWorld).project(cam); return { x: (tv.x + 1) / 2 * W, y: (1 - tv.y) / 2 * H }; };

  let lastScroll = scrollY;
  const stop = visibleLoop(host, (dt, t) => {
    const ds = scrollY - lastScroll; lastScroll = scrollY; wheelV += ds * .02;
    wheel.rotation.x += wheelV * dt; wheelV *= Math.pow(.02, dt);
    if (!dragging) { yaw += yawV; yawV *= Math.pow(.05, dt); yaw += (.22 - yaw) * Math.min(1, dt * 1.5); }
    tilt *= Math.pow(.0005, dt); tiltZ *= Math.pow(.0005, dt);
    mouse.rotation.set(tilt, yaw + (rig.reduce ? 0 : Math.sin(t * .8) * .04), tiltZ);
    if (onButtons) { mouse.updateMatrixWorld(); onButtons({ l: scr(BL), r: scr(BR) }); }
    r.render(scene, cam);
  });

  return {
    kick,
    dispose() {
      stop(); ro.disconnect();
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp); el.removeEventListener('contextmenu', onCtx);
      disposeAll(scene, r);
    },
  };
}
