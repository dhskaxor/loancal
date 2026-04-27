import { useEffect } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import mobileAds, {
  BannerAd,
  BannerAdSize,
  MaxAdContentRating,
} from "react-native-google-mobile-ads";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import { bannerUnitId, getWebUrl } from "./src/adConfig";
import { useInterstitialOnLoanCalculate } from "./src/useInterstitialOnLoanCalculate";

function AppContent() {
  const webUrl = getWebUrl();
  const onLoanMessage = useInterstitialOnLoanCalculate();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onMessage = (e: WebViewMessageEvent) =>
    onLoanMessage(e.nativeEvent.data);

  const shouldOpenInExternalBrowser = (url: string): boolean =>
    url.startsWith("https://loan.pay.naver.com/n/credit");

  const onShouldStartLoadWithRequest = (request: { url: string }) => {
    if (shouldOpenInExternalBrowser(request.url)) {
      void Linking.openURL(request.url);
      return false;
    }
    return true;
  };

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
    onShouldStartLoadWithRequest,
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {Platform.OS === "android" ? (
        <WebView {...webViewCommon} mixedContentMode="always" />
      ) : (
        <WebView {...webViewCommon} />
      )}
      <View
        style={[
          styles.bannerWrap,
          {
            width: windowWidth,
            paddingBottom: Math.max(insets.bottom - 2, 0),
          },
        ]}
      >
        <BannerAd
          unitId={bannerUnitId("bottom")}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
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
    alignSelf: "stretch",
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#f1f5f9",
    minHeight: 50,
    justifyContent: "center",
  },
});
