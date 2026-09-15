// Iscon Janmahaal — 3600 sq.ft office & coaching floor, modelled from the
// architect's Drawing No. 01 (rev 07, 04-01-2025). Units: metres, y-up.
import * as THREE from 'three';

const FT = 0.3048;
const f = (v) => v * FT;

export const PLAN_W = 75;     // ft, premises interior (measured off the drawing)
export const PLAN_H = 66;
const SHELL = 0.6;
const WALL_H = 9.5;
const SOLID_H = 3.5;          // partition: solid to 3'6", glass above (legend)

// Premises outline, measured on a foot grid laid over the drawing: the plate
// steps in twice on the east/south and is notched on the west, where the lift,
// staircase and 2100mm passage are common building circulation.
const OUTLINE = [[0, 0], [75, 0], [75, 22], [72.5, 22], [72.5, 39], [62.5, 39],
  [62.5, 51], [53, 51], [53, 66], [14, 66], [14, 23.5], [0, 23.5]];


function plate(name, mat, depth, top) {
  const shape = new THREE.Shape(OUTLINE.map(([x, z]) => new THREE.Vector2(f(x - cx), f(z - cz))));
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: f(depth), bevelEnabled: false }), mat);
  m.rotation.x = Math.PI / 2;
  m.position.y = f(top);
  m.name = name;
  m.castShadow = m.receiveShadow = true;
  return m;
}

const M = {
  terrazzo: new THREE.MeshStandardMaterial({ color: 0xe6e0d4, roughness: 0.75 }),
  carpet:   new THREE.MeshStandardMaterial({ color: 0x7d7a6d, roughness: 0.97 }),
  tile:     new THREE.MeshStandardMaterial({ color: 0xcfd2cd, roughness: 0.55 }),
  masonry:  new THREE.MeshStandardMaterial({ color: 0xded7c9, roughness: 0.9 }),
  walnut:   new THREE.MeshStandardMaterial({ color: 0x6b4429, roughness: 0.6 }),
  glass:    new THREE.MeshStandardMaterial({ color: 0xa8c0c6, roughness: 0.08, transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
  fabric:   new THREE.MeshStandardMaterial({ color: 0x2c625e, roughness: 0.92 }),
  metal:    new THREE.MeshStandardMaterial({ color: 0xb6b9bd, roughness: 0.35, metalness: 0.35 }),
  ink:      new THREE.MeshStandardMaterial({ color: 0x2f3234, roughness: 0.5 }),
  plinth:   new THREE.MeshStandardMaterial({ color: 0x3a3a37, roughness: 0.9 }),
  inUse:    new THREE.MeshStandardMaterial({ color: 0xd6c7a3, roughness: 0.85 }),
  common:   new THREE.MeshStandardMaterial({ color: 0xcac5b8, roughness: 0.95 }),
  commonFl: new THREE.MeshStandardMaterial({ color: 0xdcd7ca, roughness: 0.95 }),
};
for (const k in M) M[k].name = k;

// ---------------------------------------------------------------- primitives
let cx = 0, cz = 0;
const box = (name, mat, w, h, d, x, y, z, ry = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(f(w), f(h), f(d)), mat);
  m.position.set(f(x - cx), f(y) + f(h) / 2, f(z - cz));
  m.rotation.y = ry;
  m.name = name;
  m.castShadow = m.receiveShadow = true;
  return m;
};
const cyl = (name, mat, r, h, x, y, z, seg = 20) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(f(r), f(r), f(h), seg), mat);
  m.position.set(f(x - cx), f(y) + f(h) / 2, f(z - cz));
  m.name = name;
  m.castShadow = m.receiveShadow = true;
  return m;
};

