// Tab 1 — Health Space WebView
import { WebView } from "react-native-webview";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

const HEALTH_SPACE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"   // Android emulator loopback
    : "http://localhost:3000";  // iOS simulator / physical device (use LAN IP in prod)

export default function CommunityTab() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        source={{ uri: HEALTH_SPACE_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  webview:   { flex: 1 },
});
