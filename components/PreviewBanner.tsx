import { isIndexingEnabled } from "@/lib/seo";

export function PreviewBanner() {
  if (isIndexingEnabled()) return null;
  return <div className="preview-banner">Preview build — search indexing is disabled</div>;
}
