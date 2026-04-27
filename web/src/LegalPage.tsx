import { useEffect } from "react";

type LegalKind = "privacy" | "terms" | "contact";

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

function pageData(kind: LegalKind) {
  if (kind === "privacy") {
    return {
      path: "/privacy",
      title: "개인정보처리방침 | 대출 계산기",
      heading: "개인정보처리방침",
      desc: "대출 계산기 서비스의 개인정보 처리 방침 안내 페이지입니다.",
      body: [
        "본 서비스는 대출 계산 기능 제공을 위해 최소한의 정보만 처리합니다.",
        "입력한 계산 값(금액/금리/기간/상환 방식)은 브라우저 내 저장 기능을 사용할 때 로컬 저장소에만 보관됩니다.",
        "광고 제공을 위해 Google AdSense/AdMob 등 제3자 서비스가 쿠키 또는 광고 식별자를 처리할 수 있습니다.",
        "문의: onamt@naver.com",
      ],
    };
  }
  if (kind === "terms") {
    return {
      path: "/terms",
      title: "서비스 이용약관 | 대출 계산기",
      heading: "서비스 이용약관",
      desc: "대출 계산기 서비스 이용약관 안내 페이지입니다.",
      body: [
        "본 서비스의 계산 결과는 참고용이며 실제 금융기관의 심사 및 조건과 다를 수 있습니다.",
        "사용자는 계산 결과를 최종 의사결정 전에 금융기관의 공식 안내와 함께 확인해야 합니다.",
        "서비스 운영자는 사전 고지 없이 기능/디자인/광고 정책을 변경할 수 있습니다.",
        "문의: onamt@naver.com",
      ],
    };
  }
  return {
    path: "/contact",
    title: "문의하기 | 대출 계산기",
    heading: "문의하기",
    desc: "대출 계산기 서비스 문의 안내 페이지입니다.",
    body: [
      "서비스 개선 제안, 오류 제보, 제휴 문의는 아래 이메일로 보내주세요.",
      "이메일: onamt@naver.com",
      "가능하면 사용 기기(OS/브라우저)와 재현 절차를 함께 알려주시면 빠르게 확인할 수 있습니다.",
    ],
  };
}

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const page = pageData(kind);

  useEffect(() => {
    document.title = page.title;
    setMeta("description", page.desc);
    setMeta("og:title", page.title, true);
    setMeta("og:description", page.desc, true);
    setMeta("twitter:title", page.title);
    setMeta("twitter:description", page.desc);

    const origin = (import.meta.env.VITE_SITE_URL ?? window.location.origin)
      .trim()
      .replace(/\/+$/, "");
    const canonical = `${origin}${page.path}`;
    setCanonical(canonical);
    setMeta("og:url", canonical, true);
  }, [page.desc, page.path, page.title]);

  return (
    <div className="app-shell">
      <header className="header">
        <div className="page-badge">대출 계산기</div>
        <h1>{page.heading}</h1>
        <p className="header-tagline">{page.desc}</p>
      </header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="container legal-container">
          <section className="card legal-card">
            <div className="card-title">{page.heading}</div>
            {page.body.map((line, i) => {
              const email = "onamt@naver.com";
              if (!line.includes(email)) {
                return (
                  <p key={i} className="legal-line">
                    {line}
                  </p>
                );
              }
              const [before, after] = line.split(email);
              return (
                <p key={i} className="legal-line">
                  {before}
                  <a href={`mailto:${email}`}>{email}</a>
                  {after}
                </p>
              );
            })}
          </section>
          <nav className="site-legal-links">
            <a href="/">대출 계산기</a>
            <a href="/compare">대출 비교 계산기</a>
            <a href="/privacy">개인정보처리방침</a>
            <a href="/terms">이용약관</a>
            <a href="/contact">문의하기</a>
          </nav>
        </div>
      </main>
    </div>
  );
}
