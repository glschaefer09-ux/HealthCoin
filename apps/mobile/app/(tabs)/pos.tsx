// Tab 3 — Provider QR Terminal (clinic scans patient QR to receive HLTH)
import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const COLORS = { bg: "#0a1628", surface: "#0f2027", accent: "#00d4ff", muted: "#64748b", text: "#e2e8f0", border: "#1e3a4a", success: "#22c55e" };

type Mode = "receive" | "scan" | "attest";

export default function PosTab() {
  const [mode, setMode]           = useState<Mode>("receive");
  const [amount, setAmount]       = useState("");
  const [patientWallet, setPatientWallet] = useState("");
  const [scanning, setScanning]   = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [lastTx, setLastTx]       = useState<string | null>(null);

  function handleQrScan(data: string) {
    setPatientWallet(data);
    setScanning(false);
  }

  function processPayment() {
    if (!amount || !patientWallet) { Alert.alert("Missing fields", "Enter amount and patient wallet."); return; }
    // In production: call hlth_staking program or direct transfer via @solana/web3.js
    setLastTx(`Payment of ${amount} HLTH received from ${patientWallet.slice(0, 8)}…`);
    setAmount("");
    setPatientWallet("");
    Alert.alert("Payment Received", `${amount} HLTH received!`);
  }

  function submitAttestation(activityType: string) {
    if (!patientWallet) { Alert.alert("Missing", "Scan or enter patient wallet first."); return; }
    // In production: call hlth_rewards program attest_activity
    Alert.alert("Attestation Sent", `Submitted ${activityType} for ${patientWallet.slice(0,8)}…\nPatient will receive HLTH rewards.`);
    setPatientWallet("");
  }

  if (scanning) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => handleQrScan(data)}
        />
        <TouchableOpacity onPress={() => setScanning(false)} style={styles.cancelScan}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Provider Terminal</Text>
      <Text style={styles.subtitle}>Receive HLTH payments from patients or submit wellness attestations.</Text>

      {/* Mode Switcher */}
      <View style={styles.modeRow}>
        {(["receive", "scan", "attest"] as Mode[]).map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            <Text style={[styles.modeBtnText, mode === m && { color: "#0a1628" }]}>
              {m === "receive" ? "💳 Receive" : m === "scan" ? "📷 Scan QR" : "✅ Attest"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Receive Payment */}
      {mode === "receive" && (
        <View>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>HLTH Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.muted}
            />
          </View>
          <TextInput
            style={styles.input}
            value={patientWallet}
            onChangeText={setPatientWallet}
            placeholder="Patient wallet address"
            placeholderTextColor={COLORS.muted}
          />
          <TouchableOpacity
            style={[styles.qrBtn]}
            onPress={async () => {
              if (!permission?.granted) await requestPermission();
              setMode("scan");
              setScanning(true);
            }}
          >
            <Text style={styles.qrBtnText}>📷 Scan Patient QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={processPayment}>
            <Text style={styles.primaryBtnText}>Request Payment</Text>
          </TouchableOpacity>
          {lastTx && (
            <View style={styles.successCard}>
              <Text style={{ color: COLORS.success, fontWeight: "700" }}>✓ {lastTx}</Text>
            </View>
          )}
        </View>
      )}

      {/* Scan QR */}
      {mode === "scan" && (
        <View>
          <Text style={{ color: COLORS.muted, marginBottom: 20 }}>
            Tap below to open camera and scan a patient's wallet QR code.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.accent, borderWidth: 1 }]}
            onPress={async () => {
              if (!permission?.granted) await requestPermission();
              setScanning(true);
            }}
          >
            <Text style={[styles.primaryBtnText, { color: COLORS.accent }]}>Open QR Scanner</Text>
          </TouchableOpacity>
          {patientWallet ? (
            <View style={styles.successCard}>
              <Text style={{ color: COLORS.text }}>Scanned: {patientWallet.slice(0, 20)}…</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Attest Activity */}
      {mode === "attest" && (
        <View>
          <Text style={{ color: COLORS.muted, marginBottom: 16 }}>
            Submit an on-chain attestation. The patient automatically receives HLTH rewards.
          </Text>
          <TextInput
            style={styles.input}
            value={patientWallet}
            onChangeText={setPatientWallet}
            placeholder="Patient wallet address"
            placeholderTextColor={COLORS.muted}
          />
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={async () => { if (!permission?.granted) await requestPermission(); setScanning(true); }}
          >
            <Text style={styles.qrBtnText}>📷 Scan Patient QR</Text>
          </TouchableOpacity>

          <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>Select activity:</Text>
          {[
            { label: "Annual Checkup",       reward: "+50 HLTH", type: "checkup" },
            { label: "Prescription Fill",    reward: "+25 HLTH", type: "prescription" },
            { label: "30-Day Journal Streak", reward: "+100 HLTH", type: "journal_streak" },
            { label: "Patient Referral",     reward: "+75 HLTH", type: "referral" },
          ].map(a => (
            <TouchableOpacity
              key={a.type}
              style={styles.attestCard}
              onPress={() => submitAttestation(a.label)}
            >
              <Text style={styles.attestLabel}>{a.label}</Text>
              <Text style={{ color: COLORS.success, fontWeight: "700" }}>{a.reward}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  title:          { fontSize: 24, fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  subtitle:       { color: COLORS.muted, fontSize: 13, marginBottom: 24, lineHeight: 20 },
  modeRow:        { flexDirection: "row", gap: 8, marginBottom: 28 },
  modeBtn:        { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  modeBtnActive:  { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  modeBtnText:    { color: COLORS.muted, fontSize: 13, fontWeight: "600" },
  amountCard:     { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: COLORS.accent, marginBottom: 16 },
  amountLabel:    { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  amountInput:    { fontSize: 48, fontWeight: "900", color: COLORS.accent, textAlign: "center" },
  input:          { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.text, padding: 14, fontSize: 14, marginBottom: 12 },
  qrBtn:          { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 12 },
  qrBtnText:      { color: COLORS.accent, fontWeight: "600" },
  primaryBtn:     { backgroundColor: COLORS.accent, borderRadius: 10, padding: 16, alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#0a1628", fontWeight: "800", fontSize: 16 },
  successCard:    { backgroundColor: "#064e3b", borderRadius: 10, padding: 14, marginTop: 8 },
  attestCard:     { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  attestLabel:    { color: COLORS.text, fontWeight: "600" },
  cancelScan:     { position: "absolute", bottom: 40, alignSelf: "center", backgroundColor: "rgba(0,0,0,.7)", padding: 16, borderRadius: 10 },
});
