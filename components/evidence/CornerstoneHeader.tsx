import { Breadcrumbs, type Crumb } from "@/components/evidence/Breadcrumbs";
import { KeyFacts, type KeyFact } from "@/components/evidence/KeyFacts";

export function CornerstoneHeader({
  crumbs,
  eyebrow,
  title,
  answer,
  facts
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  answer: React.ReactNode;
  facts: KeyFact[];
}) {
  return <>
    <Breadcrumbs items={crumbs} />
    <section className="page-intro page-intro--sage">
      <div className="container page-intro__grid">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
        <div className="page-intro__aside cornerstone-answer">{answer}</div>
      </div>
    </section>
    <section className="section section--compact section--white"><div className="container"><KeyFacts facts={facts} /></div></section>
  </>;
}
