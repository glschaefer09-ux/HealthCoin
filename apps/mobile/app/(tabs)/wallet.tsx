// Tab 2 — Native NFC Wallet (tap-to-pay at clinic POS terminals)
import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import * as Clipboard from "expo-clipboard";

const COLORS = { bg: "#0a1628", surface: "#0f2027", accent: "#00d4ff", muted: "#64748b", text: "#e2e8f0", border: "#1e3a4a", success: "#22c55e" };

// Demo wallet state — replace with real Reown AppKit / @solana/web3.js integration
const DEMO_WALLET = {
  address: "HLTHdemo11111111111111111111111111111111111",
  balance: 1250.75,
  transactions: [
    { id: 1, type: "earn",    label: "Checkup Reward",       amount: +50,  date: "2026-05-28" },
    { id: 2, type: "earn",    label: "Referral Bonus",        amount: +75,  date: "2026-05-20" },
    { id: 3, type: "spend",   label: "Green Valley Clinic",   amount: -120, date: "2026-05-15" },
    { id: 4, type: "earn",    label: "Prescription Reward",   amount: +25,  date: "2026-05-10" },
    { id: 5, type: "spend",   label: "PeakFit Gym — Monthly", amount: -200, date: "2026-05-01" },
  ],
};

export default function WalletTab() {
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcActive, setNfcActive]       = useState(false);
  const [sendAmount, setSendAmount]     = useState("");

  useEffect(() => {
    NfcManager.isSupported().then(setNfcSupported).catch(() => setNfcSupported(false));
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  async function tapToPay() {
    if (!nfcSupported) {
      Alert.alert("NFC Not Available", "Your device does not support NFC payments.");
      return;
    }
    setNfcActive(true);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // In production: write HLTH payment payload to NFC tag / POS terminal
      const tag = await NfcManager.getTag();
      Alert.alert("Payment Sent", `HLTH payment transmitted to terminal.\nTag ID: ${JSON.stringify(tag?.id)}`);
    } catch (ex) {
      Alert.alert("NFC Error", String(ex));
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setNfcActive(false);
    }
  }

  async function copyAddress() {
    await Clipboard.setStringAsync(DEMO_WALLET.address);
    Alert.alert("Copied", "Wallet address copied to clipboard.");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>HLTH Balance</Text>
        <Text style={styles.balanceValue}>{DEMO_WALLET.balance.toLocaleString()}</Text>
        <Text style={styles.balanceSub}>HealthCoin • Solana Devnet</Text>
        <TouchableOpacity onPress={copyAddress} style={styles.addressRow}>
          <Text style={styles.address} numberOfLines={1}>
            {DEMO_WALLET.address.slice(0, 16)}…{DEMO_WALLET.address.slice(-8)}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}> Copy</Text>
        </TouchableOpacity>
      </View>

      {/* NFC Tap-to-Pay */}
      <TouchableOpacity
        style={[styles.nfcBtn, nfcActive && { opacity: 0.6 }]}
        onPress={tapToPay}
        disabled={nfcActive}
        activeOpacity={0.8}
      >
        <Text style={styles.nfcIcon}>{nfcActive ? "📡" : "📲"}</Text>
        <Text style={styles.nfcText}>{nfcActive ? "Hold near terminal…" : "Tap to Pay"}</Text>
        <Text style={styles.nfcSub}>Hold phone near clinic NFC terminal</Text>
      </TouchableOpacity>

      {nfcSupported === false && Platform.OS !== "ios" && (
        <View style={styles.warningCard}>
          <Text style={{ color: "#fcd34d" }}>NFC not supported on this device. Use QR code payments instead.</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Stake", "Opens stake page")}>
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionLabel}>Stake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Send", "Coming soon")}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Bridge", "Opens bridge page")}>
          <Text style={styles.actionIcon}>🌉</Text>
          <Text style={styles.actionLabel}>Bridge</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {DEMO_WALLET.transactions.map(tx => (
        <View key={tx.id} style={styles.txRow}>
          <View>
            <Text style={styles.txLabel}>{tx.label}</Text>
            <Text style={styles.txDate}>{tx.date}</Text>
          </View>
          <Text style={[styles.txAmount, { color: tx.amount > 0 ? COLORS.success : "#f87171" }]}>
            {tx.amount > 0 ? "+" : ""}{tx.amount} HLTH
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  balanceCard:  { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, marginBottom: 20, alignItems: "center", borderWidth: 1, borderColor: COLORS.accent },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  balanceValue: { fontSize: 48, fontWeight: "900", color: COLORS.accent },
  balanceSub:   { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  addressRow:   { flexDirection: "row", alignItems: "center", marginTop: 12 },
  address:      { color: COLORS.muted, fontSize: 12, fontFamily: "monospace" },
  nfcBtn:       { backgroundColor: COLORS.accent, borderRadius: 16, padding: 28, alignItems: "center", marginBottom: 20 },
  nfcIcon:      { fontSize: 40, marginBottom: 8 },
  nfcText:      { fontSize: 20, fontWeight: "800", color: "#0a1628" },
  nfcSub:       { fontSize: 12, color: "#0a1628", marginTop: 4, opacity: 0.7 },
  warningCard:  { backgroundColor: "#1a1200", borderWidth: 1, borderColor: "#78350f", borderRadius: 10, padding: 14, marginBottom: 16 },
  actionsRow:   { flexDirection: "row", gap: 12, marginBottom: 28 },
  actionBtn:    { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  actionIcon:   { fontSize: 24, marginBottom: 4 },
  actionLabel:  { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  txRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  txLabel:      { color: COLORS.text, fontWeight: "600" },
  txDate:       { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  txAmount:     { fontWeight: "700", fontSize: 15 },
});
