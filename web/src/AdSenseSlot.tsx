import { useEffect, useRef, useState } from "react";
import { ensureAdsenseScript } from "./adsenseScript";

type Props = {
  slotId: string;
  clientId: string;
  format?: string;
  label?: string;
  /** 래퍼에 추가 클래스 (레이아웃용) */
  className?: string;
};

type FillPhase = "loading" | "filled" | "empty";

function doubleRequestAnimationFrame(cb: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}

/** ins 안에 실제 크리에이티브가 올라왔는지 대략 판별 */
function isLikelyFilled(ins: HTMLModElement): boolean {
  if (ins.querySelector("iframe")) return true;
  const h = ins.offsetHeight;
  const w = ins.offsetWidth;
  return h >= 28 && w >= 120;
}

const FILL_WAIT_MS = 12_000;

/**
 * 브라우저 전용. RN WebView에서는 부모가 렌더하지 않음.
 * 슬롯이 실제로 채워진 뒤에만 영역을 보이게 하고, 실패·무응답이면 아무것도 그리지 않음.
 */
export function AdSenseSlot({
  slotId,
  clientId,
  format = "auto",
  label,
  className = "",
}: Props) {
  const pushed = useRef(false);
  const insRef = useRef<HTMLModElement | null>(null);
  const [phase, setPhase] = useState<FillPhase>("loading");

  useEffect(() => {
    if (!slotId || !clientId) {
      setPhase("empty");
      return;
    }

    let cancelled = false;
    let ro: ResizeObserver | null = null;
    let mo: MutationObserver | null = null;
    let failTimer: ReturnType<typeof setTimeout> | null = null;

    const settleEmpty = () => {
      if (!cancelled) setPhase("empty");
    };

    const settleFilled = () => {
      if (!cancelled) setPhase("filled");
    };

    const tryDetect = (): boolean => {
      const el = insRef.current;
      if (!el || cancelled) return false;
      if (isLikelyFilled(el)) {
        settleFilled();
        return true;
      }
      return false;
    };

    const clearWatchers = () => {
      ro?.disconnect();
      ro = null;
      mo?.disconnect();
      mo = null;
      if (failTimer != null) {
        clearTimeout(failTimer);
        failTimer = null;
      }
    };

    const startWatching = () => {
      const el = insRef.current;
      if (!el || cancelled) return;

      if (tryDetect()) {
        clearWatchers();
        return;
      }

      ro = new ResizeObserver(() => {
        if (tryDetect()) clearWatchers();
      });
      ro.observe(el);

      mo = new MutationObserver(() => {
        if (tryDetect()) clearWatchers();
      });
      mo.observe(el, { childList: true, subtree: true });

      failTimer = setTimeout(() => {
        if (cancelled) return;
        if (!tryDetect()) settleEmpty();
        clearWatchers();
      }, FILL_WAIT_MS);
    };

    const runPush = () => {
      if (cancelled || pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        pushed.current = false;
        settleEmpty();
        return;
      }
      requestAnimationFrame(startWatching);
    };

    void ensureAdsenseScript(clientId)
      .then(() => {
        if (cancelled) return;
        doubleRequestAnimationFrame(runPush);
      })
      .catch(() => {
        settleEmpty();
      });

    return () => {
      cancelled = true;
      clearWatchers();
    };
  }, [slotId, clientId]);

  if (phase === "empty") {
    return null;
  }

  const pending = phase === "loading";

  return (
    <div
      className={`ad-slot ${pending ? "ad-slot--pending" : "ad-slot--visible"} ${className}`.trim()}
      data-ad-label={label}
      aria-busy={pending}
      aria-hidden={pending}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
