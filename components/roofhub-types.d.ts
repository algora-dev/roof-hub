export type Range = { min: number; max: number };
export type Unit = 'm2' | 'lm' | 'each' | 'item';
export type RoofSystem = 'corrugate' | 'five-rib' | 'pressed-metal' | 'tray';
export type MeasurementGroup = 'roofAreas' | 'ridges' | 'hips' | 'valleys' | 'barges' | 'aprons' | 'spouting' | 'downpipes';
export type TaxBasis = 'incl' | 'excl';
export type Measurement = {
  id: string; group: MeasurementGroup; label: string; value: number | null;
  quantity: number; basis: 'plan' | 'actual'; pitch: number | null;
  roofAreaId: string | null; source: string; regularGeometry: boolean;
};
export type CustomItem = {
  id: string; name: string; unit: Unit; quantity: number;
  low: number | null; high: number | null; taxBasis: TaxBasis;
  source?: string; sourceBasis?: 'plan'; quantityConfirmed?: boolean;
};
export type RateBase = { id: string; label: string; unit: Unit; taxBasis: TaxBasis; status: string; note?: string };
export type Rate = RateBase & (
  {kind: 'installed'; installed: Range} |
  {kind: 'split'; material: Range | null; labour: Range | null}
);
export type ScaffoldRate = {base: Range; weekly: Range; minimum: Range; status: string; taxBasis: TaxBasis};
export type RateCard = {
  schemaVersion: 1; id: string; currency: 'NZD'; gstRate: number; title: string;
  approved: boolean; approvedAt: string | null; sourceTaxConfirmed: boolean;
  updatedAt: string; rates: Record<string, Rate>;
  scaffold: {includedWeeks: number} & {[key: string]: ScaffoldRate | number};
  exclusions: string[];
};
export type Project = {
  schemaVersion: 1; id: string; name: string; projectType: 'new' | 'reroof' | null;
  existingRoof: 'long-run' | 'pressed-metal' | 'concrete' | 'decramastic' | 'unknown' | null;
  asbestos: 'unknown' | 'negative' | 'positive'; storeys: 1 | 2; site: 'flat' | 'difficult';
  roofSystem: RoofSystem | null; entryMode: 'manual' | 'digital' | null;
  measurementBasis: 'actual' | 'plan'; pitch: number; measurements: Measurement[];
  reviewedComponents: boolean; underlay: boolean; fixings: boolean; battenMaterials: boolean;
  wastePct: number; pricingMode: 'guide' | 'custom'; rateOverrides: Record<string, Rate>;
  customItems: CustomItem[];
  access: {choice: 'exclude' | 'include' | 'unsure'; system: 'full' | 'edge'; perimeter: number | null; perimeterSource: string; weeks: number; assessmentAccepted: boolean};
  displayTax: TaxBasis; step: number; maxStep: number;
};
export type EstimateLine = {id: string; section: string; label: string; unit: string; quantity: number; amount: Range; missing: string[]; status: string; note?: string};
export type EstimateSuccess = {
  ok: true; version: number; projectId: string; rateCardId: string; currency: string;
  gstRate: number; roofArea: number; roofName: string; lines: EstimateLine[];
  unpriced: {id: string; label: string; reason: string}[];
  notes: string[]; assumptions: string[]; exclusions: string[];
  subtotal: Range; tax: Range; total: Range; complete: boolean; approved: boolean; createdAt: string;
};
export type Estimate = EstimateSuccess | {ok: false; errors: string[]};
export type EnquiryPayload = {
  schemaVersion: 1; type: 'roofhub-quote-request'; createdAt: string;
  contact: {name: string; email: string; phone: string; location: string; notes: string};
  consent: {shareWithRoofHubAndPartner: true; version: string; at: string};
  project: {format: string; schemaVersion: 1; exportedAt: string; project: Project; estimate: EstimateSuccess; privacy: string};
  customRateCardRedacted: true; measurementsRequireVerification: true;
};
export type ApexPayload = {
  roofAreas: {id: string; name: string; area: number; pitch?: number}[];
  componentGroups: {componentId: string; name: string; semantic?: string; measurementType: string; measurements: {value: number; quoteRoofAreaId?: string}[]; total?: number; count?: number}[];
  planImages?: unknown[];
};
export type MountOptions = {
  rateCard?: RateCard; initialProject?: Project; persist?: boolean; storageKey?: string;
  theme?: Record<`--rh-${string}`, string>;
  onProjectChange?: (project: Project) => void;
  onQuoteRequest?: (payload: EnquiryPayload) => Promise<{ok: boolean; reference?: string}>;
  privacyUrl?: string;
  pdfLoader?: () => Promise<unknown>;
  takeoffRenderer?: (element: HTMLElement, handlers: {
    onFinish: (payload: ApexPayload, options?: {units?: 'metric' | 'imperial'}) => void;
    onCancel: () => void;
  }) => void | (() => void);
};
export type EstimatorHandle = {
  destroy(): void; getProject(): Project; setProject(project: Project): void;
  importApexMeasurements(payload: ApexPayload, options?: {units?: 'metric' | 'imperial'}): void;
};
export declare function mountRoofHub(element: HTMLElement, options?: MountOptions): EstimatorHandle;
export declare function newProject(): Project;
export declare function newEntry(group?: MeasurementGroup, basis?: 'plan' | 'actual', extra?: Partial<Measurement>): Measurement;
export declare function calculateEstimate(project: Project, card?: RateCard): Estimate;
export declare function fromApexTakeoff(payload: ApexPayload, options?: {units?: 'metric' | 'imperial'}): {measurements: Measurement[]; customItems: CustomItem[]; measurementBasis: 'actual'; planImages: unknown[]};
export declare function applyApexTakeoff(project: Project, payload: ApexPayload, options?: {units?: 'metric' | 'imperial'}): Project;
export declare const DEFAULT_RATE_CARD: RateCard;
