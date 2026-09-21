"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { CloseIcon, MenuIcon } from "@/components/Icons";

const links = [
  ["Pricing", "/pricing"],
  ["Tools", "/tools"],
  ["Guides", "/guides"],
  ["About", "/about"]
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <Link className="button button--primary button--small desktop-cta" href="/tools">Explore tools</Link>
            <button className="icon-button mobile-menu-button" onClick={() => setOpen(true)} aria-label="Open menu"><MenuIcon /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-drawer__top"><Logo /><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><CloseIcon /></button></div>
          <nav className="mobile-nav">
            {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            <Link className="button button--primary" href="/tools" onClick={() => setOpen(false)}>Explore tools</Link>
          </nav>
        </div>
      )}
    </>
  );
}
