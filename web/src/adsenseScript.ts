const SCRIPT_ID = "loancal-adsense-script";

let loadPromise: Promise<void> | null = null;
let loadedClientId: string | null = null;

/**
 * adsbygoogle.js 한 번만 로드하고, 로드 완료 후 resolve.
 * 여러 AdSenseSlot이 동시에 기다려도 스크립트는 한 번만 주입됩니다.
 */
export function ensureAdsenseScript(clientId: string): Promise<void> {
  const id = clientId.trim();
  if (!id) {
    return Promise.reject(new Error("AdSense clientId is empty"));
  }

  if (loadPromise && loadedClientId === id) {
    return loadPromise;
  }

  if (loadPromise && loadedClientId !== id) {
    loadPromise = null;
    loadedClientId = null;
  }

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      loadedClientId = id;
      resolve();
    };

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
        () => reject(new Error("AdSense script failed")),
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
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(id)}`;
    s.crossOrigin = "anonymous";
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
      () => reject(new Error("AdSense script failed")),
      { once: true }
    );
    document.head.appendChild(s);
  });

  return loadPromise;
}
