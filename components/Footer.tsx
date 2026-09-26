import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Logo inverse /><p>Practical roofing knowledge, planning tools and transparent project guidance for New Zealand.</p></div>
        <div><h3>Explore</h3><Link href="/pricing">Pricing</Link><Link href="/tools">Tools</Link><Link href="/guides">Guides</Link><Link href="/roofing">Roofing systems</Link></div>
        <div><h3>RoofHub</h3><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/sources">Sources</Link><Link href="/contact">Contact &amp; corrections</Link></div>
        <div><h3>Standards</h3><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms &amp; disclaimer</Link><p>Estimates are information, not quotes. Assumptions stay visible.</p></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} RoofHub NZ</span><span>Know more. Build brighter.</span></div>
    </footer>
  );
}
