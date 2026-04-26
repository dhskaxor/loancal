import { useEffect } from "react";
import { ensureAdsenseScript } from "./adsenseScript";

export function AdSenseLoader({ clientId }: { clientId: string }) {
  useEffect(() => {
    void ensureAdsenseScript(clientId).catch(() => {
      /* noop: 슬롯에서 동일 Promise 재시도 */
    });
  }, [clientId]);
  return null;
}
