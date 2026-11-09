import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function makeRenderer(host) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(1.5, devicePixelRatio));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(r.domElement);
  return r;
}
export function addEnv(r, scene) {
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  pm.dispose();
}
export function keyLight(scene, pos) {
  const d = new THREE.DirectionalLight(0xfff4e6, 2.4); d.position.set(...pos); d.castShadow = true;
  d.shadow.mapSize.set(512, 512); d.shadow.radius = 6;
  Object.assign(d.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 30 });
  scene.add(d); scene.add(new THREE.AmbientLight(0xffffff, .25));
}
export function shadowFloor(scene, y, size = 14, opacity = .2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}
// run `tick` every frame only while `el` is on screen; returns a stop function
export function visibleLoop(el, tick) {
  let vis = false, raf = 0, last = performance.now(), dead = false;
  const loop = t => { if (dead) return; const dt = Math.min(.05, (t - last) / 1000); last = t; tick(dt, t / 1000); if (vis) raf = requestAnimationFrame(loop); };
  const io = new IntersectionObserver(([e]) => {
    vis = e.isIntersecting;
    if (vis) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  });
  io.observe(el);
  return () => { dead = true; io.disconnect(); cancelAnimationFrame(raf); };
}
export function disposeAll(scene, r) {
  scene.traverse(o => {
    o.geometry?.dispose?.();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    ms.forEach(m => { m.map?.dispose?.(); m.dispose?.(); });
  });
  scene.environment?.dispose?.();
  r.dispose(); r.forceContextLoss?.();
  r.domElement.remove();
}
