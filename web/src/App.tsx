import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdSenseLoader } from "./AdSenseLoader";
import { AdSenseSlot } from "./AdSenseSlot";
import {
  computeLoan,
  type LoanComputation,
  type RepaymentMethod,
} from "./loanMath";
import {
  addSavedScenario,
  loadSavedScenarios,
  methodLabel,
  removeSavedScenario,
  type SavedScenario,
} from "./savedScenarios";
import {
  isLikelyPublisherIdInsteadOfSlot,
  normalizePublisherId,
} from "./adsenseEnv";

function isReactNativeWebView(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

function useAdsenseConfig() {
  return useMemo(() => {
    const client = normalizePublisherId(
      import.meta.env.VITE_ADSENSE_CLIENT ?? ""
    );
    const top = import.meta.env.VITE_ADSENSE_SLOT_TOP?.trim() ?? "";
    const mid = import.meta.env.VITE_ADSENSE_SLOT_MID?.trim() ?? "";
    const bottom = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM?.trim() ?? "";

    const slotInvalid =
      isLikelyPublisherIdInsteadOfSlot(top) ||
      isLikelyPublisherIdInsteadOfSlot(mid) ||
      isLikelyPublisherIdInsteadOfSlot(bottom);

    if (
      import.meta.env.DEV &&
      client &&
      (top || mid || bottom) &&
      slotInvalid
    ) {
      console.warn(
        "[AdSense] VITE_ADSENSE_SLOT_* 값이 잘못된 것 같습니다. " +
          "`ca-pub-...`(발행자 ID)가 아니라, AdSense 콘솔 → 광고 단위에 표시되는 숫자 슬롯 ID를 넣어야 합니다."
      );
    }

    const enabled =
      !isReactNativeWebView() &&
      !!client &&
      !!top &&
      !!mid &&
      !!bottom &&
      !slotInvalid;

    return { enabled, client, top, mid, bottom };
  }, []);
}

function amountLabel(amountMan: number): string {
  if (amountMan >= 10000) {
    const eok = amountMan / 10000;
    return `${eok % 1 === 0 ? eok.toFixed(0) : eok.toFixed(1)}억원`;
  }
  return `${amountMan.toLocaleString("ko-KR")}만원`;
}

function termLabel(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y}년`);
  if (m > 0) parts.push(`${m}개월`);
  return parts.join(" ").trim() || "0개월";
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

const METHODS: RepaymentMethod[] = [
  "equal_payment",
  "equal_principal",
  "bullet",
];

export default function App() {
  const ads = useAdsenseConfig();
  const resultRef = useRef<HTMLDivElement>(null);

  const [method, setMethod] = useState<RepaymentMethod>("equal_payment");
  const [amount, setAmount] = useState(3000);
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(12);
  const [computation, setComputation] = useState<LoanComputation>(() =>
    computeLoan(3000, 4.5, 12, "equal_payment")
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [savedList, setSavedList] = useState<SavedScenario[]>(() =>
    loadSavedScenarios()
  );
  const [saveName, setSaveName] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const notifyNativeCalculate = useCallback(() => {
    try {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "loan_calculate" })
      );
    } catch {
      /* noop */
    }
  }, []);

  const runCalculate = useCallback(
    (notifyNative: boolean) => {
      setComputation(computeLoan(amount, rate, term, method));
      if (notifyNative) notifyNativeCalculate();
      setScheduleOpen(false);
    },
    [amount, rate, term, method, notifyNativeCalculate]
  );

  useEffect(() => {
    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [computation]);

  const setMethodAndMaybeRecompute = useCallback(
    (m: RepaymentMethod) => {
      setMethod(m);
      setComputation((prev) =>
        prev ? computeLoan(amount, rate, term, m) : prev
      );
      setScheduleOpen(false);
    },
    [amount, rate, term]
  );

  const handleSaveCurrent = useCallback(() => {
    const name = saveName.trim() || `저장 ${savedList.length + 1}`;
    const list = addSavedScenario({
      name,
      method,
      amountMan: amount,
      rate,
      termMonths: term,
    });
    setSavedList(list);
    setSaveName("");
  }, [saveName, savedList.length, method, amount, rate, term]);

  const handleRemoveSaved = useCallback((id: string) => {
    setCompareIds((p) => p.filter((x) => x !== id));
    setSavedList(removeSavedScenario(id));
  }, []);

  const handleLoadSaved = useCallback((s: SavedScenario) => {
    setMethod(s.method);
    setAmount(s.amountMan);
    setRate(s.rate);
    setTerm(s.termMonths);
    setComputation(
      computeLoan(s.amountMan, s.rate, s.termMonths, s.method)
    );
    setScheduleOpen(false);
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  }, []);

  const compareData = useMemo(() => {
    if (compareIds.length !== 2) return null;
    const a = savedList.find((s) => s.id === compareIds[0]);
    const b = savedList.find((s) => s.id === compareIds[1]);
    if (!a || !b) return null;
    return {
      a,
      b,
      ca: computeLoan(a.amountMan, a.rate, a.termMonths, a.method),
      cb: computeLoan(b.amountMan, b.rate, b.termMonths, b.method),
    };
  }, [compareIds, savedList]);

  const c = computation;

  return (
    <>
      {ads.enabled && <AdSenseLoader clientId={ads.client!} />}

      <div className="ad-top">
        {ads.enabled ? (
          <AdSenseSlot
            clientId={ads.client!}
            slotId={ads.top!}
            label="top"
          />
        ) : (
          <div className="ad-banner-placeholder">광고</div>
        )}
      </div>

      <header className="header">
        <h1>💰 대출 계산기</h1>
        <p className="header-tagline">
          원리금균등 · 원금균등 · 만기일시 상환
        </p>
      </header>

      <main id="main-content" className="main-content" tabIndex={-1}>
      <div className="container">
        <div className="tabs" role="tablist">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              className={`tab${method === m ? " active" : ""}`}
              onClick={() => setMethodAndMaybeRecompute(m)}
            >
              {m === "equal_payment"
                ? "원리금균등"
                : m === "equal_principal"
                  ? "원금균등"
                  : "만기일시"}
            </button>
          ))}
        </div>

        <details className="method-info">
          <summary className="method-info-summary">
            상환 방식이 무엇인가요?
          </summary>
          <div className="method-info-body">
            <section className="method-info-block">
              <h3 className="method-info-title">원리금균등</h3>
              <p className="method-info-text">
                매월 납부하는 <strong>원금과 이자의 합(원리금)</strong>이 같은
                방식입니다. 초기에는 이자 비중이 크고, 기간이 지날수록 원금
                비중이 커집니다. 매달 금액이 일정해 가계부가 편하다는 장점이
                있습니다.
              </p>
            </section>
            <section className="method-info-block">
              <h3 className="method-info-title">원금균등</h3>
              <p className="method-info-text">
                매월 <strong>동일한 원금</strong>을 갚고, 남은 잔액에 이자를
                붙여 내는 방식입니다. 월 상환액은 처음이 가장 크고 점점
                줄어듭니다. 같은 금리·기간이라면 보통{" "}
                <strong>총 이자는 원리금균등보다 적게</strong> 나오는 경우가
                많습니다.
              </p>
            </section>
            <section className="method-info-block">
              <h3 className="method-info-title">만기일시</h3>
              <p className="method-info-text">
                기간 동안에는 <strong>이자만 매월</strong> 내고,{" "}
                <strong>만기에 원금 전액</strong>을 한 번에 갚는 방식입니다.
                월 부담은 상대적으로 작을 수 있지만, 만기에 큰 자금이 필요하고
                세 방식 중 <strong>총 이자가 가장 크게</strong> 나오는 경우가
                많습니다.
              </p>
            </section>
          </div>
        </details>

        <div className="card">
          <div className="card-title">대출 조건 입력</div>

          <div className="input-group">
            <div className="input-label">
              <span>대출 금액</span>
              <span className="input-value">{amountLabel(amount)}</span>
            </div>
            <input
              type="range"
              min={100}
              max={50000}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>100만원</span>
              <span>5억원</span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-label">
              <span>연 이자율</span>
              <span className="input-value">{rate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-label">
              <span>대출 기간</span>
              <span className="input-value">{termLabel(term)}</span>
            </div>
            <input
              type="range"
              min={6}
              max={360}
              step={6}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>6개월</span>
              <span>30년</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="calc-btn"
          onClick={() => runCalculate(true)}
        >
          📊 계산하기
        </button>

        <div className="saved-card">
          <div className="saved-card-title">저장 · 비교</div>
          <p className="saved-hint">
            현재 대출 정보를 저장합니다. 저장 된 항목 두 개를 선택하면 대출을
            비교 하실 수 있습니다.
          </p>
          <div className="save-toolbar">
            <input
              className="save-name-input"
              type="text"
              placeholder="이름 (선택)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              maxLength={48}
              enterKeyHint="done"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSaveCurrent}
            >
              💾 저장
            </button>
          </div>

          {savedList.length > 0 && (
            <>
              <p className="compare-hint">
                비교: 체크박스로 정확히 두 개를 고르세요. (세 번째 선택 시 가장
                먼저 고른 항목이 해제됩니다.)
              </p>
              <div className="saved-list">
                {savedList.map((s) => (
                  <div key={s.id} className="saved-row">
                    <label className="saved-row-compare">
                      <input
                        type="checkbox"
                        checked={compareIds.includes(s.id)}
                        onChange={() => toggleCompare(s.id)}
                        aria-label={`${s.name} 비교 선택`}
                      />
                    </label>
                    <div className="saved-row-body">
                      <div className="saved-row-name">{s.name}</div>
                      <div className="saved-row-meta">
                        {methodLabel(s.method)} · {amountLabel(s.amountMan)} ·{" "}
                        {s.rate.toFixed(1)}% · {termLabel(s.termMonths)}
                      </div>
                    </div>
                    <div className="saved-row-actions">
                      <button
                        type="button"
                        onClick={() => handleLoadSaved(s)}
                      >
                        불러오기
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleRemoveSaved(s.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {compareData && (
            <div className="compare-section">
              <div className="compare-title">선택 두 건 비교</div>
              <div className="compare-table-wrap">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>{compareData.a.name}</th>
                      <th>{compareData.b.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>상환 방식</td>
                      <td>{methodLabel(compareData.a.method)}</td>
                      <td>{methodLabel(compareData.b.method)}</td>
                    </tr>
                    <tr>
                      <td>대출 금액</td>
                      <td>{amountLabel(compareData.a.amountMan)}</td>
                      <td>{amountLabel(compareData.b.amountMan)}</td>
                    </tr>
                    <tr>
                      <td>연 이자율</td>
                      <td>{compareData.a.rate.toFixed(1)}%</td>
                      <td>{compareData.b.rate.toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td>대출 기간</td>
                      <td>{termLabel(compareData.a.termMonths)}</td>
                      <td>{termLabel(compareData.b.termMonths)}</td>
                    </tr>
                    <tr>
                      <td>첫 회 납입</td>
                      <td>
                        <span className="compare-cell-sub">
                          {compareData.ca.monthlyLabel}
                        </span>
                        <strong>{fmt(compareData.ca.firstPayment)}</strong> 원
                      </td>
                      <td>
                        <span className="compare-cell-sub">
                          {compareData.cb.monthlyLabel}
                        </span>
                        <strong>{fmt(compareData.cb.firstPayment)}</strong> 원
                      </td>
                    </tr>
                    <tr>
                      <td>총 이자</td>
                      <td>{fmt(compareData.ca.totalInterest)} 원</td>
                      <td>{fmt(compareData.cb.totalInterest)} 원</td>
                    </tr>
                    <tr>
                      <td>총 상환금</td>
                      <td>{fmt(compareData.ca.totalPayment)} 원</td>
                      <td>{fmt(compareData.cb.totalPayment)} 원</td>
                    </tr>
                    <tr>
                      <td>이자 부담률</td>
                      <td>{compareData.ca.interestRatio}%</td>
                      <td>{compareData.cb.interestRatio}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div ref={resultRef} id="result-section">
          {c && (
            <>
              <div className="result-card" id="result-card">
                <div className="result-main">
                  <div className="result-label">{c.monthlyLabel}</div>
                  <div className="result-amount" id="monthly-amount">
                    {fmt(c.firstPayment)} <span>원</span>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="result-item">
                    <div className="result-item-label">대출 원금</div>
                    <div
                      className="result-item-value color-blue"
                      id="principal-total"
                    >
                      {fmt(c.principalWon)}원
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">총 이자</div>
                    <div
                      className="result-item-value color-orange"
                      id="interest-total"
                    >
                      {fmt(c.totalInterest)}원
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">총 상환금</div>
                    <div
                      className="result-item-value color-green"
                      id="payment-total"
                    >
                      {fmt(c.totalPayment)}원
                    </div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">이자 부담률</div>
                    <div
                      className="result-item-value color-red"
                      id="interest-ratio"
                    >
                      {c.interestRatio}%
                    </div>
                  </div>
                </div>

                <div className="repay-bar-wrap">
                  <div className="repay-bar-label">
                    <span>원금 vs 이자 비중</span>
                  </div>
                  <div className="repay-bar">
                    <div
                      className="repay-bar-principal"
                      id="bar-principal"
                      style={{ width: `${c.principalPct}%` }}
                    />
                    <div
                      className="repay-bar-interest"
                      id="bar-interest"
                      style={{ width: `${c.interestPct}%` }}
                    />
                  </div>
                  <div className="repay-legend">
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ background: "var(--accent)" }}
                      />
                      원금{" "}
                      <span
                        id="legend-principal-pct"
                        style={{ color: "var(--accent)" }}
                      >
                        {c.principalPct}%
                      </span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-dot"
                        style={{ background: "var(--orange)" }}
                      />
                      이자{" "}
                      <span
                        id="legend-interest-pct"
                        style={{ color: "var(--orange)" }}
                      >
                        {c.interestPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`ad-middle${ads.enabled ? " ad-middle--has-ads" : ""}`}
              >
                {ads.enabled ? (
                  <AdSenseSlot
                    clientId={ads.client!}
                    slotId={ads.mid!}
                    label="mid"
                    format="rectangle"
                    className="ad-slot--mid"
                  />
                ) : (
                  "광고"
                )}
              </div>

              <div
                className="tip-box"
                id="tip-box"
                dangerouslySetInnerHTML={{ __html: c.tipHtml }}
              />

              <button
                type="button"
                className="schedule-toggle"
                onClick={() => setScheduleOpen((o) => !o)}
              >
                📋{" "}
                <span id="schedule-btn-text">
                  {scheduleOpen
                    ? "스케줄 접기 ▲"
                    : "월별 상환 스케줄 보기 ▼"}
                </span>
              </button>

              <div
                className={`schedule-table-wrap${scheduleOpen ? " open" : ""}`}
                id="schedule-table-wrap"
              >
                <table>
                  <thead>
                    <tr>
                      <th>회차</th>
                      <th>월상환금</th>
                      <th>원금</th>
                      <th>이자</th>
                      <th>잔금</th>
                    </tr>
                  </thead>
                  <tbody id="schedule-tbody">
                    {c.schedule.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}회</td>
                        <td>{fmt(row.payment)}</td>
                        <td style={{ color: "var(--accent)" }}>
                          {fmt(row.principal)}
                        </td>
                        <td style={{ color: "var(--orange)" }}>
                          {fmt(row.interest)}
                        </td>
                        <td style={{ color: "var(--muted2)" }}>
                          {fmt(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="bottom-spacer" />
      </div>
      </main>

      <div className="ad-bottom">
        {ads.enabled ? (
          <AdSenseSlot
            clientId={ads.client!}
            slotId={ads.bottom!}
            label="bottom"
            className="ad-slot--bottom"
          />
        ) : (
          <div className="ad-banner-placeholder">광고</div>
        )}
      </div>
    </>
  );
}
