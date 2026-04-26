import { useEffect, useRef } from "react";
import { ensureAdsenseScript } from "./adsenseScript";

type Props = {
  slotId: string;
  clientId: string;
  format?: string;
  label?: string;
  /** 래퍼에 추가 클래스 (레이아웃용) */
  className?: string;
};

function doubleRequestAnimationFrame(cb: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}

/** 브라우저 전용. RN WebView에서는 부모가 렌더하지 않음. */
export function AdSenseSlot({
  slotId,
  clientId,
  format = "auto",
  label,
  className = "",
}: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slotId || !clientId) return;

    let cancelled = false;

    const runPush = () => {
      if (cancelled || pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        pushed.current = false;
      }
    };

    void ensureAdsenseScript(clientId)
      .then(() => {
        if (cancelled) return;
        doubleRequestAnimationFrame(runPush);
      })
      .catch(() => {
        pushed.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [slotId, clientId]);

  return (
    <div className={`ad-slot ${className}`.trim()} data-ad-label={label}>
      <ins
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
