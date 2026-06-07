// ─── Mock API Client ─────────────────────────────────────────────────────────
// Returns sample data so the UI works without a backend.
// Swap back to real fetch() calls when the backend is ready.

import {
  Bounty,
  Submission,
  Winner,
  BountyType,
  WinnerSelection,
  VerificationMethod,
  BountyStatus,
  SubmissionStatus,
} from '../types/bounty';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const NOW = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

const MOCK_BOUNTIES: Bounty[] = [
  {
    id: 'bounty-1',
    escrowAddress: undefined,
    title: 'Follow me on Twitter',
    description: 'Follow @bountyhive on Twitter, like the pinned tweet, and submit a screenshot of your follow. Quick and easy task!',
    type: 'task',
    poolAmount: '1',
    poolUsd: '3.25',
    winnerCount: 100,
    perWinnerAmount: '0.01',
    perWinnerUsd: '0.03',
    winnerSelection: 'draw',
    verification: 'manual',
    verificationRule: 'Screenshot of follow',
    status: 'active',
    duration: 24,
    platformFeeBps: 100,
    ownerId: 'user-1',
    endsAt: NOW + 24 * HOUR,
    createdAt: new Date(NOW - 2 * HOUR).toISOString(),
    owner: { id: 'user-1', username: 'bountyhive', displayName: 'BountyHive', avatarUrl: null },
    submissions: [],
    winners: [],
  },
  {
    id: 'bounty-2',
    escrowAddress: undefined,
    title: 'Write a meme about TON',
    description: 'Create an original meme about TON blockchain and post it on Twitter with #TONMeme. Funniest wins!',
    type: 'creative',
    poolAmount: '5',
    poolUsd: '16.25',
    winnerCount: 3,
    perWinnerAmount: '1.67',
    perWinnerUsd: '5.42',
    winnerSelection: 'manual',
    verification: 'manual',
    verificationRule: 'Tweet link with #TONMeme',
    status: 'active',
    duration: 24,
    platformFeeBps: 100,
    ownerId: 'user-2',
    endsAt: NOW + 12 * HOUR,
    createdAt: new Date(NOW - 6 * HOUR).toISOString(),
    owner: { id: 'user-2', username: 'tonmeme', displayName: 'TON Meme Lord', avatarUrl: null },
    submissions: [
      {
        id: 'sub-1',
        bountyId: 'bounty-2',
        userId: 'user-3',
        proofUrl: 'https://twitter.com/user/status/123',
        status: 'pending',
        submittedAt: new Date(NOW - 3 * HOUR).toISOString(),
        reviewedAt: null,
        user: { id: 'user-3', username: 'memeking', displayName: 'Meme King', avatarUrl: null },
      },
    ],
    winners: [],
  },
  {
    id: 'bounty-3',
    escrowAddress: undefined,
    title: 'TON Quiz: Basic Knowledge',
    description: 'Answer 5 questions about TON blockchain correctly. Test your knowledge and earn TON!',
    type: 'quiz',
    poolAmount: '2',
    poolUsd: '6.50',
    winnerCount: 10,
    perWinnerAmount: '0.2',
    perWinnerUsd: '0.65',
    winnerSelection: 'draw',
    verification: 'auto',
    verificationRule: 'All answers correct',
    status: 'active',
    duration: 24,
    platformFeeBps: 100,
    ownerId: 'user-1',
    endsAt: NOW + 18 * HOUR,
    createdAt: new Date(NOW - 1 * DAY).toISOString(),
    owner: { id: 'user-1', username: 'bountyhive', displayName: 'BountyHive', avatarUrl: null },
    submissions: [],
    winners: [],
  },
  {
    id: 'bounty-4',
    escrowAddress: undefined,
    title: 'Create a TON sticker pack',
    description: 'Design a set of 5 stickers featuring TON branding. Best pack wins 10 TON!',
    type: 'creative',
    poolAmount: '10',
    poolUsd: '32.50',
    winnerCount: 1,
    perWinnerAmount: '10',
    perWinnerUsd: '32.50',
    winnerSelection: 'manual',
    verification: 'manual',
    verificationRule: 'Sticker pack link',
    status: 'review',
    duration: 24,
    platformFeeBps: 100,
    ownerId: 'user-4',
    endsAt: NOW - 2 * HOUR,
    reviewEndsAt: NOW + 22 * HOUR,
    createdAt: new Date(NOW - 1 * DAY - 2 * HOUR).toISOString(),
    owner: { id: 'user-4', username: 'tonartist', displayName: 'TON Artist', avatarUrl: null },
    submissions: [
      {
        id: 'sub-2',
        bountyId: 'bounty-4',
        userId: 'user-5',
        proofUrl: 'https://t.me/addstickons/tonpack',
        status: 'pending',
        submittedAt: new Date(NOW - 5 * HOUR).toISOString(),
        reviewedAt: null,
        user: { id: 'user-5', username: 'stickmaster', displayName: 'Stick Master', avatarUrl: null },
      },
      {
        id: 'sub-3',
        bountyId: 'bounty-4',
        userId: 'user-6',
        proofUrl: 'https://t.me/addstickons/tonpack2',
        status: 'approved',
        submittedAt: new Date(NOW - 8 * HOUR).toISOString(),
        reviewedAt: new Date(NOW - 4 * HOUR).toISOString(),
        user: { id: 'user-6', username: 'artlover', displayName: 'Art Lover', avatarUrl: null },
      },
    ],
    winners: [],
  },
  {
    id: 'bounty-5',
    escrowAddress: undefined,
    title: 'Share your TON wallet address',
    description: 'Simply connect your wallet and share your address. First 50 participants get 0.02 TON each!',
    type: 'task',
    poolAmount: '1',
    poolUsd: '3.25',
    winnerCount: 50,
    perWinnerAmount: '0.02',
    perWinnerUsd: '0.07',
    winnerSelection: 'draw',
    verification: 'auto',
    verificationRule: 'Wallet connected',
    status: 'completed',
    duration: 24,
    platformFeeBps: 100,
    ownerId: 'user-2',
    endsAt: NOW - 1 * DAY,
    completedAt: NOW - 1 * DAY,
    createdAt: new Date(NOW - 2 * DAY).toISOString(),
    owner: { id: 'user-2', username: 'tonmeme', displayName: 'TON Meme Lord', avatarUrl: null },
    submissions: [],
    winners: [
      {
        id: 'w-1',
        bountyId: 'bounty-5',
        userId: 'user-3',
        payoutAmount: '0.02',
        payoutTxHash: null,
        paidAt: null,
        user: { id: 'user-3', username: 'memeking', displayName: 'Meme King', avatarUrl: null },
      },
    ],
  },
];