// ---------------------------------------------------------------- rooms
const rooms = [
  { id: 'demo',      n: 'DEMO ROOM',        d: `13'07" × 13'06"`,           r: [0, 0, 13.6, 13.5],      door: ['s', 0.78], fit: 'board',   a: 186.32, p: 'Pre-counseling, meetings, product demos', c: '7 seater', use: true },
  { id: 'counsel1',  n: 'COUNSELING · 1',   d: `10'06" × 10'11"`,           r: [15.5, 0, 26, 10.9],     door: ['s', 0.5],  fit: 'counsel', a: 122.96, p: 'Counseling — front of reception', c: '2 counselors · 4 visitors', use: true },
  { id: 'audi1',     n: 'AUDITORIUM · 1',   d: `24'11" × 22'06" · 60 seat`, r: [26.4, 0, 51.3, 22.5],   door: ['s', 0.14], fit: 'lecture', seats: 60, a: 562.5, p: 'Coaching', c: '60 seater', use: false },
  { id: 'audi2',     n: 'AUDITORIUM · 2',   d: `24'00" × 20'11" · 60 seat`, r: [51.7, 0, 75, 20.9],     door: ['s', 0.2],  fit: 'lecture', seats: 60, a: 504, p: 'Coaching', c: '60 seater', use: false },
  { id: 'maleWR',    n: 'MALE WASHROOM',    d: `08'06" × 06'06"`,           r: [0, 16.5, 8.5, 23],      wall: 'masonry', floor: 'tile', door: ['e', 0.7], fit: 'wc', a: 55.25, p: 'Washroom', c: '—', use: true },
  { id: 'femWR',     n: 'FEMALE WASHROOM',  d: `06'06" × 05'00"`,           r: [8.5, 18, 15, 23],       wall: 'masonry', floor: 'tile', door: ['n', 0.65], fit: 'wc', a: 32.5, p: 'Washroom', c: '—', use: true },
  { id: 'reception', n: 'RECEPTION',        d: `12'09" × 18'05"`,           r: [14.6, 23, 27.35, 41.4], door: ['w', 0.38], fit: 'reception', a: 238.65, p: 'Reception & waiting', c: '10 seater', use: true },
  { id: 'counsel2',  n: 'COUNSELING · 2',   d: `09'07" × 09'10"`,           r: [14.6, 41.4, 24.2, 51.3],door: ['e', 0.2],  fit: 'counsel', a: 97, p: 'Counseling — behind reception', c: '2 counselors · 4 visitors', use: true },
  { id: 'counsel3',  n: 'COUNSELING · 3',   d: `09'07" × 10'00"`,           r: [14.6, 52, 24.2, 62],    door: ['e', 0.2],  fit: 'counsel', a: 97, p: "Counseling — beside manager's cabin", c: '2 counselors · 4 visitors', use: true },
  { id: 'cmCabin',   n: 'CENTER MANAGER',   d: `10'05" × 08'07"`,           r: [25, 57, 35.4, 65.6],    door: ['n', 0.15], fit: 'manager', a: 91.35, p: "Counseling, center manager's desk", c: '1 main desk · 3 visitors · 1 assistant', use: false },
  { id: 'cabin1',    n: 'CABIN · 1',        d: `06'00" × 09'06"`,           r: [30, 28, 36, 37.5],      door: ['w', 0.22], fit: 'cabin', a: 57.6, p: 'Counseling, personalized batch, KYS interview', c: '1 desk', use: false },
  { id: 'cabin2',    n: 'CABIN · 2',        d: `06'00" × 10'02"`,           r: [30, 41, 36, 51.2],      door: ['w', 0.22], fit: 'cabin', a: 61.2, p: 'Counseling, personalized batch, KYS interview', c: '1 desk', use: false },
  { id: 'lab',       n: 'COMPUTER LAB',     d: `11'00" × 25'02" · 23 seat`, r: [36.5, 28, 47.2, 53.2],  door: ['n', 0.2],  fit: 'lab', seats: 23, a: 275, p: 'Coaching', c: '23 seater', use: false },
  { id: 'audi3',     n: 'AUDITORIUM · 3',   d: `15'00" × 23'02" · 42 seat`, r: [47.6, 28.8, 62.2, 51],  door: ['n', 0.24], fit: 'lecture', seats: 42, a: 348, p: 'Coaching', c: '42 seater', use: false },
  { id: 'pantry',    n: 'PANTRY',           d: `08'05" × 15'00"`,           r: [64, 24, 72.5, 39],      floor: 'tile', door: ['w', 0.12], fit: 'pantry', a: 127.5, p: 'Lunch, storage', c: '6 seater', use: false },
  { id: 'faculty',   n: 'FACULTY ROOM',     d: `16'00" × 11'11"`,           r: [37, 54, 53, 65.9],      door: ['n', 0.1],  fit: 'faculty', a: 192, p: 'Coaching', c: '3 desks · 2 visitors each · 2 wall desks', use: false },
];

