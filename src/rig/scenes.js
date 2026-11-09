/* Live project previews, drawn on canvas in a 640×360 space. */
const MONO = '"JetBrains Mono", ui-monospace, monospace';
function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }

export const SC = {};

SC.rum = function (g, t) {
  g.fillStyle = '#0f1316'; g.fillRect(0, 0, 640, 360);
  g.fillStyle = '#d9e7e1'; g.font = '700 15px ' + MONO; g.fillText('WebVizion · real user monitoring', 24, 34);
  g.fillStyle = '#6f8a80'; g.font = '11px ' + MONO; g.fillText('preview', 24, 52);
  const kp = [['p95 load', (1.9 + Math.sin(t * .9) * .25).toFixed(2) + ' s', '#a6ff8f'], ['errors / min', String(Math.round(6 + Math.sin(t * 1.7) * 3 + Math.sin(t * 4.1) * 1.5)), '#ff7a52'], ['sessions', String(1200 + Math.floor(t * 7) % 800), '#ffd166']];
  kp.forEach(([k, v, c], i) => {
    const x = 24 + i * 202; rr(g, x, 66, 186, 64, 10); g.fillStyle = '#172027'; g.fill();
    g.fillStyle = '#7f9a90'; g.font = '11px ' + MONO; g.fillText(k, x + 14, 88); g.fillStyle = c; g.font = '700 22px ' + MONO; g.fillText(v, x + 14, 118);
  });
  const X0 = 24, X1 = 616, Y0 = 150, Y1 = 330; g.strokeStyle = '#1f2b33'; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const y = Y0 + (Y1 - Y0) * i / 4; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); }
  const N = 70, f = i => { const u = i * .22 + t * 1.6; return .5 + .22 * Math.sin(u) + .12 * Math.sin(u * 2.7 + 1) + .06 * Math.sin(u * 6.1); };
  for (let i = 0; i < N; i++) { const e = Math.max(0, Math.sin(i * .9 + t * 3) * Math.sin(i * .37 + t)); const x = X0 + (X1 - X0) * i / (N - 1); g.fillStyle = 'rgba(255,91,46,.55)'; g.fillRect(x - 2, Y1 - e * 36, 4, e * 36); }
  g.beginPath(); for (let i = 0; i < N; i++) { const x = X0 + (X1 - X0) * i / (N - 1), y = Y1 - (Y1 - Y0) * f(i); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.strokeStyle = '#a6ff8f'; g.lineWidth = 2.5; g.stroke();
  g.lineTo(X1, Y1); g.lineTo(X0, Y1); g.closePath(); g.fillStyle = 'rgba(166,255,143,.08)'; g.fill();
  const cx = X0 + (X1 - X0) * ((t * .12) % 1); g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx, Y0); g.lineTo(cx, Y1); g.stroke(); g.setLineDash([]);
};

SC.batch = function (g, t) {
  g.fillStyle = '#101214'; g.fillRect(0, 0, 640, 360);
  g.fillStyle = '#e9e4d8'; g.font = '700 15px ' + MONO; g.fillText('Batching + async processing', 24, 34);
  g.fillStyle = '#8a8274'; g.font = '11px ' + MONO; g.fillText('many small events in → one batched request out', 24, 52);
  const P = 3.2, ph = t % P, cyc = Math.floor(t / P);
  for (let i = 0; i < 6; i++) { const y = 86 + i * 42; rr(g, 24, y, 74, 30, 6); g.fillStyle = '#24282c'; g.fill(); g.fillStyle = '#9aa4ac'; g.font = '10px ' + MONO; g.fillText('client ' + (i + 1), 32, y + 19); }
  rr(g, 262, 140, 130, 96, 12); g.fillStyle = '#1f2a22'; g.fill(); g.strokeStyle = '#a6ff8f'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#a6ff8f'; g.font = '700 12px ' + MONO; g.fillText('BATCHER', 294, 164);
  let arrived = 0;
  for (let k = 0; k < 14; k++) {
    const st = k * .13, u = (ph - st) / .55; const i = (k * 5 + cyc) % 6;
    const sx = 98, sy = 101 + i * 42, ex = 262, ey = 188;
    if (u < 0) continue; if (u >= 1) { arrived++; continue; }
    const e = u * u * (3 - 2 * u); g.beginPath(); g.arc(sx + (ex - sx) * e, sy + (ey - sy) * e, 4.5, 0, 7); g.fillStyle = '#ffd166'; g.fill();
  }
  for (let k = 0; k < Math.min(arrived, 14); k++) { g.fillStyle = '#ffd166'; g.fillRect(276 + (k % 7) * 15, 186 + Math.floor(k / 7) * 16, 10, 10); }
  rr(g, 500, 140, 116, 96, 12); g.fillStyle = '#2a1d18'; g.fill(); g.strokeStyle = '#ff7a52'; g.stroke();
  g.fillStyle = '#ff9b7a'; g.font = '700 12px ' + MONO; g.fillText('INGEST API', 514, 164);
  if (ph > 2.25) { const u = Math.min(1, (ph - 2.25) / .6), e = u * u * (3 - 2 * u); rr(g, 392 + (500 - 392 - 44) * e, 176, 44, 26, 5); g.fillStyle = '#ff5b2e'; g.fill(); g.fillStyle = '#fff'; g.font = '700 10px ' + MONO; g.fillText('×14', 400 + (500 - 392 - 44) * e, 193); }
  g.strokeStyle = '#3a3f44'; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(392, 188); g.lineTo(500, 188); g.stroke(); g.setLineDash([]);
  rr(g, 24, 340 - 38, 592, 30, 8); g.fillStyle = '#1b1f22'; g.fill();
  g.fillStyle = '#cfc8bb'; g.font = '12px ' + MONO; g.fillText('network overhead  ', 38, 322);
  const w = 360 * (1 - .8 * Math.min(1, ph / 2.6)); g.fillStyle = '#ff5b2e'; g.fillRect(190, 312, w, 12);
  g.fillStyle = '#fff'; g.fillText(ph > 2.6 ? '−80%' : '', 190 + w + 10, 322);
};