// ─── Response types (kept for type compatibility) ─────────────────────────────

export interface BountyResponse {
  id: string;
  escrowAddress: string | null;
  title: string;
  description: string;
  type: string;
  poolAmount: string;
  poolUsd: string;
  winnerCount: number;
  perWinnerAmount: string;
  perWinnerUsd: string;
  winnerSelection: string;
  verification: string;
  verificationRule: string;
  status: string;
  duration: number;
  platformFeeBps: number;
  createdAt: string;
  endsAt: string;
  reviewEndsAt: string;
  completedAt: string | null;
  ownerId: string;
  owner: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
  submissions: SubmissionResponse[];
  winners: WinnerResponse[];
  submissionCount?: number;
}

export interface SubmissionResponse {
  id: string;
  bountyId: string;
  userId: string;
  proofUrl: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  user: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
}

export interface WinnerResponse {
  id: string;
  bountyId: string;
  userId: string;
  payoutAmount: string;
  payoutTxHash: string | null;
  paidAt: string | null;
  user: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bountyToResponse(b: Bounty): BountyResponse {
  return {
    id: b.id,
    escrowAddress: b.escrowAddress ?? null,
    title: b.title,
    description: b.description,
    type: b.type,
    poolAmount: b.poolAmount,
    poolUsd: b.poolUsd,
    winnerCount: b.winnerCount,
    perWinnerAmount: b.perWinnerAmount,
    perWinnerUsd: b.perWinnerUsd,
    winnerSelection: b.winnerSelection,
    verification: b.verification,
    verificationRule: b.verificationRule,
    status: b.status,
    duration: b.duration,
    platformFeeBps: b.platformFeeBps,
    createdAt: b.createdAt ?? new Date().toISOString(),
    endsAt: new Date(b.endsAt).toISOString(),
    reviewEndsAt: b.reviewEndsAt ? new Date(b.reviewEndsAt).toISOString() : '',
    completedAt: b.completedAt ? new Date(b.completedAt).toISOString() : null,
    ownerId: b.ownerId,
    owner: b.owner ?? { id: b.ownerId, username: null, displayName: null, avatarUrl: null },
    submissions: (b.submissions ?? []).map(s => ({
      id: s.id,
      bountyId: s.bountyId,
      userId: s.userId,
      proofUrl: s.proofUrl,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      user: s.user ?? { id: s.userId, username: null, displayName: null, avatarUrl: null },
    })),
    winners: (b.winners ?? []).map(w => ({
      id: w.id,
      bountyId: w.bountyId,
      userId: w.userId,
      payoutAmount: w.payoutAmount,
      payoutTxHash: w.payoutTxHash,
      paidAt: w.paidAt,
      user: w.user ?? { id: w.userId, username: null, displayName: null, avatarUrl: null },
    })),
    submissionCount: b.submissions?.length ?? 0,
  };
}

// ─── Mock API ──────────────────────────────────────────────────────────────────

export const api = {
  getBounties: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    await delay(400);
    let filtered = [...MOCK_BOUNTIES];
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(b => b.status === params.status);
    }
    if (params?.type) {
      filtered = filtered.filter(b => b.type === params.type);
    }
    return {
      bounties: filtered.map(bountyToResponse),
      total: filtered.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
  },

