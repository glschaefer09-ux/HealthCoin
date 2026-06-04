#!/usr/bin/env bash
# HealthCoin Devnet Deploy Script
# Run from: healthcoin-wallet/
# Requirements: solana CLI, anchor CLI, node >= 18

set -e

KEYPAIR_DIR="$HOME/.solana/keypairs/healthcoin-devnet"
mkdir -p "$KEYPAIR_DIR"

echo "=== HealthCoin Devnet Deploy ==="

# 1. Generate deployer keypair if not exists
if [ ! -f "$KEYPAIR_DIR/deployer.json" ]; then
  echo "Generating deployer keypair…"
  solana-keygen new --outfile "$KEYPAIR_DIR/deployer.json" --no-bip39-passphrase
fi

solana config set --url devnet --keypair "$KEYPAIR_DIR/deployer.json"

# 2. Airdrop SOL for deploy fees
echo "Requesting airdrop…"
solana airdrop 4 --url devnet || true

# 3. Create HLTH mint (Token-2022, 1B supply, 1% transfer fee)
echo "Creating HLTH mint…"
MINT_ADDR=$(npx ts-node scripts/create-mint.ts 2>&1 | grep "MINT:" | awk '{print $2}')
echo "HLTH Mint: $MINT_ADDR"
echo "NEXT_PUBLIC_HEALTHCOIN_MINT=$MINT_ADDR" >> .env

# 4. Build & deploy Anchor programs
echo "Building Anchor programs…"
cd contracts/solana
anchor build

echo "Deploying hlth_staking…"
anchor deploy --program-name hlth_staking

echo "Deploying hlth_adpool…"
anchor deploy --program-name hlth_adpool

echo "Deploying hlth_rewards…"
anchor deploy --program-name hlth_rewards

cd ../..

# 5. Initialize on-chain accounts
echo "Initializing program accounts…"
npx ts-node scripts/initialize-programs.ts

echo ""
echo "=== Deploy complete ==="
echo "Mint:    $MINT_ADDR"
echo "Update your .env with the program IDs printed by anchor deploy."
echo "Then run: npm run dev"
