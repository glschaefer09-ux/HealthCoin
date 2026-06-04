import { Connection, PublicKey } from "@solana/web3.js";
import { HLTH_STAKING_PROGRAM_ID, HLTH_MINT, PATIENT_APY_PERCENT } from "./constants";

export function getStakingPoolPda(mint: PublicKey = HLTH_MINT): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), mint.toBuffer()],
    HLTH_STAKING_PROGRAM_ID,
  );
}

export function getStakeAccountPda(
  pool: PublicKey,
  owner: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), pool.toBuffer(), owner.toBuffer()],
    HLTH_STAKING_PROGRAM_ID,
  );
}

/** Compute estimated annual yield for a given staked amount (in whole HLTH) */
export function estimateApy(stakedHlth: number): number {
  return stakedHlth * (PATIENT_APY_PERCENT / 100);
}

/** Fetch live staking pool data from devnet */
export async function fetchPoolData(connection: Connection, pool: PublicKey) {
  const info = await connection.getAccountInfo(pool);
  if (!info) return null;
  // Anchor discriminator is 8 bytes, then: authority(32) mint(32) pool_type(1) total_staked(8) bump(1)
  const data = info.data;
  const totalStaked = Number(data.readBigUInt64LE(73)) / 1e9;
  return { totalStaked };
}

/** Fetch a user's stake account data */
export async function fetchStakeAccount(connection: Connection, stakeAccount: PublicKey) {
  const info = await connection.getAccountInfo(stakeAccount);
  if (!info) return null;
  const data = info.data;
  // 8 discriminator + 32 owner + 32 pool + amount(8) + pending_rewards(8) + last_updated(8) + has_badge(1)
  const amount         = Number(data.readBigUInt64LE(72))  / 1e9;
  const pendingRewards = Number(data.readBigUInt64LE(80))  / 1e9;
  const lastUpdated    = Number(data.readBigInt64LE(88));
  const hasBadge       = data[96] === 1;
  return { amount, pendingRewards, lastUpdated, hasBadge };
}
