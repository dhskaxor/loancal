import { useMemo } from "react";
import {
  isLikelyPublisherIdInsteadOfSlot,
  normalizePublisherId,
} from "./adsenseEnv";

function isReactNativeWebView(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

function normalizeAdProvider(raw: string | undefined): "kakao" | "adsense" {
  const v = (raw ?? "kakao").trim().toLowerCase();
  return v === "adsense" ? "adsense" : "kakao";
}

/** 카카오 애드핏 광고 단위 (상·중·하) — AdSense 승인 후 `VITE_AD_PROVIDER=adsense`로 전환 */
export const KAKAO_ADFIT_UNITS = {
  top: { adUnit: "DAN-brb82guIy1IJT6FP", width: 320, height: 50 },
  mid: { adUnit: "DAN-xrB8Mhprsj4YuLJb", width: 300, height: 250 },
  bottom: { adUnit: "DAN-xLOfxse4mPO9Jdt8", width: 250, height: 250 },
} as const;

export type WebAdsConfig =
  | { mode: "kakao"; enabled: boolean }
  | {
      mode: "adsense";
      enabled: boolean;
      client: string;
      mid: string;
      bottom: string;
    };

export function useWebAds(): WebAdsConfig {
  return useMemo(() => {
    const mode = normalizeAdProvider(import.meta.env.VITE_AD_PROVIDER);

    if (mode === "kakao") {
      return { mode: "kakao", enabled: !isReactNativeWebView() };
    }

    const client = normalizePublisherId(
      import.meta.env.VITE_ADSENSE_CLIENT ?? ""
    );
    const mid = import.meta.env.VITE_ADSENSE_SLOT_MID?.trim() ?? "";
    const bottom = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM?.trim() ?? "";

    const slotInvalid =
      isLikelyPublisherIdInsteadOfSlot(mid) ||
      isLikelyPublisherIdInsteadOfSlot(bottom);

    if (
      import.meta.env.DEV &&
      client &&
      (mid || bottom) &&
      slotInvalid
    ) {
      console.warn(
        "[AdSense] VITE_ADSENSE_SLOT_MID / BOTTOM 값이 잘못된 것 같습니다. " +
          "`ca-pub-...`(발행자 ID)가 아니라, AdSense 콘솔 → 광고 단위에 표시되는 숫자 슬롯 ID를 넣어야 합니다."
      );
    }

    const enabled =
      !isReactNativeWebView() &&
      !!client &&
      !!mid &&
      !!bottom &&
      !slotInvalid;

    return { mode: "adsense", enabled, client, mid, bottom };
  }, []);
}
