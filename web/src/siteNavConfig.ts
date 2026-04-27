export type SiteNavLink = { href: string; label: string };

export type SiteNavSection = { heading: string; links: SiteNavLink[] };

export const SITE_NAV_SECTIONS: SiteNavSection[] = [
  {
    heading: "서비스",
    links: [
      { href: "/", label: "대출 계산기" },
      { href: "/compare", label: "대출 비교 계산기" },
      { href: "/disclaimer", label: "면책 고지" },
      { href: "/terms", label: "이용약관" },
      { href: "/privacy", label: "개인정보처리방침" },
      { href: "/contact", label: "문의하기" },
    ],
  },
  {
    heading: "도움말",
    links: [
      { href: "/about", label: "서비스 소개" },
      { href: "/guide", label: "계산기 사용법" },
      { href: "/compare-guide", label: "비교 계산기 사용법" },
      { href: "/repayment-compare", label: "상환 방식 심화" },
      { href: "/rate-term-effects", label: "금리·기간 영향" },
      { href: "/faq", label: "자주 묻는 질문" },
    ],
  },
];
