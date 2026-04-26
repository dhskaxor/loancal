import { useEffect, useRef } from "react";

type Props = {
  slotId: string;
  clientId: string;
  format?: string;
  label?: string;
  /** 래퍼에 추가 클래스 (레이아웃용) */
  className?: string;
};

/** 브라우저 전용. RN WebView에서는 부모가 렌더하지 않음. */
export function AdSenseSlot({
  slotId,
  clientId,
  format = "horizontal",
  label,
  className = "",
}: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slotId || !clientId || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      pushed.current = false;
    }
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
