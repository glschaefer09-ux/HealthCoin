// Solana Wallet Adapter — no API key, no account required
// Wallets are auto-detected from the browser (Phantom, Backpack, Solflare, etc.)
import { clusterApiUrl } from "@solana/web3.js";

export const SOLANA_NETWORK = "devnet" as const;
export const SOLANA_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl("devnet");
