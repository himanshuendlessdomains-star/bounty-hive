# 🏴‍☠️ BountyHive

**Micro-bounties on TON — create, complete, and earn in 24 hours.**

BountyHive is a Telegram mini-app that lets anyone create micro-bounties (as low as $0.01 per winner) on the TON blockchain. Bounties are strictly 24 hours, funds are held in escrow, and winners are paid out automatically.

---

## ✨ Features

- **24-hour bounties** — strict duration, no extensions
- **Micro-payouts** — minimum $0.01 per winner
- **Draw or Manual** — random draw or owner-picks-winners
- **Escrow on TON** — funds locked in smart contracts, auto-payout
- **Auto-verification** — manual review or automated rules
- **1% platform fee** — minimal, transparent
- **Telegram-native** — runs as a mini-app inside Telegram

---

## 🏗 Architecture

```
bounty-hive/
├── contracts/bounty-hive/     # Tact smart contracts (TON)
│   ├── sources/
│   │   ├── BountyFactory.tact
│   │   ├── BountyEscrow.tact
│   │   └── libs/random.tact
│   ├── scripts/
│   │   └── deploy-testnet.ts
│   ├── tests/
│   │   └── BountyEscrow.spec.ts
│   └── package.json
├── backend/                    # Express + Prisma API
│   ├── src/
│   │   ├── index.ts
│   │   ├── indexer.ts
│   │   ├── routes/
│   │   │   ├── bounties.ts
│   │   │   ├── submissions.ts
│   │   │   ├── users.ts
│   │   │   └── webhooks.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       ├── errorHandler.ts
│   │       └── rateLimit.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   └── package.json
├── src/                        # React frontend (Vite + TS)
│   ├── api/client.ts
│   ├── contracts/
│   │   ├── tonConnect.ts
│   │   ├── addresses.ts
│   │   ├── BountyFactory.ts
│   │   └── BountyEscrow.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useBountyContract.ts
│   │   ├── useEscrowContract.ts
│   │   └── useTonPrice.ts
│   ├── pages/
│   │   ├── DiscoverPage.tsx
│   │   ├── BountyDetailPage.tsx
│   │   ├── CreateBountyPage.tsx
│   │   └── MyBountiesPage.tsx
│   ├── components/
│   │   ├── BountyCard.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── WalletButton.tsx
│   │   └── BottomNav.tsx
│   ├── stores/
│   │   ├── bountyStore.ts
│   │   └── walletStore.ts
│   ├── providers/TonProvider.tsx
│   ├── utils/format.ts
│   └── App.tsx
├── public/
│   └── tonconnect-manifest.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Docker** (for backend)
- **A TON testnet wallet** — fund via [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)
- **Telegram Bot Token** — from [@BotFather](https://t.me/BotFather)

### 1. Clone & Install

```bash
git clone https://github.com/himanshuendlessdomains-star/bounty-hive.git
cd bounty-hive

# Frontend
npm install

# Backend
cd backend
npm install
npx prisma generate

# Contracts
cd ../contracts/bounty-hive
npm install
```

### 2. Configure Environment

#### Backend (`.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://bountyhive:bountyhive_dev@localhost:5432/bountyhive
PORT=3001
TON_API_KEY=your_tonapi_key
TON_NETWORK=testnet
FACTORY_ADDRESS=              # fill after deploying contracts
PLATFORM_FEE_BPS=100
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_bot_token
```

#### Frontend (`.env`)

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_FACTORY_ADDRESS=          # fill after deploying contracts
VITE_TON_NETWORK=testnet
```

### 3. Start the Database

```bash
# From project root
docker-compose up -d db

# Wait for Postgres to be ready, then migrate
cd backend
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Deploy Smart Contracts (Testnet)

```bash
cd contracts/bounty-hive

# Set your 24-word mnemonic for a funded testnet wallet
export MNEMONIC="word1 word2 word3 ... word24"

# Fund the wallet via @testgiver_ton_bot first!

# Deploy the BountyFactory contract
npx tsx scripts/deploy-testnet.ts
```

The script will output the **Factory address**. Copy it and paste into:
- `src/contracts/addresses.ts` → `testnet.factoryAddress`
- `backend/.env` → `FACTORY_ADDRESS`

To also create a sample bounty on testnet:

```bash
CREATE_SAMPLE=true npx tsx scripts/deploy-testnet.ts
```

### 5. Start the Backend

```bash
# Option A: Docker (recommended)
docker-compose up -d

# Option B: Local development
cd backend
npm run dev
```

The API runs at `http://localhost:3001`

Health check: `curl http://localhost:3001/api/health`

### 6. Start the Frontend

```bash
# From project root
npm run dev
```

The app runs at `http://localhost:5173`

---

## 📱 Telegram Mini-App Setup

### 1. Create a Bot

