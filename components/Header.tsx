"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, href]) => (
              <Link key={href} className={pathname === href || pathname.startsWith(`${href}/`) ? "is-active" : ""} href={href}>{label}</Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="button button--primary button--small desktop-cta" href="/tools">Explore tools</Link>
            <button className="icon-button mobile-menu-button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><MenuIcon /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="container mobile-drawer__inner">
            <div className="mobile-drawer__top"><Logo /><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><CloseIcon /></button></div>
            <nav className="mobile-nav">
              {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
              <Link className="button button--primary button--large" href="/tools">Explore tools</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
