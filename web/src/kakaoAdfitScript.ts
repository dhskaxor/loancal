const SCRIPT_ID = "loancal-kakao-adfit-script";
const SCRIPT_SRC = "https://t1.kakaocdn.net/kas/static/ba.min.js";

let loadPromise: Promise<void> | null = null;

/**
 * 카카오 애드핏 ba.min.js 한 번만 로드.
 * 여러 KakaoAdFitSlot이 동시에 기다려도 스크립트는 한 번만 주입됩니다.
 */
export function ensureKakaoAdfitScript(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => resolve();

    const existing = document.getElementById(SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (existing) {
      const ready = existing.dataset.loancalReady === "1";
      if (ready) {
        finish();
        return;
      }
      const onDone = () => {
        existing.dataset.loancalReady = "1";
        finish();
      };
      existing.addEventListener("load", onDone, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Kakao AdFit script failed")),
        { once: true }
      );
      const rs = (existing as HTMLScriptElement & { readyState?: string })
        .readyState;
      if (rs === "complete" || rs === "loaded") {
        onDone();
      }
      return;
    }

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.type = "text/javascript";
    s.async = true;
    s.src = SCRIPT_SRC;
    s.dataset.loancalReady = "0";
    s.addEventListener(
      "load",
      () => {
        s.dataset.loancalReady = "1";
        finish();
      },
      { once: true }
    );
    s.addEventListener(
      "error",
      () => reject(new Error("Kakao AdFit script failed")),
      { once: true }
    );
    document.head.appendChild(s);
  });

  return loadPromise;
}
