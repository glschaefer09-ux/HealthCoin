"use client";
import { useState } from "react";
import { AD_SLOT_PRICES } from "@healthcoin/wallet-core";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@/hooks/useWallet";

const CATEGORIES = ["Primary Care", "Dental", "Mental Health", "Pharmacy", "Fitness", "Telehealth"];

const SAMPLE_ADS = [
  { category: "Mental Health", title: "Calm Mind Counseling", desc: "Sliding-scale therapy. First session free for HLTH holders.", active: true },
  { category: "Fitness",       title: "PeakFit Gym",          desc: "Pay with HLTH. 3-month membership at 20% off.",            active: true },
  { category: "Pharmacy",      title: "GreenLeaf Pharmacy",   desc: "Earn double HLTH on generic prescriptions this month.",     active: true },
];

export default function AdsPage() {
  const { connected } = useWallet();
  const [tab, setTab]         = useState<"browse" | "buy">("browse");
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm]       = useState({ title: "", desc: "", url: "", category: "", duration: "7" });

  const filtered = activeCategory === "All" ? SAMPLE_ADS : SAMPLE_ADS.filter(a => a.category === activeCategory);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
        Ad <span style={{ color: "var(--accent)" }}>Marketplace</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>
        Healthcare providers buy on-chain ad slots with HLTH — no Google, no middleman. 80%+ cheaper than traditional directories.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button className={`btn ${tab === "browse" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("browse")}>Browse Ads</button>
        <button className={`btn ${tab === "buy" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("buy")}>Buy a Slot</button>
      </div>

      {tab === "browse" && (
        <>
          {/* Category Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {["All", ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: `1px solid ${activeCategory === c ? "var(--accent)" : "var(--border)"}`,
                  background: activeCategory === c ? "var(--accent)" : "transparent",
                  color: activeCategory === c ? "#0a1628" : "var(--muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeCategory === c ? 700 : 400,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map(ad => (
              <div key={ad.title} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{ad.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{ad.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{ad.desc}</div>
                </div>
                <button className="btn btn-outline" style={{ whiteSpace: "nowrap", marginLeft: 16 }}>
                  Learn More
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card" style={{ textAlign: "center", color: "var(--muted)", padding: 48 }}>
                No ads in this category yet. <a href="#" onClick={() => setTab("buy")}>Be the first!</a>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "buy" && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 24 }}>Purchase Ad Slot</h3>

          {/* Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {([7, 30] as const).map(d => (
              <div
                key={d}
                className="card"
                style={{
                  background: form.duration === String(d) ? "#0d2d3d" : "#0a1628",
                  borderColor: form.duration === String(d) ? "var(--accent)" : "var(--border)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onClick={() => setForm({ ...form, duration: String(d) })}
              >
                <div style={{ fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{AD_SLOT_PRICES[d]} HLTH</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>{d}-day slot</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Ad Title (max 80 chars)</label>
              <input maxLength={80} placeholder="Your Practice Name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Description (max 280 chars)</label>
              <textarea maxLength={280} rows={3} placeholder="What makes your practice special?" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>CTA URL</label>
                <input type="url" placeholder="https://yoursite.com" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              </div>
            </div>

            <div className="card" style={{ background: "#0a1628", borderColor: "#1e3a4a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--muted)" }}>Slot cost</span>
                <strong>{AD_SLOT_PRICES[Number(form.duration) as 7 | 30] ?? "—"} HLTH</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 8 }}>
                <span style={{ color: "var(--muted)" }}>vs. Google Ads equivalent</span>
                <span style={{ color: "var(--muted)", textDecoration: "line-through" }}>~$2,000</span>
              </div>
            </div>

            {connected ? (
              <button
                className="btn btn-primary"
                disabled={!form.title || !form.category}
                onClick={() => alert("buy_ad_slot tx — wire to hlth_adpool program")}
              >
                Purchase Slot ({form.duration} days)
              </button>
            ) : (
              <>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>Connect wallet to purchase:</p>
                <WalletMultiButton />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
