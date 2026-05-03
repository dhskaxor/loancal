import { useEffect } from "react";
import { ensureKakaoAdfitScript } from "./kakaoAdfitScript";

type Props = {
  adUnit: string;
  width: number;
  height: number;
  label?: string;
  className?: string;
};

function refreshKakaoAdfit(): void {
  const fn = window.kakao_adfit;
  if (typeof fn !== "function") return;
  try {
    fn();
  } catch {
    /* noop */
  }
}

/**
 * 브라우저 전용. RN WebView에서는 부모가 렌더하지 않음.
 */
export function KakaoAdFitSlot({
  adUnit,
  width,
  height,
  label,
  className = "",
}: Props) {
  useEffect(() => {
    let cancelled = false;
    void ensureKakaoAdfitScript()
      .then(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (!cancelled) refreshKakaoAdfit();
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [adUnit]);

  if (!adUnit) {
    return null;
  }

  return (
    <div
      className={`ad-slot ad-slot--visible ${className}`.trim()}
      data-ad-label={label}
    >
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={adUnit}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}
