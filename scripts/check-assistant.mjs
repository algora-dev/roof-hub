import assert from 'node:assert/strict';
import fs from 'node:fs';
import { estimateProjectForAssistant } from '../lib/assistant/pricing.mjs';

let passed = 0;
function check(condition, message) {
  assert.ok(condition, message);
  passed += 1;
}

const baseProject = {
  schemaVersion: 1,
  projectId: 'assistant-test',
  entryPoint: 'assistant',
  projectType: 'new',
  existingRoof: 'unknown',
  existingRoofDetail: null,
  desiredRoof: 'corrugate',
  geometry: {
    roofShape: 'gable',
    sizeBand: 'medium',
    areaSource: 'roof-area',
    floorAreaM2: null,
    footprintAreaM2: null,
    roofAreaM2: 160,
    pitchBand: 'typical',
    exactPitchDegrees: 20,
    storeys: 1,
    complexities: []
  }
};

const guarded = estimateProjectForAssistant(baseProject, null, false);
check(guarded.ok === true, 'Assistant deterministic estimate should return a structured result');
check(Number.isFinite(guarded.result.low) && Number.isFinite(guarded.result.high), 'Published V1 rate-card values must be available through public assistant pricing');
check(guarded.pricingAvailable === true, 'Public assistant pricing must expose the published V1 range');
check(guarded.result.approved === true && guarded.result.reviewOnly === false, 'Published V1 pricing must be flagged approved, not review-only');
check(guarded.result.publicationVersion === 'V1', 'Assistant estimate card must carry the V1 publication label');

const review = estimateProjectForAssistant(baseProject, null, true);
check(review.ok === true && Number.isFinite(review.result.low) && Number.isFinite(review.result.high), 'Review mode must not change deterministic values');
check(review.result.approved === true && review.result.reviewOnly === false, 'Published V1 pricing must not be demoted to review-only');
check(review.projectEstimate?.rateCardId === 'roofhub-nz-draft-2026-09-22', 'Assistant estimate must retain the deterministic rate-card id');

const membrane = estimateProjectForAssistant({ ...baseProject, desiredRoof: 'membrane' }, null, true);
check(membrane.ok === true, 'Membrane should return a structured assistant result');
check(membrane.result.low === null && membrane.result.high === null, 'Assistant must not fabricate membrane pricing');

const orchestrator = fs.readFileSync('lib/assistant/orchestrator.ts', 'utf8');
const projectPatch = fs.readFileSync('lib/assistant/project-patch.ts', 'utf8');
const clientSession = fs.readFileSync('lib/assistant/client-session.ts', 'utf8');
const sessionScope = fs.readFileSync('lib/assistant/session-scope.ts', 'utf8');
const launcher = fs.readFileSync('components/assistant/AssistantLauncher.tsx', 'utf8');
const route = fs.readFileSync('app/api/assistant/route.ts', 'utf8');
const privacy = fs.readFileSync('app/privacy/page.tsx', 'utf8');

check(orchestrator.includes('estimateProjectForAssistant'), 'Assistant pricing tool must call the deterministic RoofHub estimator adapter');
check(orchestrator.includes('Never invent a project price'), 'Assistant system rules must explicitly prohibit invented project prices');
check(orchestrator.includes('approvedAssistantPath'), 'Assistant navigation must pass through the allowlist');
check(orchestrator.includes('Do not ask for personal contact details in chat'), 'Assistant must direct PII collection away from chat');
check(!projectPatch.match(/\b(email|phone|name|address)\b/i), 'Assistant project patch must not expose contact/PII fields');
check(clientSession.includes('sessionStorage'), 'Assistant browser session identity must be tab-scoped session storage');
check(sessionScope.includes('x-roofhub-assistant-session'), 'Assistant API requests must use an explicit tab-session header');
check(route.includes('checkAssistantIpRateLimit') && route.includes('checkAssistantSessionGuard'), 'Assistant API must enforce IP and session rate limits');
check(!launcher.includes('conversationText') && launcher.includes('assistant_question'), 'Assistant client analytics must emit coarse events rather than conversation text');
check(privacy.includes('currently uses OpenAI') && privacy.includes('conversation text'), 'Privacy policy must disclose AI processing and keep chat text out of general analytics');
check(!/NEXT_PUBLIC_OPENAI|NEXT_PUBLIC_.*API_KEY/.test(fs.readFileSync('.env.example', 'utf8')), 'AI provider secret must not be exposed through NEXT_PUBLIC_ environment variables');

console.log(`${passed} smart-assistant architecture, pricing and privacy cases passed.`);
