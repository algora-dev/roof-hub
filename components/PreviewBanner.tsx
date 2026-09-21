export function PreviewBanner() {
  if (process.env.ALLOW_INDEXING === "true") return null;
  return <div className="preview-banner">Preview build · search indexing is disabled</div>;
}
