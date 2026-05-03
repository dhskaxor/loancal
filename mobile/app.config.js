const { resolveVariantId } = require("./config/resolveVariant.js");
const variants = require("./variants.json");

module.exports = ({ config }) => {
  const variantId = resolveVariantId();
  const v = variants[variantId];

  const androidAdmobAppId =
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() ||
    "ca-app-pub-3940256099942544~3347511713";
  const iosAdmobAppId =
    process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() ||
    "ca-app-pub-3940256099942544~1458002511";

  return {
    ...config,
    name: v.displayName,
    slug: v.slug,
    version: "1.0.1",
    orientation: "portrait",
    icon: v.icon,
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: v.splashImage,
      resizeMode: "contain",
      backgroundColor: v.splashBackgroundColor,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: v.iosBundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: v.adaptiveIconForeground,
        backgroundColor: v.adaptiveIconBackground,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
      package: v.androidPackage,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: androidAdmobAppId,
          iosAppId: iosAdmobAppId,
        },
      ],
    ],
    extra: {
      variantId,
    },
  };
};