const openFloors = [
  { id: 'lobbyNorth', r: [13.6, 11, 26.4, 23] },      // waiting in front of counseling-1
  { id: 'lobbyMid', r: [26.4, 22.5, 64, 28] },        // spine serving the auditoria + pantry
  { id: 'passageInner', r: [27.35, 28, 30, 66] },     // 3' wide passage
  { id: 'passageSouth', r: [24.2, 51.3, 30, 66] },
];

// ---------------------------------------------------------------- walls
const key = (a, b) => {
  const p = [a, b].map((q) => q.map((v) => v.toFixed(2)).join(',')).sort();
  return p.join('|');
};

function collectWalls() {
  const edges = new Map();
  const add = (a, b, type, door) => {
    const k = key(a, b);
    let e = edges.get(k);
    if (!e) { e = { a, b, type, doors: [] }; edges.set(k, e); }
    if (type === 'masonry') e.type = 'masonry';
    if (door) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      // door offset given as fraction of the edge, measured from stored start
      const flipped = key(a, b) !== [a, b].map((q) => q.map((v) => v.toFixed(2)).join(',')).join('|');
      const t = flipped ? 1 - door : door;
      e.doors.push([Math.min(Math.max(t * len - 1.6, 0.3), len - 3.5), 3.2]);
    }
  };
  for (const rm of rooms) {
    const [x1, z1, x2, z2] = rm.r;
    const type = rm.wall || 'partition';
    const sides = {
      n: [[x1, z1], [x2, z1]],
      s: [[x1, z2], [x2, z2]],
      w: [[x1, z1], [x1, z2]],
      e: [[x2, z1], [x2, z2]],
    };
    for (const s of ['n', 's', 'w', 'e']) {
      const [a, b] = sides[s];
      const door = rm.door && rm.door[0] === s ? rm.door[1] : null;
      add(a, b, type, door);
    }
  }
  return [...edges.values()];
}

function wallSegments(e) {
  const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]);
  const cuts = e.doors.slice().sort((p, q) => p[0] - q[0]);
  const out = [];
  let at = 0;
  for (const [o, w] of cuts) {
    if (o > at) out.push([at, o]);
    at = Math.max(at, o + w);
  }
  if (at < len) out.push([at, len]);
  return { out, len };
}

function buildWalls(g) {
  for (const e of collectWalls()) {
    const ang = Math.atan2(e.b[1] - e.a[1], e.b[0] - e.a[0]);
    const ry = -ang;
    const { out } = wallSegments(e);
    const t = e.type === 'masonry' ? 0.5 : 0.42;
    out.forEach(([s0, s1], i) => {
      const L = s1 - s0, mid = (s0 + s1) / 2;
      const px = e.a[0] + Math.cos(ang) * mid;
      const pz = e.a[1] + Math.sin(ang) * mid;
      if (e.type === 'masonry') {
        g.add(box(`wall_masonry_${i}_${px.toFixed(0)}_${pz.toFixed(0)}`, M.masonry, L, WALL_H, t, px, 0, pz, ry));
      } else {
        g.add(box(`partition_base_${i}_${px.toFixed(0)}_${pz.toFixed(0)}`, M.walnut, L, SOLID_H, t, px, 0, pz, ry));
        const gm = box(`partition_glass_${i}_${px.toFixed(0)}_${pz.toFixed(0)}`, M.glass, L, WALL_H - SOLID_H - 0.1, t * 0.5, px, SOLID_H + 0.05, pz, ry);
        gm.castShadow = false;
        g.add(gm);
      }
    });
  }
}

