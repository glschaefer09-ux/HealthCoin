/**
 * Creates the HLTH Token-2022 mint on Solana devnet.
 * Outputs the mint address for use in .env
 * Run: npx ts-node scripts/create-mint.ts
 */
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { createHlthMint, getHlthTokenAccount } from "../packages/wallet-core/src/token";
import fs from "fs";
import os from "os";

async function main() {
  const keypairPath = `${os.homedir()}/.solana/keypairs/healthcoin-devnet/deployer.json`;
  const raw     = fs.readFileSync(keypairPath, "utf8");
  const payer   = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  console.log("Creating HLTH mint on devnet…");
  const mint = await createHlthMint(connection, payer, payer.publicKey, null);
  console.log(`MINT: ${mint.toBase58()}`);

  // Create treasury ATA and mint initial supply
  const { address: treasuryAta } = await getHlthTokenAccount(connection, payer, payer.publicKey, mint);
  const { mintTo, TOKEN_2022_PROGRAM_ID } = await import("@solana/spl-token");
  const SUPPLY = 1_000_000_000n * 1_000_000_000n; // 1B * 10^9
  await mintTo(connection, payer, mint, treasuryAta, payer, SUPPLY, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
  console.log(`Minted 1,000,000,000 HLTH to treasury: ${treasuryAta.toBase58()}`);
}

main().catch(console.error);
