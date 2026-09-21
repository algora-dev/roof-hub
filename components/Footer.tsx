import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Logo inverse /><p>Practical roofing knowledge, planning tools and transparent project guidance for New Zealand.</p></div>
        <div><h3>Explore</h3><Link href="/pricing">Pricing</Link><Link href="/tools">Tools</Link><Link href="/guides">Guides</Link></div>
        <div><h3>RoofHub</h3><Link href="/about">About</Link><Link href="/guides/how-to-prepare-for-a-roofing-quote">Quote guide</Link></div>
        <div><h3>Preview status</h3><p>This v0.4 build is intentionally noindex while real tools, reviewed content and source data are integrated.</p></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} RoofHub NZ</span><span>Know more. Build brighter.</span></div>
    </footer>
  );
}