1. Open [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the **Bot Token** to `backend/.env` → `TELEGRAM_BOT_TOKEN`

### 2. Enable Mini-App

1. Send `/newapp` to BotFather
2. Choose your bot
3. Set the webapp URL to your deployed frontend (e.g. `https://your-domain.com`)
4. Set a short name and description

### 3. Set Bot Commands (optional)

```
/start - Open BountyHive
/create - Create a bounty
/my - My bounties
```

### 4. Configure Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" 
  -d '{"url": "https://your-domain.com/api/webhooks/telegram"}'
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts/bounty-hive
npm test
```

### Backend API Tests

```bash
cd backend
npm test
```

### Manual Testing

1. Start the backend + frontend locally
2. Open the Telegram Bot and launch the mini-app
3. Connect your TON testnet wallet
4. Create a bounty → submit proof → approve → verify payout

---

## 📊 API Reference

### Bounties

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bounties` | List bounties (filter by `status`, `type`, `page`, `limit`) |
| `GET` | `/api/bounties/:id` | Get bounty detail with submissions & winners |
| `POST` | `/api/bounties` | Create a new bounty |
| `PATCH` | `/api/bounties/:id` | Update bounty status |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submissions` | Submit proof to a bounty |
| `PATCH` | `/api/submissions/:id` | Approve or reject a submission |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/:id` | Get user profile |
| `GET` | `/api/users/:id/bounties` | Get user's bounties |
| `GET` | `/api/users/:id/submissions` | Get user's submissions |
| `POST` | `/api/users` | Create or update user (Telegram auth) |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/telegram` | Telegram bot webhook |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |

---

## 🔒 Smart Contract Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Created    │────▶│   Active     │────▶│   Review     │────▶│  Completed   │
│  (0h)       │     │  (0–24h)    │     │  (24–48h)   │     │  (paid out)  │
└─────────────┘     └─────────────┘     └─────────────┘     └──────────────┘
                          │                     │
                          │                     │
                          ▼                     ▼
                    ┌──────────┐         ┌──────────────┐
                    │ Cancelled│         │  Cancelled    │
                    │ (owner)  │         │ (no approved) │
                    └──────────┘         └──────────────┘
```

### States

| State | Duration | Description |
|-------|----------|-------------|
| **Active** | 0–24h | Hunters can submit proofs |
| **Review** | 24–48h | Owner reviews submissions |
| **Completed** | After 48h | Winners paid out |
| **Cancelled** | Anytime | Owner cancels or no valid submissions |

### Winner Selection

- **Draw** — After review window, randomly selects winners from approved submissions
- **Manual** — Owner picks winners during review window; if they don't act, all approved submissions win (up to winner count)

### Payout Flow

1. Owner deposits TON into escrow when creating bounty
2. 1% platform fee deducted per winner
3. Remaining pool split equally among winners
4. If no approved submissions → full refund to owner
5. If fewer winners than slots → excess refunded to owner

---

## 🐳 Docker Deployment

### Full Stack

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `PORT` | ❌ | `3001` | API port |
| `TON_API_KEY` | ❌ | — | TON API key for indexer |
| `TON_NETWORK` | ❌ | `testnet` | `testnet` or `mainnet` |
| `FACTORY_ADDRESS` | ✅ | — | Deployed BountyFactory address |
| `PLATFORM_FEE_BPS` | ❌ | `100` | Platform fee in basis points (100 = 1%) |
| `JWT_SECRET` | ✅ | — | Secret for JWT tokens |
| `TELEGRAM_BOT_TOKEN` | ✅ | — | Telegram bot token from @BotFather |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Tact, @ton/core, @ton/sandbox |
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, Zustand |
| **Wallet** | TON Connect UI |
| **Backend** | Express, Prisma, PostgreSQL |
| **Blockchain** | TON (The Open Network) |
| **Infra** | Docker, Docker Compose |

---

## 📁 Project Structure

### Smart Contracts

- **BountyFactory** — Deploys `BountyEscrow` contracts per bounty, validates minimum per-winner payout (≥ 0.001 TON), tracks all bounty addresses, collects 1% platform fee
- **BountyEscrow** — Holds escrowed TON, handles proof submission, approval/rejection, winner selection (draw/manual), auto-completion, cancellation, and excess refund
- **random.tact** — On-chain pseudo-random number generator (LCG-based) for draw mode; production should use an oracle-based VRF

### Frontend

- **TON Connect** — Wallet connection via `@tonconnect/ui-react`
- **Contract Wrappers** — TypeScript wrappers that build opcode payloads and send transactions via TON Connect
- **API Client** — Typed REST client for backend CRUD operations
- **Zustand Stores** — Global state for bounties and wallet
- **5-Step Create Flow** — Title → Description → Type → Pool & Winners → Selection & Verification → Confirm

### Backend

- **Express API** — REST endpoints for bounties, submissions, users, webhooks
- **Prisma ORM** — PostgreSQL schema with User, Bounty, Submission, Winner models
- **Indexer** — Polls every 10s to transition bounty states and update USD prices
- **Telegram Auth** — Validates WebApp initData for authenticated routes
- **Rate Limiting** — 60 requests/minute per IP (in-memory; use Redis for production)

---

## ⚠️ Production Checklist

- [ ] Replace `random.tact` LCG with an oracle-based VRF (e.g., Orbs VRF)
- [ ] Add Redis for rate limiting and session storage
- [ ] Enable HTTPS with a reverse proxy (nginx/Caddy)
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring (Sentry, DataDog, or similar)
- [ ] Implement proper Telegram initData hash validation in `auth.ts`
- [ ] Add input sanitization and CSRF protection
- [ ] Set up TON API key for production indexer
- [ ] Configure CORS origins to your domain only
- [ ] Run `prisma migrate deploy` (not `dev`) in production
- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL (Supabase, Neon, Railway, etc.)
- [ ] Deploy contracts to mainnet and update `addresses.ts`
- [ ] Add end-to-end tests
- [ ] Set up automated database backups

---

## 📄 License

MIT

---

Built with 🏴‍☠️ by the BountyHive team
