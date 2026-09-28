import Link from 'next/link';
import { getArticle } from '@/data/research';

/** Reusable server-rendered links. No search-only or parameterised article copies. */
export function QuestionLinks({ ids }: { ids: string[] }) {
  return <div className="rh-question-grid">{ids.map(id => {
    const article = getArticle(id);
    return <Link key={id} className="rh-question-card" href={article.path}><span className="eyebrow">{article.category}</span><h3>{article.title}</h3><p>{article.description}</p><small>Read the answer →</small></Link>;
  })}</div>;
}
