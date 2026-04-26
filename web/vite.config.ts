import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defineConfig,
  loadEnv,
  type HtmlTagDescriptor,
  type Plugin,
} from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 배포 기본 도메인 (프로덕션 빌드 시 .env 미설정이어도 SEO에 반영) */
const DEFAULT_PRODUCTION_SITE = "https://loancal-sigma.vercel.app";

const SITE_DESC =
  "원리금균등·원금균등·만기일시 상환 방식별 월 상환금, 총 이자, 상환 스케줄을 무료로 계산하고 저장·비교할 수 있는 대출 계산기입니다.";

const SEO_TITLE =
  "대출 계산기 | 원리금균등·원금균등·만기일시 월 상환액·이자 계산";

function resolveSiteUrl(mode: string, envDir: string): string {
  const env = loadEnv(mode, envDir, "");
  const fromEnv = (env.VITE_SITE_URL || "").trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (mode === "production") return DEFAULT_PRODUCTION_SITE;
  return "";
}

function seoDistPlugin(site: string): Plugin {
  return {
    name: "loancal-seo-dist",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      if (!fs.existsSync(dist)) return;

      if (site) {
        fs.writeFileSync(
          path.join(dist, "robots.txt"),
          `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
          "utf8"
        );
        fs.writeFileSync(
          path.join(dist, "sitemap.xml"),
          `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`,
          "utf8"
        );
      } else {
        fs.writeFileSync(
          path.join(dist, "robots.txt"),
          "User-agent: *\nAllow: /\n",
          "utf8"
        );
      }
    },
  };
}

function htmlSeoInject(site: string): Plugin {
  /** charset·title 뒤에 붙여 검색엔진이 핵심 메타를 먼저 읽도록 함 */
  const injectTo = "head" as const;

  return {
    name: "loancal-html-seo",
    transformIndexHtml: {
      order: "post",
      handler() {
        const graph: Record<string, unknown>[] = [
          {
            "@type": "WebSite",
            name: "대출 계산기",
            description: SITE_DESC,
            inLanguage: "ko-KR",
            ...(site ? { url: `${site}/` } : {}),
          },
          {
            "@type": "WebApplication",
            name: "대출 계산기",
            description: SITE_DESC,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            browserRequirements: "HTML5, JavaScript",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "KRW",
            },
            ...(site ? { url: `${site}/` } : {}),
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "원리금균등이란 무엇인가요?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "매월 납부하는 원금과 이자의 합(원리금)이 동일한 대출 상환 방식입니다. 초기에는 이자 비중이 크고 후반으로 갈수록 원금 비중이 커집니다.",
                },
              },
              {
                "@type": "Question",
                name: "원금균등과 원리금균등의 차이는?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "원금균등은 매월 같은 원금을 갚고 잔액에 이자를 붙여 납부액이 줄어듭니다. 같은 조건에서 총 이자는 원리금균등보다 적게 나오는 경우가 많습니다.",
                },
              },
              {
                "@type": "Question",
                name: "만기일시 상환이란?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "기간 동안 이자만 매월 납부하고 만기에 원금 전액을 한 번에 상환하는 방식입니다. 월 부담은 작을 수 있으나 만기 일시 상환 부담과 총 이자가 클 수 있습니다.",
                },
              },
            ],
          },
        ];

        const ldJson = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }).replace(/</g, "\\u003c");

        const tags: HtmlTagDescriptor[] = [
          {
            tag: "meta",
            attrs: {
              name: "robots",
              content: "index, follow, max-image-preview:large",
            },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "googlebot", content: "index, follow" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: {
              name: "keywords",
              content:
                "대출 계산기, 월 상환금, 원리금균등, 원금균등, 만기일시, 대출 이자 계산, 주택담보대출 계산, 신용대출 계산, 상환 스케줄, 대출 비교",
            },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "author", content: "대출 계산기" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "theme-color", content: "#0a0e1a" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: {
              name: "referrer",
              content: "strict-origin-when-cross-origin",
            },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "format-detection", content: "telephone=no" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { property: "og:type", content: "website" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { property: "og:locale", content: "ko_KR" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { property: "og:title", content: SEO_TITLE },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { property: "og:description", content: SITE_DESC },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "twitter:card", content: "summary" },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "twitter:title", content: SEO_TITLE },
            injectTo,
          },
          {
            tag: "meta",
            attrs: { name: "twitter:description", content: SITE_DESC },
            injectTo,
          },
        ];

        if (site) {
          tags.push(
            {
              tag: "link",
              attrs: { rel: "canonical", href: `${site}/` },
              injectTo,
            },
            {
              tag: "link",
              attrs: { rel: "alternate", hreflang: "ko-KR", href: `${site}/` },
              injectTo,
            },
            {
              tag: "meta",
              attrs: { property: "og:url", content: `${site}/` },
              injectTo,
            }
          );
        }

        tags.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: ldJson,
          injectTo,
        });

        return tags;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const site = resolveSiteUrl(mode, __dirname);

  return {
    plugins: [react(), htmlSeoInject(site), seoDistPlugin(site)],
    server: {
      host: true,
      port: 5173,
    },
  };
});
