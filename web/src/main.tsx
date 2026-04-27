import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import LoanComparePage from "./LoanComparePage.tsx";
import LegalPage from "./LegalPage.tsx";
import "./index.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isComparePage = path === "/compare";
const isPrivacyPage = path === "/privacy";
const isTermsPage = path === "/terms";
const isContactPage = path === "/contact";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isComparePage ? (
      <LoanComparePage />
    ) : isPrivacyPage ? (
      <LegalPage kind="privacy" />
    ) : isTermsPage ? (
      <LegalPage kind="terms" />
    ) : isContactPage ? (
      <LegalPage kind="contact" />
    ) : (
      <App />
    )}
  </StrictMode>
);
