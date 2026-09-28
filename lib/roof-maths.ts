/** Pure quantity calculations. No market rate, roof suitability or structural assumptions. */
export function numberInput(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function positive(n: number, label: string) {
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be greater than zero.`);
}
export function roofSurfaceArea(area: number, pitchDegrees: number, basis: 'plan' | 'actual'): number {
  positive(area, 'Area');
  if (basis === 'actual') return area;
  if (basis !== 'plan') throw new Error('Choose plan or actual area.');
  if (!Number.isFinite(pitchDegrees) || pitchDegrees < 0 || pitchDegrees >= 90) {
    throw new Error('Pitch must be from 0° to less than 90°.');
  }
  const result = area / Math.cos(pitchDegrees * Math.PI / 180);
  if (!Number.isFinite(result)) throw new Error('These inputs do not produce a finite area.');
  return result;
}
export function pitchFromRiseRun(rise: number, run: number): number {
  positive(run, 'Horizontal run');
  if (!Number.isFinite(rise) || rise < 0) throw new Error('Rise must be zero or greater.');
  return Math.atan(rise / run) * 180 / Math.PI;
}
export function sheetAreaRate(linealRate: number, coverMm: number): number {
  positive(linealRate, 'Lineal rate'); positive(coverMm, 'Effective cover');
  const result = linealRate / (coverMm / 1000);
  if (!Number.isFinite(result)) throw new Error('These inputs do not produce a finite rate.');
  return result;
}
export function budgetRange(area: number, low: number, high: number): {low: number; high: number} {
  positive(area, 'Area'); positive(low, 'Low rate'); positive(high, 'High rate');
  if (high < low) throw new Error('High rate must be at least the low rate.');
  if (!Number.isFinite(area * high)) throw new Error('The calculated amount is too large.');
  return {low: area * low, high: area * high};
}