  getBounty: async (id: string) => {
    await delay(300);
    const b = MOCK_BOUNTIES.find(b => b.id === id);
    if (!b) throw new Error('Bounty not found');
    return bountyToResponse(b);
  },

  createBounty: async (data: any) => {
    await delay(500);
    const newBounty: Bounty = {
      id: `bounty-${Date.now()}`,
      escrowAddress: undefined,
      title: data.title,
      description: data.description,
      type: data.type,
      poolAmount: data.poolAmount,
      poolUsd: String(parseFloat(data.poolAmount) * 3.25),
      winnerCount: data.winnerCount,
      perWinnerAmount: (parseFloat(data.poolAmount) / data.winnerCount).toFixed(6),
      perWinnerUsd: ((parseFloat(data.poolAmount) / data.winnerCount) * 3.25).toFixed(2),
      winnerSelection: data.winnerSelection,
      verification: data.verification,
      verificationRule: data.verificationRule ?? '',
      status: 'active',
      duration: 24,
      platformFeeBps: 100,
      ownerId: 'user-me',
      endsAt: Date.now() + 24 * 3600000,
      createdAt: new Date().toISOString(),
      owner: { id: 'user-me', username: 'you', displayName: 'You', avatarUrl: null },
      submissions: [],
      winners: [],
    };
    MOCK_BOUNTIES.unshift(newBounty);
    return bountyToResponse(newBounty);
  },

  updateBounty: async (id: string, data: { status: string }) => {
    await delay(300);
    const b = MOCK_BOUNTIES.find(b => b.id === id);
    if (!b) throw new Error('Bounty not found');
    b.status = data.status as BountyStatus;
    return bountyToResponse(b);
  },

  submitProof: async (data: { bountyId: string; proofUrl: string }) => {
    await delay(400);
    const b = MOCK_BOUNTIES.find(b => b.id === data.bountyId);
    if (!b) throw new Error('Bounty not found');
    const sub: Submission = {
      id: `sub-${Date.now()}`,
      bountyId: data.bountyId,
      userId: 'user-me',
      proofUrl: data.proofUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      user: { id: 'user-me', username: 'you', displayName: 'You', avatarUrl: null },
    };
    b.submissions.push(sub);
    return {
      id: sub.id,
      bountyId: sub.bountyId,
      userId: sub.userId,
      proofUrl: sub.proofUrl,
      status: sub.status,
      submittedAt: sub.submittedAt,
      reviewedAt: sub.reviewedAt,
      user: sub.user!,
    };
  },

