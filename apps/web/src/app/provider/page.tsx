"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const CATEGORIES = ["Primary Care", "Dental", "Mental Health", "Pharmacy", "Fitness", "Telehealth"];
const PROVIDER_TYPES = ["Clinic / Hospital", "Pharmacy", "Mental Health Practice", "Gym / Fitness Studio", "Telehealth Platform", "Other"];

export default function ProviderPage() {
  const { connected } = useWallet();
  const [tab, setTab] = useState<"onboard" | "dashboard">("onboard");
  const [form, setForm] = useState({
    name: "", type: "", category: "", address: "", npi: "", website: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
        Provider <span style={{ color: "var(--accent)" }}>Portal</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>
        Register your clinic, pharmacy, or wellness practice. Accept HLTH payments and buy ad slots at 80%+ lower cost than traditional directories.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button className={`btn ${tab === "onboard" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("onboard")}>
          Onboard
        </button>
        <button className={`btn ${tab === "dashboard" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("dashboard")}>
          Dashboard
        </button>
      </div>

      {tab === "onboard" && (
        submitted ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Application Submitted</h2>
            <p style={{ color: "var(--muted)" }}>
              Stake 10,000 HLTH on the <a href="/stake">Stake page</a> to unlock your verified badge.
              Your profile will appear in Health Space within 24 hours.
            </p>
          </div>
        ) : (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 24 }}>Register Your Practice</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Practice Name</label>
                <input required placeholder="Green Valley Family Medicine" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Provider Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                    <option value="">Select…</option>
                    {PROVIDER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Ad Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Practice Address</label>
                <input placeholder="123 Main St, Chicago, IL 60601" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>NPI Number (optional)</label>
                  <input placeholder="1234567890" value={form.npi} onChange={e => setForm({ ...form, npi: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>Website</label>
                  <input type="url" placeholder="https://yourpractice.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>

              <div className="card" style={{ background: "#0a1628", borderColor: "#7c3aed" }}>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  <strong style={{ color: "#a78bfa" }}>Verification Badge:</strong> Stake 10,000 HLTH after registering to receive an on-chain verified badge.
                  This badge appears on your Health Space profile and all ad slots.
                </p>
              </div>

              {connected ? (
                <button type="submit" className="btn btn-primary">Submit Application</button>
              ) : (
                <div>
                  <p style={{ color: "var(--muted)", marginBottom: 12, fontSize: 14 }}>Connect wallet to submit:</p>
                  <WalletMultiButton />
                </div>
              )}
            </form>
          </div>
        )
      )}

      {tab === "dashboard" && (
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { label: "HLTH Received", value: "0.00" },
              { label: "Active Ad Slots", value: "0" },
              { label: "Attestations Sent", value: "0" },
            ].map(s => (
              <div key={s.label} className="card stat">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Attest Patient Activity</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
              Submit an on-chain attestation when a patient completes a checkup or fills a prescription.
              They automatically receive HLTH rewards.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Patient wallet address" />
              <select>
                <option>Checkup (+50 HLTH)</option>
                <option>Prescription Fill (+25 HLTH)</option>
                <option>Referral (+75 HLTH)</option>
              </select>
              <button className="btn btn-primary" onClick={() => alert("Attest tx — wire to hlth_rewards program")}>
                Submit Attestation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
