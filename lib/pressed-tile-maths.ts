import { roofSurfaceArea } from './roof-maths';

/** Quantity arithmetic only. No retail rates, design approvals or installation assumptions. */
export type PanelQuantityInput = {
  area: number; basis: 'plan' | 'actual'; pitchDegrees: number;
  panelsPerM2: number; extraPercent: number; packSize: number; minimumPanels: number;
};
function bounded(n: number, min: number, max: number, label: string, integer = false) {
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isSafeInteger(n))) {
    throw new Error(`${label} must be ${integer ? 'a whole number ' : ''}from ${min} to ${max}.`);
  }
}
/** Remove floating-point noise at integer boundaries without rounding real fractions down. */
export function wholePanels(n: number): number {
  if (!Number.isFinite(n) || n < 0 || n > Number.MAX_SAFE_INTEGER / 2) throw new Error('Panel quantity is out of range.');
  const nearest = Math.round(n);
  return Math.abs(n - nearest) <= Number.EPSILON * Math.max(1, n) * 4 ? nearest : Math.ceil(n);
}
export function panelQuantity(input: PanelQuantityInput) {
  const { area, basis, pitchDegrees, panelsPerM2, extraPercent, packSize, minimumPanels } = input;
  bounded(area, 0.01, 1000000, 'Roof area');
  bounded(panelsPerM2, 0.01, 1000, 'Panel density');
  bounded(extraPercent, 0, 100, 'Extra allowance');
  bounded(packSize, 1, 1000000, 'Pack size', true);
  bounded(minimumPanels, 0, 1000000000, 'Minimum quantity', true);
  const surfaceM2 = roofSurfaceArea(area, pitchDegrees, basis);
  if (surfaceM2 > 1000000) throw new Error('Calculated roof area is too large for this planning worksheet.');
  const netPanelEquivalent = surfaceM2 * panelsPerM2;
  const allowancePanelEquivalent = netPanelEquivalent * (1 + extraPercent / 100);
  const requiredPanels = wholePanels(allowancePanelEquivalent);
  const minimumApplies = minimumPanels > requiredPanels;
  const beforePack = Math.max(requiredPanels, minimumPanels);
  const packs = wholePanels(beforePack / packSize);
  const purchasePanels = packs * packSize;
  if (!Number.isSafeInteger(purchasePanels)) throw new Error('Purchase quantity is out of range.');
  return { surfaceM2, netPanelEquivalent, allowancePanelEquivalent, requiredPanels,
    purchasePanels, packs, minimumApplies, packExtraPanels: purchasePanels - beforePack };
}
export function panelSubtotal(panels: number, pricePerPanel: number, gst: 'incl' | 'excl' | 'unknown') {
  bounded(panels, 1, 2000000000, 'Panel count', true);
  bounded(pricePerPanel, 0.01, 10000000, 'Price per panel');
  if (!['incl','excl','unknown'].includes(gst)) throw new Error('Choose the quoted GST basis.');
  const quotedSubtotal = panels * pricePerPanel;
  const inclGst = gst === 'unknown' ? null : quotedSubtotal * (gst === 'excl' ? 1.15 : 1);
  if (!Number.isFinite(quotedSubtotal) || quotedSubtotal > Number.MAX_SAFE_INTEGER / 100 || (inclGst !== null && (!Number.isFinite(inclGst) || inclGst > Number.MAX_SAFE_INTEGER / 100))) throw new Error('Price is out of range.');
  return { quotedSubtotal, inclGst, gst };
}
/** Area/gauge is a rough continuous-batten allowance, NOT a set-out, order or span design. */
export function battenAllowance(surfaceM2: number, gaugeMm: number) {
  bounded(surfaceM2, 0.01, 1000000, 'Roof area');
  bounded(gaugeMm, 1, 5000, 'Installer-provided batten gauge');
  return surfaceM2 / (gaugeMm / 1000);
}
