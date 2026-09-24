"use client";

import { useState } from "react";
import { BrandMark, Icon } from "./icons";

const links = [
  { href: "#home", label: "Home", icon: "home" },
  { href: "#about", label: "About", icon: "info" },
  { href: "#faq", label: "FAQ", icon: "question" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("qr-studio-theme", next); } catch { /* Private browsing can block storage. */ }
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-[68px] max-w-[1224px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-5">
        <a href="#home" className="flex shrink-0 items-center gap-2.5 rounded-md text-[1.22rem] font-bold tracking-[-0.025em] text-[var(--text)] sm:text-[1.45rem]" onClick={() => setMenuOpen(false)}>
          <BrandMark /><span>QR Studio</span>
        </a>
        <div className="flex items-center gap-2">
          <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
            {links.map((link, index) => (
              <a key={link.href} href={link.href} className={`nav-link ${index === 0 ? "active" : ""}`}>
                <Icon name={link.icon} width="18" height="18" />{link.label}
              </a>
            ))}
          </nav>
          <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label="Toggle light or dark theme" title="Toggle theme">
            <Icon name="sun" className="theme-sun" width="22" height="22" />
            <Icon name="moon" className="theme-moon" width="22" height="22" />
          </button>
          <button type="button" className="icon-button mobile-menu-button sm:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col gap-1 border-t border-[var(--border)] px-4 py-2 sm:hidden">
          {links.map((link) => <a key={link.href} href={link.href} className="nav-link" onClick={() => setMenuOpen(false)}><Icon name={link.icon} width="18" height="18" />{link.label}</a>)}
        </nav>
      )}
    </header>
  );
}
