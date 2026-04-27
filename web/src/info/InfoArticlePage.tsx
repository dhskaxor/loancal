import { useEffect } from "react";
import type { DocDefinition, DocSection } from "./docsData";
import { getDoc } from "./docsData";

function setMeta(name: string, content: string, property = false) {
  const key = property ? "property" : "name";
  const selector = `meta[${key}="${name}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

function renderSection(s: DocSection, i: number) {
  return (
    <section key={i} className="doc-section">
      <h2 className="doc-h2">{s.h2}</h2>
      {s.table && (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                {s.table.headers.map((h, j) => (
                  <th key={j}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.paragraphs.map((p, pi) => (
        <p key={pi} className="doc-p">
          {p}
        </p>
      ))}
      {s.bullets && s.bullets.length > 0 && (
        <ul className="doc-ul">
          {s.bullets.map((b, bi) => (
            <li key={bi}>{b}</li>
          ))}
        </ul>
      )}
      {s.links && s.links.length > 0 && (
        <p className="doc-link-row">
          {s.links.map((lnk, li) => (
            <a key={li} className="doc-inline-btn" href={lnk.href}>
              {lnk.label}
            </a>
          ))}
        </p>
      )}
    </section>
  );
}

export default function InfoArticlePage({ path }: { path: string }) {
  const normalized = path.replace(/\/+$/, "") || "/";
  const doc: DocDefinition | undefined = getDoc(normalized);

  useEffect(() => {
    if (!doc) return;
    document.title = doc.title;
    setMeta("description", doc.desc);
    setMeta("og:title", doc.title, true);
    setMeta("og:description", doc.desc, true);
    setMeta("twitter:title", doc.title);
    setMeta("twitter:description", doc.desc);

    const origin = (import.meta.env.VITE_SITE_URL ?? window.location.origin)
      .trim()
      .replace(/\/+$/, "");
    const canonical = `${origin}${doc.path}`;
    setCanonical(canonical);
    setMeta("og:url", canonical, true);
  }, [doc]);

  if (!doc) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <div className="container doc-container">
            <p className="doc-p">페이지를 찾을 수 없습니다.</p>
            <a href="/" className="doc-back-link">
              홈으로
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header doc-header">
        <div className="page-badge">대출 계산기</div>
        <h1 className="doc-title">{doc.title.split(" | ")[0]}</h1>
        <p className="header-tagline doc-lead">{doc.lead}</p>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        <article className="container doc-container">
          <div className="card doc-card">
            {doc.sections.map((s, i) => renderSection(s, i))}
          </div>
        </article>
      </main>
    </div>
  );
}
