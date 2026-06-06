export type BountyType = 'task' | 'quiz' | 'creative';

export type WinnerSelection = 'draw' | 'manual';

export type VerificationMethod = 'manual' | 'auto';

export type BountyStatus =
  | 'draft'
  | 'active'
  | 'review'
  | 'completed'
  | 'cancelled';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  type: BountyType;
  poolAmount: string; // TON amount as string
  poolUsd: string; // USD equivalent
  winnerCount: number;
  perWinnerAmount: string; // TON
  perWinnerUsd: string; // USD
  winnerSelection: WinnerSelection;
  verification: VerificationMethod;
  verificationRule?: string; // for auto verification
  duration: 24; // always 24 hours
  status: BountyStatus;
  createdAt: string;
  endsAt: string;
  ownerId: string;
  ownerName: string;
  submissions: Submission[];
  escrowAddress?: string;
}

export interface Submission {
  id: string;
  bountyId: string;
  userId: string;
  userName: string;
  proof: string; // screenshot URL, link, etc.
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
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
}
