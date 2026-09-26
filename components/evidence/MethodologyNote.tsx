import Link from "next/link";

/** Compact per-page methodology note. Full detail lives at /methodology. */
export function MethodologyNote({
  version,
  reviewedAt,
  evidenceCount,
  gstBasis
}: {
  version: string;
  reviewedAt: string;
  evidenceCount: number;
  gstBasis: string;
}) {
  return (
    <p className="methodology-note">
      <span>
        RoofHub methodology <strong>v{version}</strong> · last reviewed <strong>{reviewedAt}</strong> ·{" "}
        {evidenceCount} recorded {evidenceCount === 1 ? "source" : "sources"} · GST basis: <strong>{gstBasis}</strong>.
        Ranges are derived, not quoted —{" "}
        <Link className="text-link" href="/methodology">read the full methodology</Link>.
      </span>
    </p>
  );
}
