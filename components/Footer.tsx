import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand"><Logo inverse /><p>Independent New Zealand roofing knowledge, pricing and tools from first question through to measured estimate.</p></div>
      <div><h3>Explore</h3><Link href="/pricing">Pricing</Link><Link href="/roofing">Roof types</Link><Link href="/guides">Guides</Link><Link href="/tools">Tools</Link></div>
      <div><h3>RoofHub</h3><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/sources">Sources</Link><Link href="/contact">Project help &amp; contact</Link></div>
      <div><h3>Standards</h3><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms &amp; disclaimer</Link><p>RoofHub estimates are information, not contractor quotes. Assumptions stay visible.</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} RoofHub NZ</span><span>The roofing website for New Zealanders.</span></div>
  </footer>;
}