function glazedWall(g, name, ax, az, bx, bz, t) {
  const len = Math.hypot(bx - ax, bz - az);
  const ang = Math.atan2(bz - az, bx - ax), ry = -ang;
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  g.add(box(`shell_${name}_sill`, M.masonry, len, 2.5, t, mx, 0, mz, ry));
  const gl = box(`shell_${name}_glazing`, M.glass, len, 6.3, t * 0.45, mx, 2.5, mz, ry);
  gl.castShadow = false;
  g.add(gl);
  g.add(box(`shell_${name}_head`, M.masonry, len, 0.7, t, mx, 8.8, mz, ry));
  const n = Math.round(len / 8);
  for (let i = 1; i < n; i++) {
    const u = i / n;
    g.add(box(`shell_${name}_mullion_${i}`, M.metal, 0.3, 6.3, t * 0.7, ax + (bx - ax) * u, 2.5, az + (bz - az) * u, ry));
  }
}

function solidWall(g, name, ax, az, bx, bz, t) {
  const len = Math.hypot(bx - ax, bz - az);
  const ry = -Math.atan2(bz - az, bx - ax);
  g.add(box(`shell_${name}`, M.masonry, len, WALL_H, t, (ax + bx) / 2, 0, (az + bz) / 2, ry));
}

function buildShell(g) {
  const t = SHELL, i = t / 2;
  glazedWall(g, 'north', 0, i, 75, i, t);
  glazedWall(g, 'east_a', 75 - i, 0, 75 - i, 22, t);
  solidWall(g, 'step_a', 75 - i, 22 - i, 72.5 - i, 22 - i, t);
  glazedWall(g, 'east_b', 72.5 - i, 22, 72.5 - i, 39, t);
  solidWall(g, 'step_b', 72.5 - i, 39 - i, 62.5 + i, 39 - i, t);
  solidWall(g, 'east_c', 62.5 - i, 39, 62.5 - i, 51, t);
  solidWall(g, 'step_c', 62.5 - i, 51 - i, 53 + i, 51 - i, t);
  solidWall(g, 'east_d', 53 - i, 51, 53 - i, 66, t);
  solidWall(g, 'south', 53, 66 - i, 14, 66 - i, t);
  solidWall(g, 'west_s1', 14 + i, 66, 14 + i, 33, t);     // entry gap 29'–33'
  solidWall(g, 'west_s2', 14 + i, 29, 14 + i, 23.5, t);
  solidWall(g, 'step_d', 14, 23.5 - i, 0, 23.5 - i, t);
  solidWall(g, 'west_n', i, 23.5, i, 0, t);
}

// ---------------------------------------------------------------- furniture
function chair(g, id, x, z, ry) {
  g.add(cyl(`${id}_seat`, M.fabric, 0.85, 0.35, x, 1.25, z, 16));
  g.add(cyl(`${id}_stem`, M.metal, 0.16, 1.25, x, 0, z, 10));
  g.add(cyl(`${id}_base`, M.metal, 0.85, 0.14, x, 0, z, 16));
  const bx = x - Math.sin(ry) * 0.8, bz = z - Math.cos(ry) * -0.8;
  g.add(box(`${id}_back`, M.fabric, 1.5, 1.5, 0.25, bx, 1.6, bz, ry));
}

function desk(g, id, x, z, w = 3.95, d = 1.95, ry = 0) {
  g.add(box(`${id}_top`, M.walnut, w, 0.14, d, x, 2.45, z, ry));
  const ox = Math.cos(ry) * (w / 2 - 0.3), oz = -Math.sin(ry) * (w / 2 - 0.3);
  for (const s of [-1, 1]) g.add(box(`${id}_leg_${s > 0 ? 'r' : 'l'}`, M.metal, 0.2, 2.45, d - 0.4, x + s * ox, 0, z + s * oz, ry));
}

