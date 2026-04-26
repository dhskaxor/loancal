import { useEffect } from "react";

const SCRIPT_ID = "loancal-adsense-script";

export function AdSenseLoader({ clientId }: { clientId: string }) {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }, [clientId]);
  return null;
}
