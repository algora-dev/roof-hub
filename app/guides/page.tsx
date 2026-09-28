import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { QuestionLinks } from '@/components/content/QuestionLinks';
export const metadata = pageMetadata({title: 'NZ roofing questions, comparisons and practical answers', description: 'Find answers about roof costs, materials, lifespan, reroofing, asbestos, pitch and measurements, with NZ evidence and useful calculation tools.', path: '/guides'});
const groups = [
  {id:'costs', title:'What will it cost?', articles:['roofing-costs','cost-200','reroof-cost','scaffolding']},
  {id:'compare', title:'Which roof should I compare?', articles:['corrugate-vs-five','colorsteel-zincalume','long-run','pressed-tile','tray']},
  {id:'replace', title:'What does replacing a roof involve?', articles:['tile-to-metal','timeline','decramastic','lifespan']},
  {id:'measure', title:'How do I measure it?', articles:['roof-area','roof-pitch']}
];
export default function GuidesPage(){return <>
  <section className="page-intro page-intro--sage"><div className="container page-intro__grid"><div><p className="eyebrow">Guides & answers</p><h1>Start with the question on your mind.</h1></div><div className="page-intro__aside"><p>Compare products, understand a quote, check a measurement or plan a reroof. Each guide connects a direct answer with source evidence, worked examples and the next useful step.</p></div></div></section>
  <section className="section section--white"><div className="container"><nav className="rh-question-links" aria-label="Browse questions by topic">{groups.map(g=><a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>{groups.map(g=><section className="rh-question-group" id={g.id} key={g.id}><h2>{g.title}</h2><QuestionLinks ids={g.articles}/></section>)}<section className="rh-question-group"><h2>Ready to speak to a roofer?</h2><p>Use the <Link className="text-link" href="/guides/how-to-prepare-for-a-roofing-quote">quote preparation checklist</Link> to organise your scope and measurements before requesting a written price.</p></section></div></section>
  <section className="section section--sage"><div className="container cta-band"><div><p className="eyebrow">Your roof, your measurements</p><h2>Move from a general answer to your own quantities.</h2><p>Enter measurements or use a plan in the detailed estimator. Its output is a planning estimate, not a site inspection or a binding quote.</p></div><Link className="button button--primary" href="/tools/detailed-roof-estimator">Open detailed estimator</Link></div></section>
</>}
