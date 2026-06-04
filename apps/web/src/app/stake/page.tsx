"use client";
import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getStakingPoolPda, getStakeAccountPda, fetchPoolData, fetchStakeAccount, estimateApy, HLTH_MINT } from "@healthcoin/wallet-core";
import { useWallet } from "@/hooks/useWallet";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";
const conn = new Connection(RPC, "confirmed");

export default function StakePage() {
  const { publicKey, connected } = useWallet();
  const [poolData, setPoolData]   = useState<{ totalStaked: number } | null>(null);
  const [stakeData, setStakeData] = useState<{ amount: number; pendingRewards: number; hasBadge: boolean } | null>(null);
  const [amount, setAmount]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [poolType, setPoolType]   = useState<"Patient" | "Provider">("Patient");

  useEffect(() => {
    const [poolPda] = getStakingPoolPda(HLTH_MINT);
    fetchPoolData(conn, poolPda).then(setPoolData);
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    const [poolPda] = getStakingPoolPda(HLTH_MINT);
    const [stakeAccountPda] = getStakeAccountPda(poolPda, publicKey!);
    fetchStakeAccount(conn, stakeAccountPda).then(setStakeData);
  }, [publicKey]);

  const estimatedYield = stakeData ? estimateApy(stakeData.amount) : 0;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
        Stake <span style={{ color: "var(--accent)" }}>HLTH</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 40 }}>
        Patients earn 12% APY. Providers stake 10,000 HLTH to unlock a verified badge.
      </p>

      {/* Pool Stats */}
      <div className="card" style={{ marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <div className="stat">
          <div className="stat-value">{poolData ? poolData.totalStaked.toLocaleString() : "—"}</div>
          <div className="stat-label">Total Staked (HLTH)</div>
        </div>
        <div className="stat">
          <div className="stat-value">12%</div>
          <div className="stat-label">Patient APY</div>
        </div>
        <div className="stat">
          <div className="stat-value">10,000</div>
          <div className="stat-label">Provider Badge Min</div>
        </div>
      </div>

      {/* Pool Type Selector */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {(["Patient", "Provider"] as const).map(t => (
          <button
            key={t}
            className={`btn ${poolType === t ? "btn-primary" : "btn-outline"}`}
            onClick={() => setPoolType(t)}
          >
            {t === "Patient" ? "🏥 Patient Pool" : "🏥 Provider Pool"}
          </button>
        ))}
      </div>

      {/* User Position */}
      {connected && stakeData && (
        <div className="card" style={{ marginBottom: 32, borderColor: "var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Your Position</h3>
            {stakeData.hasBadge && <span className="badge badge-verified">✓ Verified Provider</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="stat">
              <div className="stat-value">{stakeData.amount.toLocaleString()}</div>
              <div className="stat-label">Staked HLTH</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stakeData.pendingRewards.toFixed(4)}</div>
              <div className="stat-label">Pending Rewards</div>
            </div>
            <div className="stat">
              <div className="stat-value">{estimatedYield.toLocaleString()}</div>
              <div className="stat-label">Est. Annual Yield</div>
            </div>
          </div>
        </div>
      )}

      {/* Stake Form */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
          {connected ? "Stake / Unstake" : "Connect wallet to stake"}
        </h3>
        {connected ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, color: "var(--muted)", fontSize: 13 }}>Amount (HLTH)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading || !amount}
                onClick={() => alert("Stake tx — wire to hlth_staking program")}
              >
                Stake HLTH
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                disabled={loading || !amount}
                onClick={() => alert("Unstake tx — wire to hlth_staking program")}
              >
                Unstake
              </button>
            </div>
            {stakeData && stakeData.pendingRewards > 0 && (
              <button
                className="btn btn-primary"
                style={{ marginTop: 12, width: "100%", background: "var(--success)" }}
                onClick={() => alert("Claim rewards tx")}
              >
                Claim {stakeData.pendingRewards.toFixed(4)} HLTH Rewards
              </button>
            )}
          </>
        ) : (
          <WalletMultiButton />
        )}
      </div>

      {poolType === "Provider" && (
        <div className="card" style={{ marginTop: 20, borderColor: "#7c3aed" }}>
          <h4 style={{ fontWeight: 700, marginBottom: 8, color: "#a78bfa" }}>Provider Verification Badge</h4>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Stake a minimum of 10,000 HLTH in the Provider Pool to receive an on-chain verified badge.
            Displayed on your Health Space profile and on all ad slots you purchase.
          </p>
        </div>
      )}
    </div>
  );
}
