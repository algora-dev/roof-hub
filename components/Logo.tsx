import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function Logo({ inverse = false, compact = false }: LogoProps) {
  return (
    <Link className={`brand-logo ${inverse ? "brand-logo--inverse" : ""}`} href="/" aria-label="RoofHub home">
      <Image
        src={inverse ? "/brand/roofhub-mark-white.png" : "/brand/roofhub-mark-black.png"}
        width={42}
        height={42}
        alt=""
        priority
      />
      {!compact && (
        <span className="brand-wordmark" aria-hidden="true">
          <strong>Roof</strong><span>Hub</span>
        </span>
      )}
    </Link>
  );
}
