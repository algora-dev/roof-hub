import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { QuestionLinks } from '@/components/content/QuestionLinks';

export const metadata = pageMetadata({
  title: 'NZ roofing questions, comparisons and practical answers',
  description: 'Find evidence-backed New Zealand answers about roof costs, consent, repairs, contractors, leaks, underlay, flashings, maintenance, materials and measurements.',
  path: '/guides'
});

const groups = [
  {id:'decide', title:'What is happening with the roof?', articles:['roof-condition-assessment','roof-problems','recurring-roof-leaks','repair-or-replace','rusting-metal-roof','concrete-tile-decision','decramastic-decision','leak-condensation','decramastic']},
  {id:'costs', title:'What will it cost?', articles:['roofing-costs','new-roof-cost','cost-200','reroof-cost','scaffolding']},
  {id:'project', title:'How do I plan a reroof or roofing job?', articles:['reroof-process','hidden-reroof-problems','reroof-consent','quote-prep','compare-quotes','choose-roofer','roofing-contracts','roof-warranties','roof-insurance','timeline']},
  {id:'details', title:'How does the roof system actually work?', articles:['roof-parts','roof-underlay','roof-flashings','roof-penetrations','roof-ventilation','gutters-downpipes']},
  {id:'maintain', title:'How do I maintain or upgrade the roof?', articles:['metal-roof-maintenance','roof-painting','coastal-roofing','solar-roof','roof-insulation-reroof']},
  {id:'compare', title:'How do I compare roofing materials?', articles:['corrugate-vs-five','colorsteel-zincalume','long-run','corrugated','five-rib','pressed-tile','tray','membrane','tile-to-metal','lifespan']},
  {id:'measure', title:'How do I measure and describe it?', articles:['roof-area','roof-pitch']}
];

export default function GuidesPage(){return <>
  <section className="page-intro page-intro--sage"><div className="container page-intro__grid"><div><p className="eyebrow">Guides &amp; answers</p><h1>Start with the roofing question on your mind.</h1></div><div className="page-intro__aside"><p>Understand the rule, product, problem or quote first. RoofHub connects each answer to New Zealand source evidence, related decisions and the next useful tool.</p></div></div></section>
  <section className="section section--white"><div className="container"><nav className="rh-question-links" aria-label="Browse questions by topic">{groups.map(g=><a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>{groups.map(g=><section className="rh-question-group" id={g.id} key={g.id}><h2>{g.title}</h2><QuestionLinks ids={g.articles}/></section>)}</div></section>
  <section className="section section--sage"><div className="container cta-band"><div><p className="eyebrow">Apply the answer</p><h2>Estimate the roof, use measurements or check a written quote.</h2><p>RoofHub keeps the same project context as you move from research into calculations and decision support.</p></div><div className="button-row"><Link className="button button--primary" href="/tools/roof-estimate">Estimate a roof</Link><Link className="button button--secondary" href="/tools/quote-checker">Check a quote</Link></div></div></section>
</>}
