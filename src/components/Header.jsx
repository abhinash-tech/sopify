import { useState } from "react";

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="SOPify home">
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">
        sopify<span className="brand-period">.</span>
      </span>
    </a>
  );
}

export default function Header({ savedCount, onOpenLibrary, onOpenDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement-bar">
        <span className="announcement-dot" />
        <span>Enterprise AI-Powered Process Standardization</span>
        <a href="#studio">
          Explore Generator <span aria-hidden="true">↗</span>
        </a>
      </div>
      <header className="site-header">
        <Brand />
        <nav
          className={`main-nav${menuOpen ? " open" : ""}`}
          aria-label="Main navigation"
          id="mainNav"
        >
          <a href="#platform" onClick={closeMenu}>
            Platform
          </a>
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#templates" onClick={closeMenu}>
            Templates
          </a>
          <a href="#about" onClick={closeMenu}>
            Why SOPify
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="library-button"
            id="openDashboard"
            type="button"
            aria-label="Open metrics dashboard"
            onClick={onOpenDashboard}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 15, height: 15 }}>
              <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            className="library-button"
            id="openLibrary"
            type="button"
            aria-label="Open saved SOP library"
            onClick={onOpenLibrary}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4.8A2.8 2.8 0 0 1 7.8 2H20v17H7.8A2.8 2.8 0 0 0 5 21V4.8Z" />
              <path d="M5 5v16M9 6h7M9 10h7" />
            </svg>
            <span>Library</span>
            <span className="library-count">{savedCount}</span>
          </button>
          <a className="button button-small button-primary" href="#studio">
            Start creating <span className="button-arrow">↗</span>
          </a>
          <button
            className="mobile-menu-button"
            id="mobileMenuButton"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}
