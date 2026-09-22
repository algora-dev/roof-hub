/**
 * Adapted from the supplied Apex pitch.ts. Validates instead of silently
 * returning 1 for invalid pitches. Hip/valley factor applies ONLY to a
 * regular, equal-pitch intersection at 45° in plan. Other hips/valleys
 * must be measured in 3D or supplied as actual lengths.
 */
import { GROUP_MAP } from './model.mjs';
export function validNumber(value, min = 0, max = 1_000_000) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
export function validatePitch(pitch) {
  if (!validNumber(pitch, 0, 85)) throw new RangeError('Pitch must be a number from 0° to 85°.');
  return pitch;
}
export function rafterPitchFactor(degrees) { return 1 / Math.cos(validatePitch(degrees) * Math.PI / 180); }
export function hipValleyPitchFactor(degrees) {
  const t = Math.tan(validatePitch(degrees) * Math.PI / 180);
  return Math.sqrt(1 + t * t / 2);
}
export function entryPitch(project, entry) {
  const parent = entry.roofAreaId ? project.measurements.find(e => e.id === entry.roofAreaId && e.group === 'roofAreas') : null;
  return entry.pitch ?? parent?.pitch ?? project.pitch;
}
/** Detach children without changing their effective pitch when a plane is removed. */
export function removeMeasurement(project, id) {
  return project.measurements.filter(entry => entry.id !== id).map(entry =>
    entry.roofAreaId === id ? {...entry, pitch: entryPitch(project, entry), roofAreaId: null} : entry);
}
export function measuredValue(project, entry) {
  if (!validNumber(entry.value)) throw new RangeError(`${entry.label || 'Measurement'} needs a valid non-negative value.`);
  if (!validNumber(entry.quantity, 1, 10_000) || !Number.isInteger(entry.quantity)) throw new RangeError('Repeat quantity must be a whole number from 1 to 10,000.');
  if (entry.group === 'downpipes' && !Number.isInteger(entry.value)) throw new RangeError('Downpipes must be a whole-number count.');
  const raw = entry.value * entry.quantity;
  if (entry.basis === 'actual') return raw; // Legacy takeoff output is already pitch-adjusted.
  if (entry.basis !== 'plan') throw new TypeError('Measurement basis must be plan or actual.');
  const rule = GROUP_MAP[entry.group]?.pitchRule ?? 'none';
  if (rule === 'none') return raw;
  const pitch = entryPitch(project, entry);
  if (rule === 'hipvalley') {
    if (!entry.regularGeometry) throw new RangeError(`${entry.label}: confirm a regular, equal-pitch hip/valley or enter its actual length.`);
    return raw * hipValleyPitchFactor(pitch);
  }
  return raw * rafterPitchFactor(pitch);
}
export function groupQuantity(project, group) {
  return project.measurements.filter(e => e.group === group).reduce((s, e) => s + measuredValue(project, e), 0);
}
export function safeGroupQuantity(project, group) {
  try { return groupQuantity(project, group); } catch { return null; }
}
export function polygonArea(points) {
  if (points.length < 3) return 0;
  return Math.abs(points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p.x * q.y - q.x * p.y;
  }, 0)) / 2;
}
export function lineLength(points) {
  return points.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0);
}
/** Reject self-intersecting polygons; shoelace alone can undercount them. */
export function polygonCrossesItself(points) {
  const cross = (a,b,c) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const between = (a,b,c) => c.x >= Math.min(a.x,b.x)-1e-8 && c.x <= Math.max(a.x,b.x)+1e-8 && c.y >= Math.min(a.y,b.y)-1e-8 && c.y <= Math.max(a.y,b.y)+1e-8;
  const intersects = (a,b,c,d) => {
    const x=cross(a,b,c), y=cross(a,b,d), z=cross(c,d,a), w=cross(c,d,b);
    return ((x>0 && y<0 || x<0 && y>0) && (z>0 && w<0 || z<0 && w>0)) || (Math.abs(x)<1e-8 && between(a,b,c)) || (Math.abs(y)<1e-8 && between(a,b,d)) || (Math.abs(z)<1e-8 && between(c,d,a)) || (Math.abs(w)<1e-8 && between(c,d,b));
  };
  for (let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
    if (j===i+1 || i===0 && j===points.length-1) continue;
    if(intersects(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length])) return true;
  }
  return false;
}
