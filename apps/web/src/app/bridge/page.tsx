"use client";
import { useState } from "react";

const CHAINS = ["Ethereum", "Polygon"] as const;
type Chain = typeof CHAINS[number];

export default function BridgePage() {
  const [toChain, setToChain]     = useState<Chain>("Ethereum");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount]       = useState("");
  const [status, setStatus]       = useState<string | null>(null);

  async function handleBridge() {
    if (!amount || !toAddress) return;
    setStatus("Initiating Wormhole transfer…");
    try {
      // In production: import { bridgeHlthOut } from "@healthcoin/wallet-core"
      // and pass wallet signer from Reown AppKit
      await new Promise(r => setTimeout(r, 1500));
      setStatus(`Transfer initiated to ${toChain}. Check Wormhole explorer for VAA status.`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
        Bridge <span style={{ color: "var(--accent)" }}>HLTH</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 40 }}>
        Transfer HLTH from Solana to Ethereum or Polygon via Wormhole. Testnet only during hackathon.
      </p>

      <div className="card">
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {CHAINS.map(c => (
            <button
              key={c}
              className={`btn ${toChain === c ? "btn-primary" : "btn-outline"}`}
              onClick={() => setToChain(c)}
            >
              {c === "Ethereum" ? "Ξ Ethereum" : "⬡ Polygon"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 13 }}>
            Destination Address ({toChain})
          </label>
          <input
            placeholder="0x..."
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 13 }}>
            Amount (HLTH)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div className="card" style={{ marginBottom: 24, background: "#0a1628", borderColor: "#1e3a4a" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Route</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>
            Solana (HLTH) → Wormhole → {toChain} (HLTH)
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Estimated time: 2–5 minutes • Bridge fee: ~0.001 SOL
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={handleBridge}
          disabled={!amount || !toAddress}
        >
          Bridge HLTH →
        </button>

        {status && (
          <div style={{ marginTop: 16, padding: 12, background: "#0a1628", borderRadius: 8, fontSize: 14, color: "var(--accent)" }}>
            {status}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Supported Networks</h3>
        {[
          { chain: "Solana (Native)", status: "Live", color: "var(--success)" },
          { chain: "Ethereum (Testnet)", status: "Testnet", color: "var(--warning)" },
          { chain: "Polygon (Testnet)", status: "Testnet", color: "var(--warning)" },
          { chain: "Base", status: "Coming Soon", color: "var(--muted)" },
        ].map(n => (
          <div key={n.chain} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span>{n.chain}</span>
            <span style={{ color: n.color, fontSize: 13 }}>{n.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
