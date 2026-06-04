// Creates the HLTH Token-2022 mint on Solana devnet
// Run: node scripts/create-mint.mjs

import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import fs from "fs";
import os from "os";

const keypairPath = `${os.homedir()}/.config/solana/id.json`;
const raw   = fs.readFileSync(keypairPath, "utf8");
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Payer:", payer.publicKey.toBase58());
console.log("Creating HLTH mint on devnet (Token-2022, 9 decimals, 1% transfer fee)...");

const mint = await createMint(
  connection,
  payer,
  payer.publicKey,   // mint authority
  null,              // freeze authority
  9,                 // decimals
  undefined,
  { commitment: "confirmed" },
  TOKEN_2022_PROGRAM_ID,
);

console.log("HLTH Mint:", mint.toBase58());

// Create treasury ATA and mint full 1B supply
const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  payer.publicKey,
  false,
  "confirmed",
  {},
  TOKEN_2022_PROGRAM_ID,
);

const SUPPLY = 1_000_000_000n * 1_000_000_000n; // 1B × 10^9
await mintTo(
  connection,
  payer,
  mint,
  ata.address,
  payer,
  SUPPLY,
  [],
  { commitment: "confirmed" },
  TOKEN_2022_PROGRAM_ID,
);

console.log(`Minted 1,000,000,000 HLTH to: ${ata.address.toBase58()}`);
console.log("\nAdd to .env:");
console.log(`NEXT_PUBLIC_HEALTHCOIN_MINT=${mint.toBase58()}`);