  updateSubmission: async (id: string, status: 'approved' | 'rejected') => {
    await delay(300);
    for (const b of MOCK_BOUNTIES) {
      const s = b.submissions.find(s => s.id === id);
      if (s) {
        s.status = status;
        s.reviewedAt = new Date().toISOString();
        return {
          id: s.id,
          bountyId: s.bountyId,
          userId: s.userId,
          proofUrl: s.proofUrl,
          status: s.status,
          submittedAt: s.submittedAt,
          reviewedAt: s.reviewedAt,
          user: s.user!,
        };
      }
    }
    throw new Error('Submission not found');
  },

  getUser: async (id: string) => {
    await delay(200);
    return { id, username: 'you', displayName: 'You', avatarUrl: null };
  },

  getUserBounties: async (id: string, status?: string) => {
    await delay(300);
    let bounties = MOCK_BOUNTIES.filter(b => b.ownerId === id);
    if (status) bounties = bounties.filter(b => b.status === status);
    return { bounties: bounties.map(bountyToResponse) };
  },

  getUserSubmissions: async (id: string) => {
    await delay(300);
    const subs: SubmissionResponse[] = [];
    for (const b of MOCK_BOUNTIES) {
      for (const s of b.submissions) {
        if (s.userId === id) {
          subs.push({
            id: s.id,
            bountyId: s.bountyId,
            userId: s.userId,
            proofUrl: s.proofUrl,
            status: s.status,
            submittedAt: s.submittedAt,
            reviewedAt: s.reviewedAt,
            user: s.user ?? { id: s.userId, username: null, displayName: null, avatarUrl: null },
          });
        }
      }
    }
    return { submissions: subs };
  },

  upsertUser: async (data: any) => {
    await delay(200);
    return { id: 'user-me', ...data };
  },

  health: async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
};

// ─── Mapper (kept for compatibility) ────────────────────────────────────────────

export function mapBounty(r: BountyResponse): Bounty {
  return {
    id: r.id,
    escrowAddress: r.escrowAddress ?? undefined,
    title: r.title,
    description: r.description,
    type: r.type as BountyType,
    poolAmount: r.poolAmount,
    poolUsd: r.poolUsd,
    winnerCount: r.winnerCount,
    perWinnerAmount: r.perWinnerAmount,
    perWinnerUsd: r.perWinnerUsd,
    winnerSelection: r.winnerSelection as WinnerSelection,
    verification: r.verification as VerificationMethod,
    verificationRule: r.verificationRule,
    status: r.status as BountyStatus,
    duration: r.duration,
    platformFeeBps: r.platformFeeBps,
    ownerId: r.ownerId,
    endsAt: new Date(r.endsAt).getTime(),
    reviewEndsAt: r.reviewEndsAt ? new Date(r.reviewEndsAt).getTime() : undefined,
    completedAt: r.completedAt ? new Date(r.completedAt).getTime() : undefined,
    createdAt: r.createdAt,
    owner: r.owner,
    submissions: (r.submissions ?? []).map(mapSubmission),
    winners: (r.winners ?? []).map(mapWinner),
  };
}

export function mapSubmission(r: SubmissionResponse): Submission {
  return {
    id: r.id,
    bountyId: r.bountyId,
    userId: r.userId,
    proofUrl: r.proofUrl,
    status: r.status as SubmissionStatus,
    submittedAt: r.submittedAt,
    reviewedAt: r.reviewedAt,
    user: r.user,
  };
}

export function mapWinner(r: WinnerResponse): Winner {
  return {
    id: r.id,
    bountyId: r.bountyId,
    userId: r.userId,
    payoutAmount: r.payoutAmount,
    payoutTxHash: r.payoutTxHash,
    paidAt: r.paidAt,
    user: r.user,
  };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
