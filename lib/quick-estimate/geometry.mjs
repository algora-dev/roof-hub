import { ROOF_TEMPLATES } from './model.mjs';

const EPS = 1e-7;
const evaluate = (p, [x, y]) => p.a * x + p.b * y + p.c;
export const polygonArea = p => Math.abs(p.reduce((sum, a, i) => {
  const b = p[(i + 1) % p.length];
  return sum + a[0] * b[1] - b[0] * a[1];
}, 0)) / 2;
const centre = p => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
const pointKey = p => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
const equal3 = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < EPS);

function clip(poly, line, side) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = evaluate(line, a) * side, db = evaluate(line, b) * side;
    if (da >= -EPS) out.push(a);
    if ((da > EPS && db < -EPS) || (da < -EPS && db > EPS)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out.filter((p, i) => pointKey(p) !== pointKey(out[(i + out.length - 1) % out.length]));
}

function mergeEdges(input) {
  const edges = [...input];
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i], b = edges[j];
      if (a.kind !== b.kind) continue;
      for (const [shared, p] of [[a.start, a.end], [a.end, a.start]]) {
        const q = equal3(shared, b.start) ? b.end : equal3(shared, b.end) ? b.start : null;
        if (!q) continue;
        const u = p.map((v, k) => v - shared[k]), v = q.map((w, k) => w - shared[k]);
        const cross = Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
        if (cross < EPS && u.reduce((s, x, k) => s + x * v[k], 0) < 0) {
          edges[i] = { kind: a.kind, start: p, end: q };
          edges.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return edges;
}

const cache = new Map();
export function getRoofMesh(shape) {
  const saved = cache.get(shape);
  if (saved) return saved;
  const template = ROOF_TEMPLATES[shape];
  if (!template) throw new Error('Unknown quick-estimate roof shape.');
  const blocks = template.blocks;
  const x0 = Math.min(...blocks.map(b => b.bounds[0])), y0 = Math.min(...blocks.map(b => b.bounds[1]));
  const x1 = Math.max(...blocks.map(b => b.bounds[2])), y1 = Math.max(...blocks.map(b => b.bounds[3]));
  const lines = [];
  const lineKeys = new Set();
  const addLine = p => {
    const norm = Math.hypot(p.a, p.b);
    if (norm < EPS) return;
    const sign = p.a < -EPS || (Math.abs(p.a) < EPS && p.b < 0) ? -1 : 1;
    const n = { a: p.a / norm * sign, b: p.b / norm * sign, c: p.c / norm * sign };
    const key = [n.a, n.b, n.c].map(v => (Math.abs(v) < EPS ? 0 : v).toFixed(6)).join(':');
    if (!lineKeys.has(key)) {
      lineKeys.add(key);
      lines.push(n);
    }
  };
  for (const b of blocks) {
    addLine({ a: 1, b: 0, c: -b.bounds[0] });
    addLine({ a: 1, b: 0, c: -b.bounds[2] });
    addLine({ a: 0, b: 1, c: -b.bounds[1] });
    addLine({ a: 0, b: 1, c: -b.bounds[3] });
  }
  const planes = blocks.flatMap(b => b.planes);
  for (let i = 0; i < planes.length; i++) for (let j = i + 1; j < planes.length; j++) {
    addLine({ a: planes[i].a - planes[j].a, b: planes[i].b - planes[j].b, c: planes[i].c - planes[j].c });
  }
  let cells = [[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]];
  for (const line of lines) {
    cells = cells.flatMap(poly => {
      const d = poly.map(p => evaluate(line, p));
      if (Math.min(...d) >= -EPS || Math.max(...d) <= EPS) return [poly];
      return [clip(poly, line, 1), clip(poly, line, -1)].filter(p => p.length >= 3 && polygonArea(p) > EPS);
    });
  }
  const faces = [];
  for (const poly of cells) {
    const c = centre(poly);
    const candidates = blocks.filter(({ bounds: b }) => c[0] > b[0] - EPS && c[0] < b[2] + EPS && c[1] > b[1] - EPS && c[1] < b[3] + EPS);
    if (!candidates.length) continue;
    const tops = candidates.map(b => b.planes.reduce((p, q) => evaluate(p, c) < evaluate(q, c) ? p : q));
    const plane = tops.reduce((p, q) => evaluate(p, c) > evaluate(q, c) ? p : q);
    faces.push({ points: poly.map(p => [p[0], p[1], Math.max(0, evaluate(plane, p))]), gradient: [plane.a, plane.b], planArea: polygonArea(poly) });
  }
  const map = new Map();
  for (const face of faces) for (let i = 0; i < face.points.length; i++) {
    const start = face.points[i], end = face.points[(i + 1) % face.points.length];
    const key = [pointKey([start[0], start[1]]), pointKey([end[0], end[1]])].sort().join('|');
    const refs = map.get(key) ?? [];
    refs.push({ face, start, end });
    map.set(key, refs);
  }
  const edges = [];
  const walls = [];
  for (const refs of map.values()) {
    const a = refs[0];
    if (refs.length === 1) {
      const kind = shape === 'flat-low-slope' ? 'flat_edge' : Math.abs(a.start[2] - a.end[2]) > EPS ? 'verge'
        : shape === 'skillion' && a.start[2] > EPS ? 'high_edge' : 'eaves';
      edges.push({ kind, start: a.start, end: a.end });
      walls.push([a.start, a.end, [a.end[0], a.end[1], -1.1], [a.start[0], a.start[1], -1.1]]);
      continue;
    }
    const b = refs[1];
    const bs = pointKey([a.start[0], a.start[1]]) === pointKey([b.start[0], b.start[1]]) ? b.start : b.end;
    const be = bs === b.start ? b.end : b.start;
    if (Math.abs(a.start[2] - bs[2]) > EPS || Math.abs(a.end[2] - be[2]) > EPS) {
      const lowerStart = a.start[2] < bs[2] ? a.start : bs, lowerEnd = a.end[2] < be[2] ? a.end : be;
      edges.push({ kind: 'flashing', start: lowerStart, end: lowerEnd });
      walls.push([a.start, a.end, be, bs]);
      continue;
    }
    const g1 = a.face.gradient, g2 = b.face.gradient;
    if (Math.hypot(g1[0] - g2[0], g1[1] - g2[1]) < EPS) continue;
    const c1 = centre(a.face.points.map(p => [p[0], p[1]])), c2 = centre(b.face.points.map(p => [p[0], p[1]]));
    const curvature = (g2[0] - g1[0]) * (c2[0] - c1[0]) + (g2[1] - g1[1]) * (c2[1] - c1[1]);
    const kind = curvature > 0 ? 'valley' : Math.abs(a.start[2] - a.end[2]) < EPS ? 'ridge' : 'hip';
    edges.push({ kind, start: a.start, end: a.end });
  }
  const mesh = { faces, edges: mergeEdges(edges), walls, footprintM2: faces.reduce((s, f) => s + f.planArea, 0) };
  cache.set(shape, mesh);
  return mesh;
}
