# 대출 계산기 (웹 + React Native WebView)

브라우저에서는 **AdSense**, 앱에서는 **AdMob** 배너(상·중·하)와 **전면 광고**(계산하기 4·8·12회째)를 사용합니다. 앱 WebView 안에서는 AdSense를 넣지 않습니다(정책 준수).

## 구조

- [`web/`](web/) — Vite + React 대출 계산기(원리금균등). `계산하기` 클릭 시 `ReactNativeWebView.postMessage`로 `{ "type": "loan_calculate" }` 전송.
- [`mobile/`](mobile/) — Expo + WebView + `react-native-google-mobile-ads`.

## 웹 로컬 실행

```bash
cd web
npm install
npm run dev
```

기본: `http://localhost:5173` (또는 터미널에 표시된 URL).

### 배포 URL(SEO)

프로덕션 빌드 시 사이트 주소는 [`web/.env.production`](web/.env.production)의 **`https://loancal-sigma.vercel.app`** 가 사용됩니다(canonical, Open Graph, sitemap).

### AdSense (브라우저만)

[`web/.env.example`](web/.env.example)을 복사해 `web/.env`로 두고 `VITE_ADSENSE_*` 값을 채웁니다. 값이 모두 있을 때만 상·중·하 슬롯과 스크립트가 로드됩니다.

## 모바일 로컬 실행

AdMob 네이티브 모듈은 **Expo Go가 아닌 개발 빌드**(prebuild 후 `expo run:android` / `expo run:ios` 또는 EAS Build)가 필요합니다.

1. 웹을 먼저 띄운 뒤(`npm run dev`), 에뮬레이터 기본 주소는 코드에서 `http://10.0.2.2:5173`(Android) / `http://localhost:5173`(iOS)로 잡습니다.
2. 배포 웹 주소는 **`https://loancal-sigma.vercel.app`** 로 맞춰 두었습니다. 로컬만 쓰려면 [`mobile/.env.example`](mobile/.env.example)처럼 `EXPO_PUBLIC_WEB_URL`을 비우거나 덮어쓰면 됩니다.

```bash
cd mobile
npm install
npx expo prebuild
npx expo run:android
```

### 환경 변수

[`mobile/.env.example`](mobile/.env.example) 참고.

- `EXPO_PUBLIC_WEB_URL`: 배포 웹 URL. 미설정 시 변형별 기본 URL은 [`mobile/src/variantManifest.ts`](mobile/src/variantManifest.ts) 및 [`mobile/variants.json`](mobile/variants.json)을 따릅니다 ([`mobile/.env.production`](mobile/.env.production), [`mobile/src/adConfig.ts`](mobile/src/adConfig.ts)).
- `EXPO_PUBLIC_APP_VARIANT`: `loan`(기본) 또는 `lotto` 등 — [`mobile/docs/variants.md`](mobile/docs/variants.md) 참고.
- `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false`로 두면 아래 배너·전면 단위 ID가 사용됩니다(비어 있으면 여전히 Google 테스트 ID).
- 상용 빌드 전 `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` / `EXPO_PUBLIC_ADMOB_IOS_APP_ID`(또는 [`mobile/app.config.js`](mobile/app.config.js) 기본값)를 AdMob 콘솔의 본인 **앱** ID로 바꾸세요. 미설정 시 Google 샘플 앱 ID입니다.

### Android HTTP(로컬 Vite)

로컬 `http://` 웹을 띄우기 위해 [`mobile/app.config.js`](mobile/app.config.js)의 Android 설정에 `usesCleartextTraffic: true`가 들어 있습니다. 스토어 배포 시에는 HTTPS `EXPO_PUBLIC_WEB_URL`만 쓰고, 필요하면 cleartext를 끄는 편이 좋습니다.

## 전면 광고 동작

앱에서 웹이 보낸 `loan_calculate` 메시지를 누적 집계하고, **4의 배수**(4, 8, 12…)마다 전면 광고를 요청합니다. 이미 로드·표시 중이면 같은 구간의 중복 요청은 무시합니다.

## 테스트 광고

모바일은 기본적으로 Google **테스트** 배너/전면 단위를 사용합니다. `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false`와 실제 단위 ID로 전환하세요.
