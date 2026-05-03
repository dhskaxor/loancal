/**
 * 앱 변형 메타데이터. 정적 필드는 [variants.json](../variants.json), 변형 ID 해석은 [config/resolveVariant.js](../config/resolveVariant.js) 와 공유합니다.
 */

import { resolveVariantId } from "../config/resolveVariant.js";
import rawVariants from "../variants.json";

export type VariantId = "loan" | "lotto";

export type VariantNativeConfig = (typeof rawVariants)["loan"];

export const VARIANTS = rawVariants as Record<VariantId, VariantNativeConfig>;

export { resolveVariantId };

export const DEFAULT_PRODUCTION_WEB_ORIGIN =
  process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim() ||
  "https://loancal-sigma.vercel.app";

/** Google 테스트 앱 ID(변형별 실제 값은 EAS env 로 주입). */
export const DEFAULT_ADMOB_TEST_ANDROID_APP_ID =
  "ca-app-pub-3940256099942544~3347511713";
export const DEFAULT_ADMOB_TEST_IOS_APP_ID =
  "ca-app-pub-3940256099942544~1458002511";

export function getActiveVariant(): VariantNativeConfig {
  return VARIANTS[resolveVariantId() as VariantId];
}

export function variantWebPath(variantId: VariantId = resolveVariantId() as VariantId): string {
  return VARIANTS[variantId].webPath;
}

/** 프로덕션 기본 웹 루트 URL(origin + 변형별 path). */
export function defaultProductionWebUrl(): string {
  const origin = DEFAULT_PRODUCTION_WEB_ORIGIN.replace(/\/+$/, "");
  const path = variantWebPath();
  if (!path) return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