const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR'];
const MOVES = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d4', 'e5d4', 'c3d4', 'c5b4', 'b1c3', 'f6e4', 'e1g1', 'e4c3'];
const GLY = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const sq = m => [m.charCodeAt(0) - 97, 8 - (+m[1])];
function boardAt(n) {
  const b = START.map(r => r.split(''));
  for (let i = 0; i < n; i++) {
    const [fx, fy] = sq(MOVES[i].slice(0, 2)), [tx, ty] = sq(MOVES[i].slice(2)); b[ty][tx] = b[fy][fx]; b[fy][fx] = '.';
    if (MOVES[i] === 'e1g1') { b[7][5] = b[7][7]; b[7][7] = '.'; }
  }
  return b;
}
SC.chess = function (g, t) {
  g.fillStyle = '#14110f'; g.fillRect(0, 0, 640, 360);
  const S8 = 40, X = 24, Y = 20, per = 1.1, cycle = MOVES.length * per + 2.2, tt = t % cycle, n = Math.min(MOVES.length, Math.floor(tt / per)), u = Math.min(1, (tt - n * per) / .45);
  const b = boardAt(n);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#b58863' : '#f0d9b5'; g.fillRect(X + x * S8, Y + y * S8, S8, S8); }
  let mv = null;
  if (n < MOVES.length) {
    const [fx, fy] = sq(MOVES[n].slice(0, 2)), [tx, ty] = sq(MOVES[n].slice(2)); mv = { fx, fy, tx, ty, p: b[fy][fx] };
    g.fillStyle = 'rgba(255,91,46,.35)'; g.fillRect(X + fx * S8, Y + fy * S8, S8, S8); g.fillRect(X + tx * S8, Y + ty * S8, S8, S8);
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '32px "Segoe UI Symbol","DejaVu Sans",serif';
  const draw = (p, px, py) => { const w = p === p.toUpperCase(); g.lineWidth = 2; g.strokeStyle = w ? '#2a2420' : '#d8cfc3'; g.fillStyle = w ? '#fffaf0' : '#1d1b18'; g.strokeText(GLY[p.toLowerCase()], px, py + 2); g.fillText(GLY[p.toLowerCase()], px, py + 2); };
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const p = b[y][x]; if (p === '.' || (mv && x === mv.fx && y === mv.fy)) continue; draw(p, X + x * S8 + S8 / 2, Y + y * S8 + S8 / 2); }
  if (mv && mv.p !== '.') { const e = u * u * (3 - 2 * u); draw(mv.p, X + (mv.fx + (mv.tx - mv.fx) * e) * S8 + S8 / 2, Y + (mv.fy + (mv.ty - mv.fy) * e) * S8 + S8 / 2); }
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const PX = 372; g.fillStyle = '#efe9dc'; g.font = '700 15px ' + MONO; g.fillText('Chess Arena · live', PX, 40);
  g.fillStyle = '#8f877a'; g.font = '11px ' + MONO; g.fillText('preview', PX, 58);
  const clk = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  [['black', 300 - tt * (n % 2 ? 1 : .4)], ['white', 300 - tt * (n % 2 ? .4 : 1)]].forEach(([who, sec], i) => {
    const y = 78 + i * 58; rr(g, PX, y, 244, 44, 8); g.fillStyle = (n % 2 === (i ? 0 : 1)) ? '#3a2a22' : '#221e1b'; g.fill();
    g.fillStyle = '#cfc8bb'; g.font = '12px ' + MONO; g.fillText(who, PX + 14, y + 27); g.fillStyle = '#fff'; g.font = '700 18px ' + MONO; g.fillText(clk(sec), PX + 176, y + 29);
  });
  g.fillStyle = '#8f877a'; g.font = '11px ' + MONO; g.fillText('moves', PX, 212);
  g.fillStyle = '#e8e2d6'; g.font = '12px ' + MONO;
  const start = Math.max(0, Math.floor((n - 1) / 2) - 4) * 2;
  for (let i = start, row = 0; i < n; i += 2, row++) { g.fillText((i / 2 + 1) + '. ' + MOVES[i] + (MOVES[i + 1] && i + 1 < n ? '  ' + MOVES[i + 1] : ''), PX, 232 + row * 18); }
  g.fillStyle = '#a6ff8f'; g.font = '11px ' + MONO; g.fillText('● ws connected · ' + (18 + Math.round(Math.sin(t * 2) * 5)) + ' ms', PX, 340);
};

