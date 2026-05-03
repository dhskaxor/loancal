/**
 * Node( app.config ) 와 Metro( RN 번들 ) 양쪽에서 사용할 수 있도록 CommonJS 로 둡니다.
 */
function resolveVariantId() {
  const raw = process.env.EXPO_PUBLIC_APP_VARIANT?.trim().toLowerCase();
  if (raw === "lotto") return "lotto";
  return "loan";
}

module.exports = { resolveVariantId };
