import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  inverse?: boolean;
};

// v2 brand lockups (2026-10-28): full logo image replaces mark + HTML wordmark.
// Dark lockup for light surfaces (header, drawer), white lockup for dark surfaces (footer).
export function Logo({ inverse = false }: LogoProps) {
  return (
    <Link className={`brand-logo ${inverse ? "brand-logo--inverse" : ""}`} href="/" aria-label="RoofHub home">
      <Image
        src={inverse ? "/brand/roofhub-logo-white.png" : "/brand/roofhub-logo-dark.png"}
        width={inverse ? 222 : 228}
        height={36}
        alt="RoofHub"
        priority
      />
    </Link>
  );
}
