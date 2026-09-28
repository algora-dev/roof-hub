import { ResearchArticlePage } from "@/components/content/ResearchArticle";
import { getArticle } from "@/data/research";
import { pageMetadata } from "@/lib/seo";

const article = getArticle("long-run");
export const metadata = pageMetadata({ title: article.title, description: article.description, path: article.path });

export default function Page() {
  return <ResearchArticlePage articleId={article.id} />;
}