SC.match = function (g, t) {
  g.fillStyle = '#121417'; g.fillRect(0, 0, 640, 360);
  g.fillStyle = '#e9e4d8'; g.font = '700 15px ' + MONO; g.fillText('Matchmaking & reconnection', 24, 34);
  const P = 7, ph = t % P;
  const A = [150, 190], B = [490, 190];
  const player = (x, y, name, c) => { g.beginPath(); g.arc(x, y, 38, 0, 7); g.fillStyle = '#22262b'; g.fill(); g.strokeStyle = c; g.lineWidth = 2.5; g.stroke(); g.fillStyle = c; g.font = '700 30px "Segoe UI Symbol","DejaVu Sans",serif'; g.textAlign = 'center'; g.fillText(name, x, y + 11); g.textAlign = 'left'; };
  let status = '', col = '#cfc8bb';
  if (ph < 2.2) {
    for (let i = 0; i < 3; i++) { const r = ((ph * 60 + i * 40) % 120); g.beginPath(); g.arc(A[0], A[1], 38 + r, 0, 7); g.strokeStyle = 'rgba(166,255,143,' + (1 - r / 120) * .5 + ')'; g.lineWidth = 2; g.stroke(); }
    status = 'searching for an opponent' + '.'.repeat(1 + Math.floor(ph * 3) % 3);
  }
  const linked = ph >= 2.2, broken = ph >= 4.2 && ph < 5.4;
  if (linked) {
    g.lineWidth = 3; g.strokeStyle = broken ? '#ff5b2e' : '#a6ff8f'; if (broken) g.setLineDash([8, 10]);
    g.beginPath(); g.moveTo(A[0] + 40, A[1]); g.lineTo(B[0] - 40, B[1]); g.stroke(); g.setLineDash([]);
    if (!broken) for (let k = 0; k < 3; k++) { const u = ((ph * .7 + k / 3) % 1); const dirAB = k % 2 === 0; const x = dirAB ? A[0] + 40 + (B[0] - A[0] - 80) * u : B[0] - 40 - (B[0] - A[0] - 80) * u; rr(g, x - 14, A[1] - 9, 28, 18, 4); g.fillStyle = '#ffd166'; g.fill(); g.fillStyle = '#1d1b18'; g.font = '700 9px ' + MONO; g.fillText('mv', x - 8, A[1] + 4); }
    if (ph < 4.2) { status = ph < 3 ? 'MATCH FOUND · game starting' : 'playing · moves validated on server'; col = '#a6ff8f'; }
    else if (broken) { status = 'connection lost · reconnecting'; col = '#ff7a52'; const a = ph * 6; g.beginPath(); g.arc(320, 190, 16, a, a + 4.4); g.strokeStyle = '#ff7a52'; g.lineWidth = 3; g.stroke(); }
    else { status = 'reconnected · game resumed'; col = '#a6ff8f'; }
  }
  player(A[0], A[1], '♔', '#efe9dc'); player(B[0], B[1], linked ? '♚' : '?', linked ? '#efe9dc' : '#55504a');
  g.fillStyle = '#8f877a'; g.font = '11px ' + MONO; g.fillText('you', A[0] - 12, A[1] + 62); if (linked) g.fillText('opponent', B[0] - 28, B[1] + 62);
  rr(g, 24, 296, 592, 40, 8); g.fillStyle = '#1b1e22'; g.fill(); g.fillStyle = col; g.font = '13px ' + MONO; g.fillText('> ' + status, 40, 321);
};

