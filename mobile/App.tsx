import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import mobileAds, {
  BannerAd,
  BannerAdSize,
  MaxAdContentRating,
} from "react-native-google-mobile-ads";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import { bannerUnitId, getWebUrl } from "./src/adConfig";
import { useInterstitialOnLoanCalculate } from "./src/useInterstitialOnLoanCalculate";

export default function App() {
  const webUrl = getWebUrl();
  const onLoanMessage = useInterstitialOnLoanCalculate();

  const onMessage = (e: WebViewMessageEvent) =>
    onLoanMessage(e.nativeEvent.data);

  const webViewCommon = {
    source: { uri: webUrl },
    style: styles.webview,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    setSupportMultipleWindows: false,
    originWhitelist: ["*"],
    onMessage,
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
      });
      if (!cancelled) {
        await mobileAds().initialize();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.bannerWrap}>
          <BannerAd
            unitId={bannerUnitId("top")}
            size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
        {Platform.OS === "android" ? (
          <WebView {...webViewCommon} mixedContentMode="always" />
        ) : (
          <WebView {...webViewCommon} />
        )}
        <View style={styles.bannerWrap}>
          <BannerAd
            unitId={bannerUnitId("mid")}
            size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
        <View style={styles.bannerWrap}>
          <BannerAd
            unitId={bannerUnitId("bottom")}
            size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bannerWrap: {
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
});
