import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SITE_NAV_SECTIONS } from "./siteNavConfig.ts";

export default function SiteNavDrawer() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => closeBtnRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [open]);

  return (
    <>
      <div className="site-nav-bar">
        <button
          type="button"
          className={`site-nav-open-btn${open ? " site-nav-open-btn--open" : ""}`}
          aria-expanded={open}
          aria-controls="site-nav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="site-nav-open-btn__icon" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="site-nav-open-btn__label">메뉴</span>
        </button>
      </div>

      <div
        className={`site-nav-backdrop${open ? " site-nav-backdrop--open" : ""}`}
        aria-hidden={!open}
        onClick={close}
      />

      <aside
        ref={panelRef}
        id="site-nav-drawer"
        className={`site-nav-panel${open ? " site-nav-panel--open" : ""}`}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="site-nav-panel__head">
          <p id={titleId} className="site-nav-panel__title">
            대출 계산기
          </p>
          <button
            ref={closeBtnRef}
            type="button"
            className="site-nav-close-btn"
            onClick={close}
          >
            닫기
          </button>
        </div>
        <nav className="site-nav-panel__nav" aria-label="사이트 메뉴">
          {SITE_NAV_SECTIONS.map((sec) => (
            <div key={sec.heading} className="site-nav-section">
              <div className="site-nav-section__label">{sec.heading}</div>
              <ul className="site-nav-section__list">
                {sec.links.map((lnk) => (
                  <li key={lnk.href}>
                    <a
                      href={lnk.href}
                      className="site-nav-link"
                      onClick={close}
                    >
                      {lnk.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
