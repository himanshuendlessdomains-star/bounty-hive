# BountyHive Smart Contracts (Tact)

Escrow and payout contracts for the BountyHive micro-bounty platform on TON.

## Architecture

### BountyFactory
- Deploys new `BountyEscrow` contracts
- Tracks all active bounties
- Handles platform fee (1%)

### BountyEscrow
- Holds escrowed TON for each bounty
- Manages submissions, verification, and winner selection
- Supports draw (random) and manual winner selection
- Auto-completes bounties after 24h + 24h review window
- Distributes payouts to winners
- Refunds remaining pool if fewer winners than expected

## Build

```bash
# Install Tact compiler
npm install -g @tact-lang/compiler

# Build
tact contracts/bounty-hive/BountyFactory.tact
```

## Deploy

Deploy via tact-cli or manually through a TON wallet.
