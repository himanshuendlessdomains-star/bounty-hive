// ─── Bounty Types ─────────────────────────────────────────────────────────────

export type BountyType = 'task' | 'quiz' | 'creative';
export type WinnerSelection = 'draw' | 'manual';
export type VerificationMethod = 'manual' | 'auto';
export type BountyStatus = 'active' | 'review' | 'completed' | 'cancelled';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Bounty {
  id: string;
  escrowAddress?: string;
  title: string;
  description: string;
  type: BountyType;
  poolAmount: string;
  poolUsd: string;
  winnerCount: number;
  perWinnerAmount: string;
  perWinnerUsd: string;
  winnerSelection: WinnerSelection;
  verification: VerificationMethod;
  verificationRule: string;
  status: BountyStatus;
  duration: number;
  platformFeeBps: number;
  ownerId: string;
  submissions: Submission[];
  winners?: Winner[];
  endsAt: number;
  reviewEndsAt?: number;
  completedAt?: number;
  createdAt?: string;
  owner?: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  submissionCount?: number;
}

export interface Submission {
  id: string;
  bountyId: string;
  userId: string;
  proofUrl: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  user?: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface Winner {
  id: string;
  bountyId: string;
  userId: string;
  payoutAmount: string;
  payoutTxHash: string | null;
  paidAt: string | null;
  user?: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateBountyPayload {
  title: string;
  description: string;
  type: BountyType;
  poolAmount: string;
  winnerCount: number;
  winnerSelection: WinnerSelection;
  verification: VerificationMethod;
  verificationRule?: string;
  escrowAddress?: string;
}

// ─── Swap Types ────────────────────────────────────────────────────────────────

export interface TokenAsset {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  image?: string;
  priceUsd?: number;
}

export interface SwapQuote {
  offerAddress: string;
  askAddress: string;
  offerUnits: string;
  minAskUnits: string;
  priceImpact: string;
  routerAddress: string;
  provider: 'stonfi' | 'omniston';
}

export interface SwapRoute {
  quote: SwapQuote;
  txParams: {
    to: string;
    value: string;
    body?: string;
  };
}

// ─── Escrow Contract Types ────────────────────────────────────────────────────

export interface EscrowState {
  status: 'active' | 'review' | 'completed' | 'cancelled';
  poolAmount: bigint;
  winnerCount: number;
  perWinnerAmount: bigint;
  platformFeeBps: number;
  submissionCount: number;
  payoutDone: boolean;
  endsAt: number;
  reviewEndsAt: number;
}

export interface FactoryContractState {
  bountyCount: number;
  platformFeeBps: number;
  platformAddress: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface CreateBountyStep {
  id: number;
  title: string;
  description: string;
}

export const CREATE_BOUNTY_STEPS: CreateBountyStep[] = [
  { id: 1, title: 'Title & Type', description: 'Name your bounty and pick a category' },
  { id: 2, title: 'Description', description: 'Tell hunters what to do' },
  { id: 3, title: 'Pool & Winners', description: 'Set the reward and how many win' },
  { id: 4, title: 'Selection & Verification', description: 'Draw or manual? Auto or manual review?' },
  { id: 5, title: 'Review & Launch', description: 'Confirm everything and go live' },
];
