import { useCallback, useEffect, useState } from "react";
import { AdSenseLoader } from "./AdSenseLoader";
import { AdSenseSlot } from "./AdSenseSlot";
import { KakaoAdFitSlot } from "./KakaoAdFitSlot";
import { DualRangeSlider } from "./DualRangeSlider";
import { RangeWithNudges } from "./RangeWithNudges";
import { KAKAO_ADFIT_UNITS, useWebAds } from "./useWebAds";

type Cell = {
  monthly: number;
  totalPay: number;
  totalInterest: number;
};

type CompareResult = {
  rates: number[];
  terms: number[];
  cells: Record<string, Cell>;
  bestCell: string | null;
  okCount: number;
};

function isReactNativeWebView(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

function calcMonthly(principalWon: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principalWon / months;
  return (
    (principalWon * r * Math.pow(1 + r, months)) /
    (Math.pow(1 + r, months) - 1)
  );
}

function fmtMan(nWon: number): string {
  if (nWon >= 100000000) return `${(nWon / 100000000).toFixed(1)}억`;
  return `${Math.round(nWon / 10000)}만`;
}

function termLabel(months: number): string {
  if (months < 12) return `${months}개월`;
  if (months % 12 === 0) return `${months / 12}년`;
  return `${Math.floor(months / 12)}년 ${months % 12}개월`;
}

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

export default function LoanComparePage() {
  const ads = useWebAds();
  const AMOUNT_MIN = 100;
  const AMOUNT_MAX = 50000;
  const AMOUNT_STEP = 100;
  const BUDGET_MIN = 10;
  const BUDGET_MAX = 2000;
  const BUDGET_STEP = 10;
  const RATE_MIN_BOUND = 1;
  const RATE_MAX_BOUND = 20;
  const RATE_STEP_FIXED = 1;
  const TERM_MIN_BOUND = 12;
  const TERM_MAX_BOUND = 360;
  const TERM_STEP_FIXED = 12;

  const [loanAmountMan, setLoanAmountMan] = useState(3000);
  const [monthlyBudgetMan, setMonthlyBudgetMan] = useState(80);
  const [rateMin, setRateMin] = useState(3);
  const [rateMax, setRateMax] = useState(8);
  const [termMin, setTermMin] = useState(12);
  const [termMax, setTermMax] = useState(60);
  const [result, setResult] = useState<CompareResult | null>(null);

  const clampAmount = useCallback((v: number) => {
    const rounded = Math.round(v / AMOUNT_STEP) * AMOUNT_STEP;
    return Math.min(AMOUNT_MAX, Math.max(AMOUNT_MIN, rounded));
  }, [AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP]);

  const clampBudget = useCallback((v: number) => {
    const rounded = Math.round(v / BUDGET_STEP) * BUDGET_STEP;
    return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, rounded));
  }, [BUDGET_MAX, BUDGET_MIN, BUDGET_STEP]);

  const clampRateBound = useCallback((v: number) => {
    const rounded = Math.round(v * 10) / 10;
    return Math.min(RATE_MAX_BOUND, Math.max(RATE_MIN_BOUND, rounded));
  }, [RATE_MAX_BOUND, RATE_MIN_BOUND]);

  const clampTermBound = useCallback((v: number) => {
    const c = Math.max(TERM_MIN_BOUND, Math.min(TERM_MAX_BOUND, v));
    const steps = Math.round((c - TERM_MIN_BOUND) / TERM_STEP_FIXED);
    return Math.min(
      TERM_MAX_BOUND,
      Math.max(TERM_MIN_BOUND, steps * TERM_STEP_FIXED + TERM_MIN_BOUND)
    );
  }, [TERM_MAX_BOUND, TERM_MIN_BOUND, TERM_STEP_FIXED]);

  useEffect(() => {
    const title = "대출 비교 계산기 - 이자율·기간별 한눈에 비교";
    const desc =
      "월 상환 가능 금액과 대출액으로 이자율별, 기간별 최적 대출 조건을 한눈에 비교하세요.";
    document.title = title;
    setMeta("description", desc);
    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);

    const origin = (import.meta.env.VITE_SITE_URL ?? window.location.origin)
      .trim()
      .replace(/\/+$/, "");
    const canonical = `${origin}/compare`;
    setCanonical(canonical);
    setMeta("og:url", canonical, true);
  }, []);

  const calculate = useCallback((notifyNative = false) => {
    const principalWon = loanAmountMan * 10000;
    const budgetWon = monthlyBudgetMan * 10000;
    if (
      principalWon <= 0 ||
      budgetWon <= 0 ||
      rateMin >= rateMax ||
      termMin >= termMax ||
      RATE_STEP_FIXED <= 0 ||
      TERM_STEP_FIXED <= 0
    ) {
      return;
    }

    const rates: number[] = [];
    for (let r = rateMin; r <= rateMax + 0.001; r += RATE_STEP_FIXED) {
      rates.push(Math.round(r * 10) / 10);
    }
    const terms: number[] = [];
    for (let t = termMin; t <= termMax; t += TERM_STEP_FIXED) {
      terms.push(t);
    }

    let bestCell: string | null = null;
    let minInterest = Number.POSITIVE_INFINITY;
    const cells: Record<string, Cell> = {};

    for (const t of terms) {
      for (const r of rates) {
        const monthly = calcMonthly(principalWon, r, t);
        const totalPay = monthly * t;
        const totalInterest = totalPay - principalWon;
        const key = `${t}_${r}`;
        cells[key] = { monthly, totalPay, totalInterest };
        if (monthly <= budgetWon && totalInterest < minInterest) {
          minInterest = totalInterest;
          bestCell = key;
        }
      }
    }

    const okCount = Object.values(cells).filter(
      (x) => x.monthly <= budgetWon
    ).length;
    setResult({ rates, terms, cells, bestCell, okCount });

    if (notifyNative && isReactNativeWebView()) {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "loan_calculate" })
      );
    }
  }, [
    loanAmountMan,
    monthlyBudgetMan,
    rateMin,
    rateMax,
    termMin,
    termMax,
    RATE_STEP_FIXED,
    TERM_STEP_FIXED,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const budgetWon = monthlyBudgetMan * 10000;
  const bestData =
    result?.bestCell && result.cells[result.bestCell]
      ? {
          key: result.bestCell,
          cell: result.cells[result.bestCell],
        }
      : null;
  const bestRate = bestData ? bestData.key.split("_")[1] : "";
  const bestTerm = bestData
    ? termLabel(Number(bestData.key.split("_")[0]))
    : "";
  const totalCount = result ? Object.keys(result.cells).length : 0;

  return (
    <div className="app-shell compare-shell">
      {ads.mode === "adsense" && ads.enabled && (
        <AdSenseLoader clientId={ads.client} />
      )}

      <header className="header compare-header">
        <div className="compare-badge">대출 비교 계산기</div>
        <h1 className="compare-title">
          이자율 · 기간별 <span>한눈에 비교</span>
        </h1>
        <p className="header-tagline">
          월 상환 가능액과 대출액을 입력하면 최적 조건을 자동으로 찾아드려요
        </p>
        <nav className="page-nav" aria-label="계산기 메뉴">
          <a href="/" className="tab">
            대출 계산기
          </a>
          <a href="/compare" className="tab active" aria-current="page">
            대출 비교 계산기
          </a>
        </nav>
      </header>

      {ads.mode === "kakao" && ads.enabled && (
        <KakaoAdFitSlot
          adUnit={KAKAO_ADFIT_UNITS.top.adUnit}
          width={KAKAO_ADFIT_UNITS.top.width}
          height={KAKAO_ADFIT_UNITS.top.height}
          label="compare-top"
          className="ad-slot--top"
        />
      )}

      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="container compare-container">
          <section className="card">
            <div className="card-title">기본 조건</div>
            <div className="input-group">
              <div className="input-label">
                <span>대출 금액</span>
                <span className="input-value">{loanAmountMan.toLocaleString("ko-KR")}만원</span>
              </div>
              <RangeWithNudges
                groupLabel="비교 계산 대출 금액 조절"
                left={[
                  {
                    label: "−500",
                    ariaLabel: "대출 금액 500만원 감소",
                    disabled: loanAmountMan <= AMOUNT_MIN,
                    onClick: () => setLoanAmountMan((v) => clampAmount(v - 500)),
                  },
                  {
                    label: "−100",
                    ariaLabel: "대출 금액 100만원 감소",
                    disabled: loanAmountMan <= AMOUNT_MIN,
                    onClick: () => setLoanAmountMan((v) => clampAmount(v - 100)),
                  },
                ]}
                right={[
                  {
                    label: "+100",
                    ariaLabel: "대출 금액 100만원 증가",
                    disabled: loanAmountMan >= AMOUNT_MAX,
                    onClick: () => setLoanAmountMan((v) => clampAmount(v + 100)),
                  },
                  {
                    label: "+500",
                    ariaLabel: "대출 금액 500만원 증가",
                    disabled: loanAmountMan >= AMOUNT_MAX,
                    onClick: () => setLoanAmountMan((v) => clampAmount(v + 500)),
                  },
                ]}
              >
                <input
                  type="range"
                  min={AMOUNT_MIN}
                  max={AMOUNT_MAX}
                  step={AMOUNT_STEP}
                  value={loanAmountMan}
                  onChange={(e) => setLoanAmountMan(Number(e.target.value))}
                  aria-label="비교 계산 대출 금액 슬라이더"
                />
              </RangeWithNudges>
              <div className="range-labels range-labels--below">
                <span>100만원</span>
                <span>5억원</span>
              </div>
            </div>

            <div className="input-group">
              <div className="input-label">
                <span>월 상환 가능액</span>
                <span className="input-value">{monthlyBudgetMan.toLocaleString("ko-KR")}만원</span>
              </div>
              <RangeWithNudges
                groupLabel="월 상환 가능액 조절"
                left={[
                  {
                    label: "−50",
                    ariaLabel: "월 상환 가능액 50만원 감소",
                    disabled: monthlyBudgetMan <= BUDGET_MIN,
                    onClick: () => setMonthlyBudgetMan((v) => clampBudget(v - 50)),
                  },
                  {
                    label: "−10",
                    ariaLabel: "월 상환 가능액 10만원 감소",
                    disabled: monthlyBudgetMan <= BUDGET_MIN,
                    onClick: () => setMonthlyBudgetMan((v) => clampBudget(v - 10)),
                  },
                ]}
                right={[
                  {
                    label: "+10",
                    ariaLabel: "월 상환 가능액 10만원 증가",
                    disabled: monthlyBudgetMan >= BUDGET_MAX,
                    onClick: () => setMonthlyBudgetMan((v) => clampBudget(v + 10)),
                  },
                  {
                    label: "+50",
                    ariaLabel: "월 상환 가능액 50만원 증가",
                    disabled: monthlyBudgetMan >= BUDGET_MAX,
                    onClick: () => setMonthlyBudgetMan((v) => clampBudget(v + 50)),
                  },
                ]}
              >
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={monthlyBudgetMan}
                  onChange={(e) => setMonthlyBudgetMan(Number(e.target.value))}
                  aria-label="비교 계산 월 상환 가능액 슬라이더"
                />
              </RangeWithNudges>
              <div className="range-labels range-labels--below">
                <span>10만원</span>
                <span>2,000만원</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-title">비교 범위 설정</div>
            <div className="compare-range-block">
              <p className="compare-range-title">이자율 범위 (%)</p>
              <div className="input-group">
                <div className="input-label">
                  <span>이자율 구간</span>
                  <span className="input-value">
                    {rateMin.toFixed(1)}% ~ {rateMax.toFixed(1)}%
                  </span>
                </div>
                <div className="range-row">
                  <div className="range-core">
                    <DualRangeSlider
                      minBound={RATE_MIN_BOUND}
                      maxBound={RATE_MAX_BOUND}
                      step={0.1}
                      low={rateMin}
                      high={rateMax}
                      minGap={RATE_STEP_FIXED}
                      snap={clampRateBound}
                      onChange={(l, h) => {
                        setRateMin(l);
                        setRateMax(h);
                      }}
                      lowAriaLabel="비교 최저 이자율"
                      highAriaLabel="비교 최고 이자율"
                    />
                  </div>
                </div>
                <div className="range-labels range-labels--below">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>

            <div className="compare-range-block">
              <p className="compare-range-title">대출 기간 (개월)</p>
              <div className="input-group">
                <div className="input-label">
                  <span>기간 구간</span>
                  <span className="input-value">
                    {termLabel(termMin)} ~ {termLabel(termMax)}
                  </span>
                </div>
                <div className="range-row">
                  <div className="range-core">
                    <DualRangeSlider
                      minBound={TERM_MIN_BOUND}
                      maxBound={TERM_MAX_BOUND}
                      step={TERM_STEP_FIXED}
                      low={termMin}
                      high={termMax}
                      minGap={TERM_STEP_FIXED}
                      snap={clampTermBound}
                      onChange={(l, h) => {
                        setTermMin(l);
                        setTermMax(h);
                      }}
                      lowAriaLabel="비교 최단 대출 기간"
                      highAriaLabel="비교 최장 대출 기간"
                    />
                  </div>
                </div>
                <div className="range-labels range-labels--below">
                  <span>1년</span>
                  <span>30년</span>
                </div>
              </div>
            </div>
          </section>

          <button
            type="button"
            className="calc-btn"
            onClick={() => calculate(true)}
          >
            📊 비교 계산하기
          </button>

          {result && (
            <section className="compare-result-wrap">
              <div className="compare-summary-cards">
                {bestData ? (
                  <>
                    <article className="compare-summary-card">
                      <div className="compare-summary-label">최적 조건</div>
                      <div className="compare-summary-value compare-ok-text">
                        {bestRate}% · {bestTerm}
                      </div>
                      <p className="compare-summary-sub">
                        월 {fmtMan(bestData.cell.monthly)}원
                      </p>
                    </article>
                    <article className="compare-summary-card">
                      <div className="compare-summary-label">최소 이자</div>
                      <div className="compare-summary-value">
                        {fmtMan(bestData.cell.totalInterest)}원
                      </div>
                      <p className="compare-summary-sub">
                        총 상환 {fmtMan(bestData.cell.totalPay)}원
                      </p>
                    </article>
                  </>
                ) : (
                  <article className="compare-summary-card compare-summary-full">
                    <div className="compare-summary-label">상환 가능한 조건 없음</div>
                    <div className="compare-summary-value compare-bad-text">
                      월 상환액을 높이거나 대출액을 줄여보세요
                    </div>
                  </article>
                )}
              </div>

              <div className="compare-tip-box">
                {bestData ? (
                  <>
                    <p className="compare-tip-line">
                      전체{" "}
                      <strong className="compare-strong-count">
                        {totalCount}개
                      </strong>{" "}
                      조건 중{" "}
                      <strong className="compare-strong-count">
                        {result.okCount}개
                      </strong>
                      가 상환 가능해요.
                    </p>
                    <p className="compare-best-line">
                      가장 유리한 조건{" "}
                      <strong className="compare-strong-best">
                        {bestRate}% · {bestTerm}
                      </strong>
                    </p>
                  </>
                ) : (
                  <>현재 범위에서는 월 상환 예산 내 조건이 없습니다.</>
                )}
              </div>

              <a
                className="loan-check-btn compare-loan-check-btn"
                href="https://loan.pay.naver.com/n/credit"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔎 대출확인하기
              </a>

              {ads.mode === "kakao" && ads.enabled && (
                <KakaoAdFitSlot
                  adUnit={KAKAO_ADFIT_UNITS.mid.adUnit}
                  width={KAKAO_ADFIT_UNITS.mid.width}
                  height={KAKAO_ADFIT_UNITS.mid.height}
                  label="compare-mid"
                  className="ad-slot--mid"
                />
              )}
              {ads.mode === "adsense" && ads.enabled && (
                <AdSenseSlot
                  clientId={ads.client}
                  slotId={ads.mid}
                  label="compare-mid"
                  format="horizontal"
                  className="ad-slot--mid"
                />
              )}

              <div className="compare-result-header">
                <div className="compare-result-title">이자율 × 기간 비교표</div>
                <div className="compare-legend">
                  <span className="compare-legend-item compare-legend-ok">
                    <i className="compare-legend-dot" />
                    가능
                  </span>
                  <span className="compare-legend-item compare-legend-warn">
                    <i className="compare-legend-dot" />
                    빠듯
                  </span>
                  <span className="compare-legend-item compare-legend-bad">
                    <i className="compare-legend-dot" />
                    초과
                  </span>
                </div>
              </div>

              <div className="compare-table-scroll">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th title="기간 / 금리">기/금</th>
                      {result.rates.map((r) => (
                        <th key={r}>{r}%</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.terms.map((t) => (
                      <tr key={t}>
                        <td className="compare-term-cell">{termLabel(t)}</td>
                        {result.rates.map((r) => {
                          const key = `${t}_${r}`;
                          const cell = result.cells[key];
                          const ratio = cell.monthly / budgetWon;
                          const impossible = ratio > 1.2;
                          const isBest = key === result.bestCell;
                          const cls =
                            ratio <= 0.85
                              ? "compare-ok"
                              : ratio <= 1.1
                                ? "compare-warn"
                                : "compare-bad";

                          return (
                            <td
                              key={key}
                              className={impossible ? "compare-impossible-cell" : cls}
                            >
                              {impossible ? (
                                <div className="compare-impossible">불가</div>
                              ) : (
                                <div className="compare-cell">
                                  {isBest && (
                                    <span className="compare-best">BEST</span>
                                  )}
                                  <div className="compare-cell-monthly">
                                    {fmtMan(cell.monthly)}원
                                  </div>
                                  <div className="compare-cell-interest">
                                    이자 {fmtMan(cell.totalInterest)}
                                  </div>
                                  <div className="compare-cell-total">
                                    총 {fmtMan(cell.totalPay)}원
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {ads.mode === "kakao" && ads.enabled && (
        <KakaoAdFitSlot
          adUnit={KAKAO_ADFIT_UNITS.bottom.adUnit}
          width={KAKAO_ADFIT_UNITS.bottom.width}
          height={KAKAO_ADFIT_UNITS.bottom.height}
          label="compare-bottom"
          className="ad-slot--bottom"
        />
      )}
      {ads.mode === "adsense" && ads.enabled && (
        <AdSenseSlot
          clientId={ads.client}
          slotId={ads.bottom}
          label="compare-bottom"
          className="ad-slot--bottom"
        />
      )}
    </div>
  );
}
