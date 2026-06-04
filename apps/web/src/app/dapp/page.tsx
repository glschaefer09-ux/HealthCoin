import Link from "next/link";

const stats = [
  { label: "Token Supply",   value: "1,000,000,000 HLTH" },
  { label: "Transfer Fee",   value: "1% → Treasury" },
  { label: "Patient APY",    value: "12%" },
  { label: "Decimals",       value: "9" },
  { label: "Network",        value: "Solana Devnet" },
  { label: "Bridge",         value: "Wormhole" },
];

const ecosystem = [
  { icon: "🏥", title: "Clinics & Hospitals",    desc: "Accept HLTH via NFC POS terminals. No card fees, no chargebacks." },
  { icon: "💊", title: "Pharmacies",             desc: "Attest prescription fills on-chain — patients earn HLTH automatically." },
  { icon: "🧠", title: "Mental Health",          desc: "Telehealth and in-person providers verified by staking HLTH." },
  { icon: "🏋️", title: "Gyms & Fitness",        desc: "Reward members for consistency. Gamify wellness." },
  { icon: "📱", title: "Telehealth Platforms",  desc: "Coming soon — DTC telehealth via HLTH payment rails." },
  { icon: "👥", title: "Community",             desc: "Health Space: social feed, journals, ambassador tiers." },
];

export default function DappPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚕</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1 }}>
          HealthCoin <span style={{ color: "var(--accent)" }}>HLTH</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 18, maxWidth: 560, margin: "16px auto 32px" }}>
          The Solana-native token ecosystem for healthcare payments, provider advertising,
          and patient wellness rewards.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/stake"    className="btn btn-primary">Stake HLTH</Link>
          <Link href="/provider" className="btn btn-outline">Provider Portal</Link>
          <Link href="/ads"      className="btn btn-outline">Buy Ad Slot</Link>
        </div>
      </div>

      {/* Token Stats */}
      <div className="card" style={{ marginBottom: 48 }}>
        <h2 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Token Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
          {stats.map(s => (
            <div key={s.label} className="stat">
              <div className="stat-value" style={{ fontSize: 18 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem */}
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Ecosystem Partners</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {ecosystem.map(e => (
          <div key={e.title} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 32 }}>{e.icon}</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{e.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            ["1", "Connect Wallet",      "Phantom, Backpack, or Solflare. No seed phrase drama — Reown AppKit handles it."],
            ["2", "Earn or Buy HLTH",    "Patients earn HLTH for checkups, prescriptions, journal streaks, and referrals."],
            ["3", "Spend or Stake",      "Pay at any HLTH-enabled clinic. Or stake for 12% APY and governance rights."],
            ["4", "Providers Advertise", "Buy on-chain ad slots in your category at 80%+ lower cost than Google Ads."],
          ].map(([n, t, d]) => (
            <div key={n} className="card">
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)", marginBottom: 12 }}>{n}</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{t}</div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 64 }}>
        HealthCoin is not a substitute for health insurance. Not financial advice.
      </p>
    </div>
  );
}
