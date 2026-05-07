import { useEffect } from "react";

type CommonAgreeKind = "terms" | "privacy";

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

function pageData(kind: CommonAgreeKind) {
  if (kind === "terms") {
    return {
      path: "/common/agree/terms",
      title: "서비스 이용약관",
      heading: "서비스 이용약관",
      lead: "본 약관은 서비스 이용과 관련한 기본 권리·의무·책임 사항을 안내합니다.",
      sections: [
        {
          title: "제1조 (목적)",
          body: "본 약관은 서비스 제공자와 이용자 간 서비스 이용 조건 및 절차, 당사자 간 권리·의무·책임 사항을 규정함을 목적으로 합니다.",
        },
        {
          title: "제2조 (정의)",
          body: "서비스란 제공자가 운영하는 웹/앱 및 관련 기능 일체를 의미하며, 이용자는 본 약관에 동의하고 서비스를 이용하는 개인 또는 법인을 의미합니다.",
        },
        {
          title: "제3조 (약관의 효력 및 변경)",
          body: "본 약관은 서비스 내 게시 또는 기타 방법으로 공지함으로써 효력이 발생합니다. 관계 법령을 위반하지 않는 범위에서 약관이 변경될 수 있으며, 변경 시 시행일 및 변경 사유를 고지합니다.",
        },
        {
          title: "제4조 (서비스 제공 및 변경)",
          body: "제공자는 서비스의 전부 또는 일부를 운영상·기술상 필요에 따라 변경할 수 있으며, 중요한 변경이 있는 경우 사전에 공지하도록 노력합니다.",
        },
        {
          title: "제5조 (이용자의 의무)",
          body: "이용자는 관계 법령, 본 약관, 서비스 이용안내를 준수해야 하며, 서비스 운영을 방해하거나 타인의 권리를 침해하는 행위를 해서는 안 됩니다.",
        },
        {
          title: "제6조 (지식재산권)",
          body: "서비스 및 관련 콘텐츠에 대한 지식재산권은 제공자 또는 정당한 권리자에게 귀속됩니다. 이용자는 제공자의 사전 승인 없이 이를 복제·배포·수정·상업적 이용할 수 없습니다.",
        },
        {
          title: "제7조 (면책)",
          body: "제공자는 천재지변, 불가항력, 이용자의 귀책사유 등으로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다. 서비스에서 제공되는 정보는 일반적 참고용이며, 최종 의사결정의 책임은 이용자에게 있습니다.",
        },
      ],
    };
  }

  return {
    path: "/common/agree/privacy",
    title: "개인정보처리방침",
    heading: "개인정보처리방침",
    lead: "본 방침은 개인정보 보호 관련 법령에 따라 이용자의 개인정보를 어떻게 처리하는지 안내합니다.",
    sections: [
      {
        title: "1. 수집하는 개인정보 항목",
        body: "서비스 제공 과정에서 최소한의 범위 내에서 개인정보를 수집할 수 있습니다. (예: 문의 접수 시 이메일 주소 등)",
      },
      {
        title: "2. 개인정보의 처리 목적",
        body: "이용자 문의 응대, 서비스 제공 및 품질 개선, 법령상 의무 이행 목적 범위 내에서 개인정보를 처리합니다.",
      },
      {
        title: "3. 개인정보의 보유 및 이용 기간",
        body: "개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
      },
      {
        title: "4. 개인정보의 제3자 제공",
        body: "법령에 근거가 있거나 이용자의 사전 동의가 있는 경우를 제외하고, 개인정보를 제3자에게 제공하지 않습니다.",
      },
      {
        title: "5. 개인정보 처리 위탁",
        body: "원활한 서비스 운영을 위해 필요한 경우 개인정보 처리 업무를 외부에 위탁할 수 있으며, 위탁 시 관련 법령에 따른 안전조치를 이행합니다.",
      },
      {
        title: "6. 이용자 권리와 행사 방법",
        body: "이용자는 자신의 개인정보에 대해 열람·정정·삭제·처리정지 등을 요청할 수 있으며, 제공자는 관련 법령에 따라 지체 없이 조치합니다.",
      },
      {
        title: "7. 개인정보 보호책임자 및 문의",
        body: "개인정보 처리 관련 문의는 서비스 내 안내된 연락 수단을 통해 접수할 수 있으며, 접수된 문의는 신속히 검토·답변합니다.",
      },
    ],
  };
}

export default function CommonAgreePage({ kind }: { kind: CommonAgreeKind }) {
  const page = pageData(kind);
  const counterpartHref =
    kind === "terms" ? "/common/agree/privacy" : "/common/agree/terms";
  const counterpartLabel =
    kind === "terms" ? "개인정보처리방침 보기" : "서비스 이용약관 보기";

  useEffect(() => {
    const fullTitle = `${page.title} | 공통 약관`;
    document.title = fullTitle;
    setMeta("description", page.lead);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", page.lead, true);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", page.lead);

    const origin = (import.meta.env.VITE_SITE_URL ?? window.location.origin)
      .trim()
      .replace(/\/+$/, "");
    const canonical = `${origin}${page.path}`;
    setCanonical(canonical);
    setMeta("og:url", canonical, true);
  }, [page.lead, page.path, page.title]);

  return (
    <div className="common-agree-page">
      <main className="common-agree-main" tabIndex={-1}>
        <section className="common-agree-card">
          <h1 className="common-agree-title">{page.heading}</h1>
          <p className="common-agree-lead">{page.lead}</p>

          {page.sections.map((section) => (
            <article key={section.title} className="common-agree-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}

          <div className="common-agree-links">
            <a href={counterpartHref}>{counterpartLabel}</a>
          </div>
        </section>
      </main>
    </div>
  );
}
