import { useEffect } from "react";
import { Linking, Platform, StyleSheet } from "react-native";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";
import { getWebUrl } from "./src/adConfig";
import { useInterstitialOnLoanCalculate } from "./src/useInterstitialOnLoanCalculate";

function isLoanVariant(): boolean {
  const id = Constants.expoConfig?.extra?.variantId;
  return id === undefined || id === null || id === "loan";
}

function AppContent() {
  const webUrl = getWebUrl();
  const onLoanMessage = useInterstitialOnLoanCalculate();
  const loanVariant = isLoanVariant();

  const onMessage = loanVariant
    ? (e: WebViewMessageEvent) => onLoanMessage(e.nativeEvent.data)
    : undefined;

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
    ...(onMessage ? { onMessage } : {}),
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
});
