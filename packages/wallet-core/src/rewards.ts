import { PublicKey } from "@solana/web3.js";
import { HLTH_REWARDS_PROGRAM_ID, HLTH_MINT } from "./constants";

export enum ActivityType {
  Checkup        = 0,
  Prescription   = 1,
  JournalStreak  = 2,
  Referral       = 3,
}

export function getRewardsPoolPda(mint: PublicKey = HLTH_MINT): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("rewards_pool"), mint.toBuffer()],
    HLTH_REWARDS_PROGRAM_ID,
  );
}

export function getActivityRecordPda(
  patient: PublicKey,
  attester: PublicKey,
  activityType: ActivityType,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("activity"),
      patient.toBuffer(),
      attester.toBuffer(),
      Buffer.from([activityType]),
    ],
    HLTH_REWARDS_PROGRAM_ID,
  );
}
