"use client";

import { getRoofMesh, type QuickScenario } from "@/lib/quick-estimate/index.mjs";
import type { RoofShape } from "@/lib/roof-project";
import styles from "./QuickRoofEstimate.module.css";

type Point3 = [number, number, number];

export function RoofIllustration({ shape, pitch = 24 }: { shape: RoofShape; pitch?: number }) {
  if (shape === "unknown") {
    return <svg className={styles.roofIllustration} viewBox="0 0 200 145" aria-hidden="true">
      <path d="M28 101 L72 68 L111 88 L147 58 L176 84 L176 116 L28 116 Z" fill="var(--quick-roof-fill, #dbe5d7)" stroke="currentColor" strokeWidth="2" />
      <path d="M28 101 L72 68 L111 88 L147 58 L176 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M61 102 L139 102" stroke="currentColor" strokeDasharray="5 5" opacity=".65" />
      <text x="100" y="132" textAnchor="middle" fontSize="14" fill="currentColor">Not sure</text>
    </svg>;
  }
  const mesh = getRoofMesh(shape);
  const t = shape === "flat-low-slope" ? 0 : Math.tan(pitch * Math.PI / 180);
  const project = (p: Point3): [number, number] => [(p[0] - p[1]) * 0.86, (p[0] + p[1]) * 0.65 - (p[2] < 0 ? p[2] : p[2] * t) * 0.75];
  const all = [...mesh.faces.flatMap(face => face.points), ...mesh.walls.flat()] as Point3[];
  const projected = all.map(project);
  const x0 = Math.min(...projected.map(p => p[0])), x1 = Math.max(...projected.map(p => p[0]));
  const y0 = Math.min(...projected.map(p => p[1])), y1 = Math.max(...projected.map(p => p[1]));
  const scale = Math.min(178 / Math.max(x1 - x0, 1), 112 / Math.max(y1 - y0, 1));
  const xy = (p: Point3): [number, number] => {
    const q = project(p);
    return [100 + (q[0] - (x0 + x1) / 2) * scale, 70 + (q[1] - (y0 + y1) / 2) * scale];
  };
  const depth = (points: Point3[]) => points.reduce((sum, p) => sum + p[0] + p[1], 0) / points.length;
  const faces = mesh.faces.map((face, index) => ({ points: face.points as Point3[], index })).sort((a, b) => depth(a.points) - depth(b.points));
  const walls = mesh.walls.map((points, index) => ({ points: points as Point3[], index })).sort((a, b) => depth(a.points) - depth(b.points));
  const polygon = (points: Point3[]) => points.map(point => xy(point).map(v => v.toFixed(2)).join(",")).join(" ");
  return <svg className={styles.roofIllustration} viewBox="0 0 200 145" aria-hidden="true" focusable="false">
    <ellipse cx="100" cy="130" rx="66" ry="8" fill="currentColor" opacity="0.08" />
    {walls.map(wall => <polygon key={`wall-${wall.index}`} points={polygon(wall.points)} className={styles.roofWall} />)}
    {faces.map(face => <polygon key={`face-${face.index}`} points={polygon(face.points)} className={styles.roofFace} />)}
    {mesh.edges.map((edge, index) => {
      const [xA, yA] = xy(edge.start as Point3), [xB, yB] = xy(edge.end as Point3);
      return <line key={index} x1={xA} y1={yA} x2={xB} y2={yB} className={edge.kind === "valley" ? styles.roofValley : styles.roofEdge} />;
    })}
  </svg>;
}

export function PitchIllustration({ degrees }: { degrees: number }) {
  const top = 88 - 60 * Math.tan(degrees * Math.PI / 180);
  return <svg className={styles.pitchIllustration} viewBox="0 0 160 105" aria-hidden="true">
    <path d={`M20 88 L80 ${top} L140 88 Z`} className={styles.pitchRoof} />
    <path d="M28 90 V100 H132 V90" className={styles.pitchWall} />
  </svg>;
}

export function RoofAreaRange({ low, high }: { low: QuickScenario; high: QuickScenario }) {
  const a = Math.round(low.quantities.roofAreaM2);
  const b = Math.round(high.quantities.roofAreaM2);
  return <>{a === b ? `${a} m²` : `${a}–${b} m²`}</>;
}
