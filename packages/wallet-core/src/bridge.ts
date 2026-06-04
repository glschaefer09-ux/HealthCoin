/**
 * Wormhole bridge helpers for HLTH cross-chain transfers.
 * Uses @wormhole-foundation/sdk — testnet only during hackathon.
 *
 * Full integration guide: https://docs.wormhole.com/wormhole/
 */
import {
  Wormhole,
  Chain,
  TokenTransfer,
  amount as whAmount,
} from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/solana";
import evm from "@wormhole-foundation/sdk/evm";

export type SupportedChain = "Solana" | "Ethereum" | "Polygon";

/**
 * Initiates a HLTH token transfer from Solana to an EVM chain via Wormhole.
 * Returns the Wormhole transfer receipt (use to redeem on the destination chain).
 */
export async function bridgeHlthOut(params: {
  fromSigner: Parameters<typeof solana>[0];
  toChain: Exclude<SupportedChain, "Solana">;
  toAddress: string;
  amountHlth: number;
  network?: "Testnet" | "Mainnet";
}) {
  const { fromSigner, toChain, toAddress, amountHlth, network = "Testnet" } = params;

  const wh = await Wormhole.connect(network, [solana, evm]);

  const srcChain = wh.getChain("Solana");
  const dstChain = wh.getChain(toChain as Chain);

  const srcSigner = await (await srcChain.getSigner(fromSigner as never)).signer;
  const dstAddr   = Wormhole.chainAddress(toChain as Chain, toAddress);

  const hlthMint = process.env.NEXT_PUBLIC_HEALTHCOIN_MINT!;
  const srcToken  = Wormhole.tokenId("Solana", hlthMint);

  const xfer = await wh.tokenTransfer(
    srcToken,
    whAmount.units(whAmount.parse(String(amountHlth), 9)),
    { chain: "Solana", address: await srcSigner.address() } as never,
    dstAddr,
    false, // automatic relay
  );

  const txids = await TokenTransfer.transfer(srcChain, xfer, srcSigner as never);
  return { xfer, txids };
}

/**
 * Redeems a completed Wormhole transfer on an EVM destination chain.
 */
export async function redeemBridgeTransfer(params: {
  toChain: Exclude<SupportedChain, "Solana">;
  toSigner: Parameters<typeof evm>[0];
  xfer: TokenTransfer<"Solana", Chain>;
  network?: "Testnet" | "Mainnet";
}) {
  const { toChain, toSigner, xfer, network = "Testnet" } = params;

  const wh = await Wormhole.connect(network, [solana, evm]);
  const dstChain = wh.getChain(toChain as Chain);
  const dstSigner = await (await dstChain.getSigner(toSigner as never)).signer;

  return TokenTransfer.redeem(dstChain, xfer, dstSigner as never);
}
