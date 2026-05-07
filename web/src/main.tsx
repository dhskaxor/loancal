import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import LoanComparePage from "./LoanComparePage.tsx";
import LegalPage from "./LegalPage.tsx";
import CommonAgreePage from "./CommonAgreePage.tsx";
import InfoArticlePage from "./info/InfoArticlePage.tsx";
import LottoPage from "./lotto/LottoPage.tsx";
import SiteNavDrawer from "./SiteNavDrawer.tsx";
import { getDoc } from "./info/docsData.ts";
import "./index.css";

function AppChrome({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <>
      {!hideNav && <SiteNavDrawer />}
      {children}
    </>
  );
}

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isComparePage = path === "/compare";
const isPrivacyPage = path === "/privacy";
const isTermsPage = path === "/terms";
const isContactPage = path === "/contact";
const isLottoPage = path === "/lotto";
const isCommonAgreeTerms = path === "/common/agree/terms";
const isCommonAgreePrivacy = path === "/common/agree/privacy";
const isInfoDoc = Boolean(getDoc(path));
const hideGlobalNav = isCommonAgreeTerms || isCommonAgreePrivacy;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppChrome hideNav={hideGlobalNav}>
      {isComparePage ? (
        <LoanComparePage />
      ) : isCommonAgreeTerms ? (
        <CommonAgreePage kind="terms" />
      ) : isCommonAgreePrivacy ? (
        <CommonAgreePage kind="privacy" />
      ) : isPrivacyPage ? (
        <LegalPage kind="privacy" />
      ) : isTermsPage ? (
        <LegalPage kind="terms" />
      ) : isContactPage ? (
        <LegalPage kind="contact" />
      ) : isLottoPage ? (
        <LottoPage />
      ) : isInfoDoc ? (
        <InfoArticlePage path={path} />
      ) : (
        <App />
      )}
    </AppChrome>
  </StrictMode>
);
