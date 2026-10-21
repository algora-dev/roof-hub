import assert from 'node:assert/strict';
import fs from 'node:fs';

let passed = 0;
function file(path) { return fs.readFileSync(path, 'utf8'); }
function check(condition, message) { assert.ok(condition, message); passed += 1; }

const home = file('app/page.tsx');
const header = file('components/Header.tsx');
const tools = file('app/tools/page.tsx');
const article = file('components/content/ResearchArticle.tsx');
const quick = file('components/quick-estimate/QuickRoofEstimate.tsx');
const contact = file('app/contact/page.tsx');
const projectForm = file('components/ProjectEnquiryForm.tsx');
const footer = file('components/Footer.tsx');
const contactForm = file('components/ContactForm.tsx');
const quickPage = file('app/tools/roof-estimate/page.tsx');
const css = file('app/globals.css');
const routes = file('data/siteRoutes.ts');

check(home.includes('New Zealand roofing answers, pricing and tools in one place.'), 'Homepage must use the inclusive NZ roofing-platform proposition');
check(home.includes('<AssistantHeroPrompt />'), 'Homepage must surface Ask RoofHub prominently');
check(home.includes('Estimate a roof') && home.includes('Use measurements'), 'Homepage must expose simple and advanced estimating paths');
check(!home.includes('Questions homeowners are asking'), 'Homepage must not frame RoofHub as homeowner-only');
check(header.includes('["Pricing", "/pricing"]') && header.includes('["Tools", "/tools"]'), 'Primary navigation must keep the simplified four-section architecture');
check(!header.includes('["About", "/about"]'), 'About should not consume a primary navigation slot');
check(header.includes('Estimate a roof'), 'Primary header CTA must be Estimate a roof');
check(tools.includes('Quick tools') && tools.includes('Advanced tools'), 'Tools index must separate quick and advanced workflows');
check(tools.includes('Builders, roofers, estimators'), 'Advanced tools must explicitly remain welcoming to professional users');
check(article.includes('articleAction') && article.includes('AskRoofHubButton'), 'Research articles must have contextual estimate and assistant actions');
check(article.includes("Don't have measurements? That's fine."), 'Article sidebar must encourage starting with incomplete information');
check(quick.includes('useSearchParams') && quick.includes('params.get("product")') && quick.includes('params.get("project")'), 'Quick Estimate must accept contextual page presets');
check(contact.includes('<ProjectEnquiryForm />'), 'Contact route must surface the structured project-enquiry workflow');
check(projectForm.includes('shareWithRoofingPartners: share'), 'Partner sharing must be an explicit project-enquiry choice');
check(projectForm.includes('project: currentProject'), 'Project enquiry must carry existing shared RoofProject context instead of asking the user to retype it');
check(contactForm.includes('Pressed metal tile roof'), 'Existing pressed-metal-tile contact links must remain a valid contact topic');
check(quickPage.includes('Suspense'), 'Quick Estimate URL preset handling must be wrapped for static Next.js rendering');
check(footer.includes('The roofing website for New Zealanders.'), 'Footer must reinforce inclusive platform positioning');
check(css.includes('.home-hero-grid') && css.includes('.rh-contextual-action') && css.includes('.project-help-layout'), 'Package B conversion surfaces must have responsive production styles');
check(routes.includes('{ path: "/", lastModified: "2026-10-20"') && routes.includes('{ path: "/tools", lastModified: "2026-10-20"'), 'Modified indexable product routes must carry updated sitemap dates');

console.log(`${passed} site-conversion and contextual-journey cases passed.`);