function credenza(g, id, x, z, w, ry = 0) {
  g.add(box(`${id}_body`, M.walnut, w, 2.3, 1.25, x, 0, z, ry));
  g.add(box(`${id}_top`, M.ink, w + 0.15, 0.1, 1.4, x, 2.3, z, ry));
}

function screen(g, id, x, z, w, ry = 0) {
  g.add(box(`${id}_panel`, M.ink, w, w * 0.56, 0.25, x, 3.6, z, ry));
}

function fit(g, rm) {
  const [x1, z1, x2, z2] = rm.r;
  const w = x2 - x1, d = z2 - z1, mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
  const id = rm.id;
  switch (rm.fit) {
    case 'board': {
      g.add(box(`${id}_table`, M.walnut, w * 0.34, 0.16, d * 0.62, mx, 2.45, mz));
      g.add(box(`${id}_table_base`, M.ink, w * 0.2, 2.45, d * 0.3, mx, 0, mz));
      for (let i = 0; i < 3; i++) {
        const zz = mz - d * 0.2 + (i * d * 0.4) / 2;
        chair(g, `${id}_chair_l${i}`, mx - w * 0.25, zz, Math.PI / 2);
        chair(g, `${id}_chair_r${i}`, mx + w * 0.25, zz, -Math.PI / 2);
      }
      chair(g, `${id}_chair_head`, mx, z1 + 2.4, Math.PI);
      screen(g, `${id}_panel`, mx, z1 + 0.5, 6.4);
      break;
    }
    case 'counsel': {
      for (let i = 0; i < 2; i++) {
        const zz = z1 + d * (0.27 + i * 0.44), xx = x1 + w * 0.56;
        desk(g, `${id}_table_${i}`, xx, zz, 3.95, 1.95);
        chair(g, `${id}_counselor_${i}`, xx, zz - 1.85, Math.PI);
        chair(g, `${id}_visitor_${i}a`, xx - 1.15, zz + 2, 0);
        chair(g, `${id}_visitor_${i}b`, xx + 1.15, zz + 2, 0);
      }
      credenza(g, `${id}_credenza`, x1 + 0.9, mz, d * 0.45, Math.PI / 2);
      break;
    }
    case 'cabin': {
      desk(g, `${id}_desk`, mx, z1 + d * 0.32, Math.min(w - 1.6, 4.6), 1.95);
      chair(g, `${id}_chair`, mx, z1 + d * 0.32 - 1.9, Math.PI);
      chair(g, `${id}_visitor_1`, mx - 1.1, z1 + d * 0.32 + 2.1, 0);
      chair(g, `${id}_visitor_2`, mx + 1.1, z1 + d * 0.32 + 2.1, 0);
      credenza(g, `${id}_credenza`, mx, z2 - 1.1, Math.min(w - 1.4, 4.8));
      break;
    }
    case 'manager': {
      const dz = z1 + 3.2;
      desk(g, `${id}_main_desk`, x1 + w * 0.36, dz, 5.75, 2.5);
      chair(g, `${id}_manager_chair`, x1 + w * 0.36, dz - 2.2, Math.PI);
      for (let i = 0; i < 3; i++) chair(g, `${id}_visitor_${i}`, x1 + w * 0.36 - 2.1 + i * 2.1, dz + 2.3, 0);
      desk(g, `${id}_assistant_desk`, x2 - 1.7, z2 - 3.6, 3.5, 1.7, Math.PI / 2);
      chair(g, `${id}_assistant_chair`, x2 - 4, z2 - 3.6, Math.PI / 2);
      credenza(g, `${id}_credenza`, x1 + w * 0.36, z1 + 0.9, 4.8);
      break;
    }
    case 'reception': {
      g.add(box(`${id}_counter`, M.walnut, 6, 3.4, 2.5, x1 + w * 0.55, 0, z1 + 4.2));
      g.add(box(`${id}_counter_cap`, M.ink, 6.4, 0.14, 2.9, x1 + w * 0.55, 3.4, z1 + 4.2));
      chair(g, `${id}_chair`, x1 + w * 0.55, z1 + 7, 0);
      credenza(g, `${id}_credenza`, x1 + 0.95, z1 + d * 0.55, 8, Math.PI / 2);
      const sofas = [[6.75, 4], [5.83, 3], [5.5, 3]];
      sofas.forEach(([len, seats], i) => {
        const zz = z2 - 2.4 - i * 4.6, xx = x1 + w * 0.54;
        g.add(box(`${id}_sofa_${i + 1}`, M.fabric, len, 1.3, 2.5, xx, 0, zz));
        g.add(box(`${id}_sofa_${i + 1}_back`, M.fabric, len, 1.1, 0.7, xx, 1.3, zz - 0.9));
        for (let k = 0; k < seats; k++) {
          g.add(box(`${id}_sofa_${i + 1}_cushion_${k}`, M.fabric, len / seats - 0.2, 0.16, 2.2, xx - len / 2 + len / seats * (k + 0.5), 1.3, zz));
        }
      });
      break;
    }
    case 'lecture': {
      const seats = rm.seats;
      const usableD = d - 7, usableW = w - 4;
      const rowsMax = Math.max(2, Math.floor(usableD / 4.6));
      const per = Math.ceil(seats / rowsMax);
      const cols = Math.min(per, Math.floor(usableW / 2.35));
      const rows = Math.ceil(seats / cols);
      const deskW = cols * 2.35;
      let placed = 0;
      for (let r = 0; r < rows; r++) {
        const zz = z1 + 5.4 + r * ((usableD - 1) / Math.max(1, rows - 1 || 1));
        g.add(box(`${id}_bench_${r}`, M.walnut, deskW, 0.14, 1.6, mx, 2.45, zz));
        g.add(box(`${id}_bench_panel_${r}`, M.walnut, deskW, 1.5, 0.16, mx, 0.9, zz - 0.75));
        for (let c = 0; c < cols && placed < seats; c++, placed++) {
          chair(g, `${id}_chair_${r}_${c}`, mx - deskW / 2 + 1.18 + c * 2.35, zz + 1.9, 0);
        }
      }
      screen(g, `${id}_panel`, mx, z1 + 0.6, Math.min(7.5, w * 0.34));
      g.add(box(`${id}_teacher_desk`, M.walnut, 4, 2.4, 1.8, mx + w * 0.3, 0, z1 + 2.6));
      break;
    }
    case 'lab': {
      let n = 0;
      const rowsZ = [];
      for (let zz = z1 + 3; zz <= z2 - 3.6; zz += 4.1) rowsZ.push(zz);
      for (const zz of rowsZ) {
        for (const side of [-1, 1]) {
          const xx = side < 0 ? x1 + 1.4 : x2 - 1.4;
          if (n >= rm.seats) break;
          g.add(box(`${id}_bench_${n}`, M.walnut, 2.6, 0.14, 3.4, xx, 2.45, zz, side < 0 ? 0 : 0));
          g.add(box(`${id}_monitor_${n}`, M.ink, 0.2, 1.35, 2, xx + side * -0.9, 2.6, zz));
          chair(g, `${id}_chair_${n}`, xx + side * -2.2, zz, side < 0 ? -Math.PI / 2 : Math.PI / 2);
          n++;
        }
      }
      credenza(g, `${id}_credenza`, mx, z2 - 1.2, 6);
      screen(g, `${id}_panel`, mx, z1 + 0.7, 5.5);
      break;
    }
    case 'faculty': {
      for (let c = 0; c < 3; c++) {
        const xx = x1 + 3.1 + c * ((w - 6.2) / 2), zz = z1 + 3.4;
        desk(g, `${id}_desk_${c}`, xx, zz, 4.2, 2);
        chair(g, `${id}_faculty_chair_${c}`, xx, zz - 1.9, Math.PI);
        chair(g, `${id}_visitor_${c}a`, xx - 1.2, zz + 2, 0);
        chair(g, `${id}_visitor_${c}b`, xx + 1.2, zz + 2, 0);
      }
      for (let i = 0; i < 2; i++) {
        const xx = x1 + w * (0.3 + i * 0.4);
        g.add(box(`${id}_wall_desk_${i}`, M.walnut, 3.5, 0.14, 1.5, xx, 2.45, z2 - 1.6));
        chair(g, `${id}_wall_chair_${i}`, xx, z2 - 3.6, Math.PI);
      }
      credenza(g, `${id}_credenza`, mx, z1 + 0.9, w - 2);
      break;
    }
    case 'pantry': {
      g.add(box(`${id}_counter`, M.tile, w - 1.6, 2.9, 2.1, mx, 0, z1 + 1.6));
      g.add(box(`${id}_counter_top`, M.metal, w - 1.4, 0.16, 2.3, mx, 2.9, z1 + 1.6));
      g.add(box(`${id}_fridge`, M.metal, 2.6, 5.8, 2.4, x2 - 2, 0, z2 - 2));
      g.add(box(`${id}_table`, M.walnut, 4.2, 0.14, 6, mx - 0.6, 2.45, mz + 2.4));
      for (let i = 0; i < 3; i++) {
        const zz = mz + 0.4 + i * 2;
        chair(g, `${id}_chair_l${i}`, mx - 3.6, zz, Math.PI / 2);
        chair(g, `${id}_chair_r${i}`, mx + 2.4, zz, -Math.PI / 2);
      }
      break;
    }
    case 'wc': {
      const n = Math.max(1, Math.floor(w / 3.4));
      for (let i = 0; i < n; i++) {
        const xx = x1 + 1.7 + i * 3.2;
        g.add(box(`${id}_wc_${i}`, M.tile, 1.3, 1.35, 2.1, xx, 0, z2 - 1.7));
        g.add(box(`${id}_cistern_${i}`, M.tile, 1.5, 2.6, 0.5, xx, 0, z2 - 2.9));
        if (i) g.add(box(`${id}_cubicle_${i}`, M.glass, 0.16, 6.5, 4.2, xx - 1.6, 0, z2 - 2.2));
      }
      g.add(box(`${id}_basin`, M.tile, Math.min(w - 2, 4), 0.6, 1.5, x1 + w / 2, 2.5, z1 + 1.1));
      break;
    }
  }
}

