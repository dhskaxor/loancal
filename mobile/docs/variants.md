# 모바일 앱 변형(variant)

동일 코드베이스로 **대출(loan)** / **로또(lotto)** 등 여러 스토어 앱을 빌드할 때, 빌드 시 환경 변수로 변형을 고릅니다.

## 변형 ID

| `EXPO_PUBLIC_APP_VARIANT` | Android 패키지              | 기본 프로덕션 Web URL                          |
| ------------------------- | --------------------------- | --------------------------------------------- |
| 미설정 또는 `loan`        | `com.sunwoo.loancal`        | `https://loancal-sigma.vercel.app`            |
| `lotto`                   | `com.sunwoo.loancal.lotto`  | `https://loancal-sigma.vercel.app/lotto`      |

메타데이터 원천: [variants.json](../variants.json) + [src/variantManifest.ts](../src/variantManifest.ts) + [config/resolveVariant.js](../config/resolveVariant.js).

## EAS Build 프로필

| 프로필               | 용도                          |
| -------------------- | ----------------------------- |
| `production-loan`    | 대출 앱(명시적으로 loan 고정) |
| `production-lotto` | 로또 앱                       |

예:

```bash
eas build --profile production-loan --platform android
eas build --profile production-lotto --platform android
```

## 자주 쓰는 환경 변수

- **`EXPO_PUBLIC_APP_VARIANT`**: `loan` \| `lotto`
- **`EXPO_PUBLIC_WEB_URL`**: WebView URL 강제 지정(미설정 시 변형별 기본 프로덕션 URL)
- **`EXPO_PUBLIC_WEB_ORIGIN`**: 프로덕션 origin만 바꿀 때(기본 `https://loancal-sigma.vercel.app`)
- **`EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`**, **`EXPO_PUBLIC_ADMOB_IOS_APP_ID`**: AdMob **앱** ID(미설정 시 Google 테스트 앱 ID)
- 기존 배너·전면 **광고 단위** ID: `EXPO_PUBLIC_ADMOB_BANNER_*`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL` 등 ([src/adConfig.ts](../src/adConfig.ts))

로컬에서 로또 웹을 띄울 때는 예: `EXPO_PUBLIC_WEB_URL=http://10.0.2.2:5173/lotto` (Android 에뮬레이터).

## 런타임

`app.config.ts`의 `extra.variantId`로 현재 변형을 노출합니다. 전면 광고(`loan_calculate` 메시지)는 **loan** 변형에서만 연결됩니다.
