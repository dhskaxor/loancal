import { useCallback, useRef } from "react";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { interstitialUnitId } from "./adConfig";

const THRESHOLD = 4;

/**
 * WebView `postMessage` 본문(JSON)을 받아 `loan_calculate`일 때마다 카운트합니다.
 * (메인 계산기의「계산하기」와 비교 계산기의「비교 계산하기」가 동일 타입을 보냅니다.)
 * 4의 배수(4, 8, 12…)마다 전면 광고를 한 번 시도합니다. 로드/표시 중에는 중복 요청을 막습니다.
 */
export function useInterstitialOnLoanCalculate() {
  const countRef = useRef(0);
  const busyRef = useRef(false);

  const handleWebViewMessage = useCallback((raw: string) => {
    let parsed: { type?: string };
    try {
      parsed = JSON.parse(raw) as { type?: string };
    } catch {
      return;
    }
    if (parsed.type !== "loan_calculate") return;

    countRef.current += 1;
    if (countRef.current % THRESHOLD !== 0) return;
    if (busyRef.current) return;

    busyRef.current = true;
    const ad = InterstitialAd.createForAdRequest(interstitialUnitId(), {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubs: Array<() => void> = [];
    let cleaned = false;

    const safeCleanup = () => {
      if (cleaned) return;
      cleaned = true;
      unsubs.forEach((u) => u());
    };

    unsubs.push(
      ad.addAdEventListener(AdEventType.LOADED, () => {
        ad
          .show()
          .catch(() => {
            busyRef.current = false;
            safeCleanup();
          });
      })
    );
    unsubs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        busyRef.current = false;
        safeCleanup();
      })
    );
    unsubs.push(
      ad.addAdEventListener(AdEventType.ERROR, () => {
        busyRef.current = false;
        safeCleanup();
      })
    );

    ad.load();
  }, []);

  return handleWebViewMessage;
}