// ---------------------------------------------------------------- core
function buildCommon(g) {
  g.add(box('common_floor', M.commonFl, 22.5, 0.5, 42, 2.75, -0.5, 41.5));
  g.add(box('common_wall_west', M.common, 0.6, WALL_H, 42, -8.2, 0, 41.5));
  g.add(box('common_wall_south', M.common, 22.5, WALL_H, 0.6, 2.75, 0, 62.2));
  g.add(box('common_wall_north', M.common, 22.5, WALL_H, 0.6, 2.75, 0, 20.8));

  const treads = 13, rise = 0.62, going = 0.95;   // 27 risers, two flights
  for (let k = 0; k < treads; k++) {
    g.add(box(`common_stair_up_${k}`, M.common, 5.4, rise * (k + 1), going, 4.2, 0, 57 - k * going));
    g.add(box(`common_stair_dn_${k}`, M.common, 5.4, rise * (treads + k + 1), going, 4.2, 0, 41 - k * going));
  }
  g.add(box('common_stair_landing', M.common, 5.4, rise * treads, 3.6, 4.2, 0, 42.8));
  g.add(box('common_stair_rail', M.metal, 0.16, 0.16, 16, 1.6, 3.6, 49));

  g.add(box('common_lift_west', M.common, 0.5, WALL_H, 11.6, -7.7, 0, 49.8));
  g.add(box('common_lift_north', M.common, 7, WALL_H, 0.5, -4.2, 0, 44.2));
  g.add(box('common_lift_south', M.common, 7, WALL_H, 0.5, -4.2, 0, 55.4));
  g.add(box('common_lift_door', M.metal, 0.3, 7.4, 7.2, -0.9, 0, 49.8));
  g.add(box('common_lift_car', M.metal, 6.6, 0.2, 10.6, -4.2, 0, 49.8));
}

