/**
 * AdSense `data-ad-client` 값은 보통 `ca-pub-xxxxxxxxxxxxxxxx` 형식입니다.
 * `pub-...`만 넣은 경우 자동으로 `ca-pub-...`로 맞춥니다.
 */
export function normalizePublisherId(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("ca-pub-")) return t;
  if (t.startsWith("pub-")) return `ca-${t}`;
  return t;
}

/** 슬롯은 발행자 ID(ca-pub-...)가 아니라, 광고 단위마다 부여되는 숫자 ID여야 합니다. */
export function isLikelyPublisherIdInsteadOfSlot(slot: string): boolean {
  const s = slot.trim().toLowerCase();
  return s.startsWith("ca-pub-") || s.startsWith("pub-");
}
