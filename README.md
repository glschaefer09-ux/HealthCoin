# HealthCoin (HLTH)

**The Solana-native token ecosystem for healthcare payments, provider advertising, and patient wellness rewards.**

Built for the Colosseum Hackathon — Solana Frontier track.

---

## What It Is

HealthCoin does for healthcare what ChefCoin does for food. It gives patients, providers, and wellness businesses:

- **Universal payment wallet** — no KYC friction, no seed phrase confusion. Powered by Reown AppKit (Phantom, Backpack, Solflare).
- **Cheap POS terminals** — clinics, pharmacies, gyms accept HLTH via NFC tap-to-pay.
- **On-chain ad marketplace** — providers buy ad slots with HLTH at 80%+ lower cost than Google Ads or insurance directories.
- **Wellness Rewards Engine** — patients earn HLTH automatically for checkups, prescriptions, journal streaks, and referrals.
- **Health Space** — social community layer for patients and providers to connect.
- **Wormhole bridge** — HLTH works across Ethereum and Polygon too.

---

## Monorepo Structure

```
healthcoin-wallet/
├── apps/
│   ├── web/              Next.js 14 dApp (port 3001)
│   ├── mobile/           Expo mobile app (3 tabs)
│   └── health-space/     Express social app (port 3000)
├── packages/
│   └── wallet-core/      Token-2022, Wormhole, staking helpers
├── contracts/
│   └── solana/           Anchor programs
│       ├── hlth_staking  Patient & provider staking pools
│       ├── hlth_adpool   On-chain ad slot marketplace
│       └── hlth_rewards  Wellness activity attestations
└── scripts/              Deploy & mint helpers
```

---

## Token

| Property       | Value                          |
|----------------|-------------------------------|
| Symbol         | HLTH                          |
| Standard       | Solana Token-2022             |
| Supply         | 1,000,000,000 (fixed)         |
| Decimals       | 9                             |
| Transfer Fee   | 1% → HealthCoin Treasury      |
| Network        | Solana (devnet → mainnet)     |
| Bridge         | Wormhole (Ethereum, Polygon)  |

---

## Anchor Programs

| Program          | Description                                              |
|------------------|----------------------------------------------------------|
| `hlth_staking`   | Patients stake HLTH for 12% APY. Providers stake 10K for verified badge. |
| `hlth_adpool`    | Healthcare providers buy categorized ad slots (7 or 30 days). |
| `hlth_rewards`   | Providers call `attest_activity` → patient wallet auto-receives HLTH. |

---

## Wellness Rewards

| Activity              | HLTH Earned |
|-----------------------|-------------|
| Annual Checkup        | 50 HLTH     |
| Prescription Fill     | 25 HLTH     |
| 30-Day Journal Streak | 100 HLTH    |
| Patient Referral      | 75 HLTH     |

---

## Ad Slot Categories & Pricing

| Category      | 7-Day Slot | 30-Day Slot |
|---------------|-----------|-------------|
| Primary Care  | 100 HLTH  | 350 HLTH    |
| Dental        | 100 HLTH  | 350 HLTH    |
| Mental Health | 100 HLTH  | 350 HLTH    |
| Pharmacy      | 100 HLTH  | 350 HLTH    |
| Fitness       | 100 HLTH  | 350 HLTH    |
| Telehealth    | 100 HLTH  | 350 HLTH    |

*vs. equivalent Google Ads / insurance directory spend: ~$2,000/month*

---

## Ambassador Tiers

| Tier | Name                | Milestone                              | Reward          |
|------|---------------------|----------------------------------------|-----------------|
| 1    | Patient Advocate    | 5 patient referrals                    | 50 HLTH         |
| 2    | Wellness Champion   | 30-day streak + 10 referrals           | 200 HLTH + badge |
| 3    | Community Leader    | 50 referrals + 1 provider onboarded    | 500 HLTH        |
| 4    | Regional Director   | 5 providers in region                  | 2,000 HLTH + rev share |
| 5    | National Ambassador | Top 10 nationally                      | Rev share + advisory |

---

## Quick Start

### 1. Prerequisites
- Node 18+, Rust, Solana CLI, Anchor CLI, Expo CLI
- A devnet wallet funded with SOL (`solana airdrop 4`)

### 2. Clone & Install
```bash
cd healthcoin-wallet
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Fill in NEXT_PUBLIC_REOWN_PROJECT_ID from cloud.reown.com
# Fill in JWT_SECRET, ADMIN_EMAIL, ADMIN_PASS
```

### 4. Deploy to Devnet
```bash
bash scripts/deploy-devnet.sh
# Copies NEXT_PUBLIC_HEALTHCOIN_MINT into .env automatically
# Then fill in program IDs from anchor deploy output
```

### 5. Run All Services
```bash
# Terminal 1 — Health Space social app
npm run health-space

# Terminal 2 — Next.js dApp
npm run dapp

# Terminal 3 — Mobile (optional)
cd apps/mobile && npx expo start
```

---

## Mobile App

| Tab      | Description                                          |
|----------|------------------------------------------------------|
| Community | WebView loading Health Space social app             |
| Wallet   | Native NFC tap-to-pay + balance + transaction history |
| Terminal | Provider QR scanner + wellness attestation submitter |

---

## HIPAA Disclaimer

> HealthCoin is a community rewards protocol. It is not a healthcare provider, does not store medical records, and is not HIPAA-covered. Never share protected health information on this platform.

Displayed as a dismissible banner on every page of the dApp, Health Space, and mobile app.

---

## Keypair Security

- All keypairs stored at `~/.solana/keypairs/healthcoin-devnet/` — outside OneDrive/cloud sync
- Never commit `.env` or any `*.keypair.json` file
- `.gitignore` blocks all of the above

---

## Colosseum Track

**Physical World Applications** — Healthcare is a $4.5T industry with no native crypto payment rail. HealthCoin is the first Solana ecosystem purpose-built for healthcare community rewards.