// ---------------------------------------------------------------- labels
function labelSprite(title, sub, x, z, y, w = 13.5) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const ctx = c.getContext('2d');
  const r = 34;
  ctx.beginPath();
  ctx.moveTo(40 + r, 34);
  ctx.arcTo(984, 34, 984, 222, r);
  ctx.arcTo(984, 222, 40, 222, r);
  ctx.arcTo(40, 222, 40, 34, r);
  ctx.arcTo(40, 34, 984, 34, r);
  ctx.closePath();
  ctx.fillStyle = 'rgba(250,248,243,0.93)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(29,35,38,0.35)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1d2326';
  ctx.font = '700 74px Archivo, system-ui, sans-serif';
  ctx.fillText(title, 512, 118);
  ctx.fillStyle = '#6c7175';
  ctx.font = '500 50px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(sub, 512, 188);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  s.material.name = 'label';
  s.name = `label_${title.replace(/\W+/g, '_')}`;
  s.position.set(f(x - cx), f(y), f(z - cz));
  s.scale.set(f(w), f(w * 0.25), 1);
  s.renderOrder = 10;
  return s;
}

// ---------------------------------------------------------------- assemble
export function buildFloor({ labels = true, furniture = true, glazing = true, useWash = true, common = true } = {}) {
  cx = PLAN_W / 2 - 4; cz = PLAN_H / 2;
  const g = new THREE.Group();
  g.name = 'iscon_janmahaal_floor';

  g.add(plate('floor_slab', M.plinth, 1.4, 0));
  g.add(plate('floor_finish', M.terrazzo, 0.08, 0.08));

  for (const rm of rooms) {
    const [x1, z1, x2, z2] = rm.r;
    const mat = useWash && rm.use && rm.fit !== 'wc' ? M.inUse
      : rm.floor === 'tile' ? M.tile
      : rm.fit === 'lecture' || rm.fit === 'lab' ? M.carpet : M.terrazzo;
    g.add(box(`floor_${rm.id}`, mat, x2 - x1, 0.1, z2 - z1, (x1 + x2) / 2, 0, (z1 + z2) / 2));
  }
  for (const o of openFloors) {
    const [x1, z1, x2, z2] = o.r;
    g.add(box(`floor_${o.id}`, M.terrazzo, x2 - x1, 0.1, z2 - z1, (x1 + x2) / 2, 0.005, (z1 + z2) / 2));
  }

  if (common) buildCommon(g);
  buildWalls(g);
  if (glazing) buildShell(g);
  if (furniture) for (const rm of rooms) fit(g, rm);
  if (labels) {
    for (const rm of rooms) {
      const [x1, z1, x2, z2] = rm.r;
      const lw = Math.min(13.5, Math.max(7.5, (x2 - x1) * 0.92));
      g.add(labelSprite(rm.n, rm.d.split(' · ')[0], (x1 + x2) / 2, (z1 + z2) / 2, 8.2, lw));
    }
  }
  return g;
}

export const roomList = rooms;
export const CENTER = { x: PLAN_W / 2 - 4, z: PLAN_H / 2 };
export const commonList = [
  { id: 'lift', n: 'LIFT', d: '2200 × 3225 mm', r: [-7.7, 44.2, -0.9, 55.4] },
  { id: 'stair', n: 'STAIRCASE', d: 'UP / DN · 27 risers', r: [1.5, 30, 7, 46] },
  { id: 'passage', n: 'COMMON PASSAGE', d: '2100 mm wide', r: [7.5, 50, 13.5, 60] },
  { id: 'entry', n: 'ENTRY', d: 'to premises', r: [11, 28.5, 15, 33.5] },
];
