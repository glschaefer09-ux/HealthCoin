import { PublicKey } from "@solana/web3.js";

export const HLTH_DECIMALS = 9;
export const HLTH_SUPPLY    = 1_000_000_000; // 1 billion
export const HLTH_TRANSFER_FEE_BPS = 100;    // 1%

export const HLTH_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_HEALTHCOIN_MINT ?? "11111111111111111111111111111111"
);

export const HLTH_STAKING_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HLTH_STAKING_PROGRAM_ID ?? "HLTHstk1111111111111111111111111111111111111"
);

export const HLTH_ADPOOL_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HLTH_ADPOOL_PROGRAM_ID ?? "HLTHadp1111111111111111111111111111111111111"
);

export const HLTH_REWARDS_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HLTH_REWARDS_PROGRAM_ID ?? "HLTHrwd1111111111111111111111111111111111111"
);

export const PROVIDER_BADGE_MIN_HLTH = 10_000;
export const PATIENT_APY_PERCENT     = 12;

export const AD_SLOT_PRICES = {
  7:  100,  // HLTH
  30: 350,
} as const;

export const ACTIVITY_REWARDS = {
  checkup:        50,
  prescription:   25,
  journalStreak:  100,
  referral:       75,
} as const;
