# BountyHive 🏴‍☠️

Telegram mini-app for micro-bounties on TON blockchain.

Create bounties, complete tasks, earn rewards.

## Features

- 🏴‍☠️ Create micro-bounties (minimum $0.01 per winner)
- ⏱️ 24-hour bounty windows
- 🎲 Draw or manual winner selection
- ✅ Manual or auto verification
- 💰 Escrow-based payments in TON
- 📱 Telegram mini-app UX

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Blockchain:** TON Connect for wallet integration
- **Styling:** TailwindCSS
- **State:** Zustand

## Getting Started

```bash
npm install
npm run dev
```

Open in Telegram Bot API or local browser.

## Project Structure

```
src/
  components/     # UI components
  hooks/           # Custom React hooks
  pages/           # Page-level components
  stores/          # Zustand stores
  types/           # TypeScript types
  utils/           # Helper functions
  App.tsx          # Root component
  main.tsx         # Entry point
```
