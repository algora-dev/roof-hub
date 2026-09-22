/** Public browser entry. Browser-only UI; import core/*.mjs on a server. */
import { RoofHubEstimator } from './ui/app.mjs';
export { DEFAULT_RATE_CARD } from './core/rates.mjs';
export { calculateEstimate } from './core/pricing.mjs';
export { newProject, newEntry } from './core/model.mjs';
export { fromApexTakeoff, applyApexTakeoff } from './adapters/apex.mjs';
export function mountRoofHub(element,options={}) {return new RoofHubEstimator(element,options);}
