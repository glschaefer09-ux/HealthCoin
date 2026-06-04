import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
} from "@solana/spl-token";
import { HLTH_DECIMALS, HLTH_TRANSFER_FEE_BPS } from "./constants";

/**
 * Creates the HLTH Token-2022 mint with a 1% transfer fee.
 * Run once during initial deploy — store the returned mint address in .env.
 */
export async function createHlthMint(
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
): Promise<PublicKey> {
  const mintKeypair = Keypair.generate();
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  const tx = new Transaction().add(
    // Allocate mint account
    {
      keys: [],
      programId: PublicKey.default,
      data: Buffer.alloc(0),
    } as never,
    createInitializeTransferFeeConfigInstruction(
      mintKeypair.publicKey,
      mintAuthority,         // fee withdrawal authority
      mintAuthority,         // transfer fee config authority
      HLTH_TRANSFER_FEE_BPS,
      BigInt(Number.MAX_SAFE_INTEGER), // max fee — uncapped
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      HLTH_DECIMALS,
      mintAuthority,
      freezeAuthority,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  // Use the higher-level helper which handles SystemProgram.createAccount internally
  const mint = await createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    HLTH_DECIMALS,
    mintKeypair,
    { commitment: "confirmed" },
    TOKEN_2022_PROGRAM_ID,
  );

  return mint;
}

/** Returns an ATA for the given owner, creating it if needed */
export async function getHlthTokenAccount(
  connection: Connection,
  payer: Keypair,
  owner: PublicKey,
  mint: PublicKey,
) {
  return getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner,
    false,
    "confirmed",
    {},
    TOKEN_2022_PROGRAM_ID,
  );
}

/** Transfer HLTH between wallets — note the 1% fee is deducted on-chain */
export async function transferHlth(
  connection: Connection,
  payer: Keypair,
  source: PublicKey,
  destination: PublicKey,
  owner: Keypair,
  amount: bigint,
  mint: PublicKey,
): Promise<string> {
  return transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount,
    [],
    { commitment: "confirmed" },
    TOKEN_2022_PROGRAM_ID,
  );
}
