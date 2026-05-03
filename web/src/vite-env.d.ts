/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** `kakao`(기본) | `adsense` — AdSense 승인 후 `adsense`로 전환 */
  readonly VITE_AD_PROVIDER?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT_TOP?: string;
  readonly VITE_ADSENSE_SLOT_MID?: string;
  readonly VITE_ADSENSE_SLOT_BOTTOM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    adsbygoogle?: unknown[];
    /** 카카오 애드핏: 동적 삽입 후 재스캔 시 호출 */
    kakao_adfit?: () => void;
  }
}

export {};
