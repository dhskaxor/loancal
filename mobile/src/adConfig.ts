import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

function useTestAdUnits(): boolean {
  const flag = process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS;
  if (flag === "false") return false;
  return true;
}

export type BannerSlot = "top" | "mid" | "bottom";

export function bannerUnitId(slot: BannerSlot): string {
  if (useTestAdUnits()) {
    /* 하단 고정폭 배너는 표준 BANNER 테스트 단위와 짝을 맞추면 로드가 안정적입니다. */
    return slot === "bottom" ? TestIds.BANNER : TestIds.ADAPTIVE_BANNER;
  }
  const v =
    slot === "top"
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_TOP
      : slot === "mid"
        ? process.env.EXPO_PUBLIC_ADMOB_BANNER_MID
        : process.env.EXPO_PUBLIC_ADMOB_BANNER_BOTTOM;
  const id = v?.trim();
  if (id && id.length > 0) return id;
  return slot === "bottom" ? TestIds.BANNER : TestIds.ADAPTIVE_BANNER;
}

export function interstitialUnitId(): string {
  if (useTestAdUnits()) return TestIds.INTERSTITIAL;
  const id = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL?.trim();
  return id && id.length > 0 ? id : TestIds.INTERSTITIAL;
}

/** 웹 번들 URL. 미설정 시 개발용으로 로컬 Vite 주소 사용. */
export function getWebUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (fromEnv) return fromEnv;
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:5173"
      : "http://localhost:5173";
  }
  return "https://loancal-sigma.vercel.app";
}