SC.hmi = function (g, t) {
  g.fillStyle = '#1b1d1f'; g.fillRect(0, 0, 640, 360);
  g.fillStyle = '#e9e4d8'; g.font = '700 15px ' + MONO; g.fillText('EquipControl · supervisory panel', 24, 34);
  g.fillStyle = '#8a8274'; g.font = '11px ' + MONO; g.fillText('preview', 24, 52);
  const gauges = [['PRESSURE', .55 + .18 * Math.sin(t * .8)], ['TEMP', .42 + .1 * Math.sin(t * .5 + 1)], ['SPEED', .66 + .22 * Math.sin(t * 1.3 + 2)]];
  gauges.forEach(([lab, v], i) => {
    const cx = 110 + i * 210, cy = 160, R = 62;
    g.lineWidth = 10; g.strokeStyle = '#2c3034'; g.beginPath(); g.arc(cx, cy, R, Math.PI * .8, Math.PI * 2.2); g.stroke();
    g.strokeStyle = v > .8 ? '#ff5b2e' : '#a6ff8f'; g.beginPath(); g.arc(cx, cy, R, Math.PI * .8, Math.PI * (.8 + 1.4 * v)); g.stroke();
    const a = Math.PI * (.8 + 1.4 * v); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14)); g.stroke();
    g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fillStyle = '#fff'; g.fill();
    g.fillStyle = '#9aa4ac'; g.font = '11px ' + MONO; g.textAlign = 'center'; g.fillText(lab, cx, cy + 44); g.fillStyle = '#fff'; g.font = '700 15px ' + MONO; g.fillText(Math.round(v * 100) + '%', cx, cy + 64); g.textAlign = 'left';
  });
  const lamps = [['RUN', '#3ddc5c', true], ['COMM', '#3ddc5c', Math.sin(t * 9) > -.2], ['INTERLOCK', '#ffd166', Math.sin(t * .7) > .6], ['FAULT', '#ff3b30', false]];
  lamps.forEach(([l, c, on], i) => {
    const x = 40 + i * 150; g.beginPath(); g.arc(x, 290, 9, 0, 7); g.fillStyle = on ? c : '#33373b'; g.fill(); if (on) { g.shadowColor = c; g.shadowBlur = 14; g.fill(); g.shadowBlur = 0; }
    g.fillStyle = '#cfc8bb'; g.font = '11px ' + MONO; g.fillText(l, x + 16, 294);
  });
  rr(g, 24, 316, 592, 26, 6); g.fillStyle = '#232629'; g.fill(); g.fillStyle = '#a6ff8f'; g.font = '11px ' + MONO; g.fillText('mode: AUTO · last change request applied · all interlocks healthy', 36, 333);
};

const GT = ['Interlock.TripsOnOverpressure', 'Interlock.ResetsAfterAck', 'Telemetry.ParsesFrame', 'Telemetry.RejectsBadChecksum', 'Panel.ShowsFaultLamp', 'Panel.ModeSwitchAutoManual', 'Config.LoadsDefaults', 'Scheduler.RunsCycleOnTime'];
SC.gtest = function (g, t) {
  g.fillStyle = '#0c0e0b'; g.fillRect(0, 0, 640, 360);
  g.font = '13px ' + MONO; const cycle = GT.length * .55 + 2.5, tt = t % cycle, shown = Math.min(GT.length, Math.floor(tt / .55));
  const lines = ['$ ctest --output-on-failure', '[==========] Running ' + GT.length + ' tests'];
  for (let i = 0; i < shown; i++) { lines.push('[ RUN      ] ' + GT[i]); lines.push('[       OK ] ' + GT[i] + ' (' + (1 + (i * 7) % 5) + ' ms)'); }
  if (shown >= GT.length) lines.push('[  PASSED  ] ' + GT.length + ' tests.');
  const vis = lines.slice(-15);
  vis.forEach((l, i) => { g.fillStyle = l.includes('OK ]') || l.includes('PASSED') ? '#a6ff8f' : l.startsWith('$') ? '#fff' : '#9aa4ac'; g.fillText(l, 24, 34 + i * 21); });
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#a6ff8f'; g.fillRect(24, 34 + vis.length * 21 - 12, 9, 15); }
};

export const DUR = { rum: 8, batch: 9.6, chess: MOVES.length * 1.1 + 2.2, match: 7, hmi: 10, gtest: GT.length * .55 + 2.5 };

export function fitCanvas(c) {
  const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = Math.round(r.width * dpr) || 640; c.height = Math.round(r.height * dpr) || 360;
}
export function drawScene(name, c, ctx, t) { ctx.setTransform(c.width / 640, 0, 0, c.height / 360, 0, 0); SC[name](ctx, t); }
