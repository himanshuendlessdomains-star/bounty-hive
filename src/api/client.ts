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
import { useWalletStore } from '../stores/walletStore';
import { MOCK_BOUNTIES } from './mock';

// ─── Mock mode ────────────────────────────────────────────────────────────────
// When VITE_API_URL is not set, return mock data instead of hitting a real backend.
// Set VITE_API_URL in .env or Vercel env vars to switch to real API.
const USE_MOCK = !import.meta.env.VITE_API_URL;

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getTgInitData(): string {
  try {
    return (window as any).Telegram?.WebApp?.initData ?? '';
  } catch {
    return '';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const tonAddress = useWalletStore.getState().address ?? '';
  const tgInitData = getTgInitData();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(tgInitData ? { 'x-telegram-init-data': tgInitData } : {}),
      ...(tonAddress ? { 'x-ton-address': tonAddress } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Simulate network delay for mock mode ─────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MOCK_DELAY = 400;

// ─── Response types ───────────────────────────────────────────────────────────

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
  bounty?: BountyResponse;
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

// ─── API methods ──────────────────────────────────────────────────────────────

export const api = {
  getBounties: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let filtered = [...MOCK_BOUNTIES];
      if (params?.status) filtered = filtered.filter((b) => b.status === params.status);
      if (params?.type) filtered = filtered.filter((b) => b.type === params.type);
      return { bounties: filtered, total: filtered.length, page: 1, limit: 20 };
    }
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<{ bounties: BountyResponse[]; total: number; page: number; limit: number }>(
      `/bounties?${query.toString()}`
    );
  },

  getBounty: async (id: string) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const bounty = MOCK_BOUNTIES.find((b) => b.id === id);
      if (!bounty) throw new Error('Bounty not found');
      return bounty;
    }
    return request<BountyResponse>(`/bounties/${id}`);
  },

  createBounty: async (data: {
    title: string;
    description: string;
    type: string;
    poolAmount: string;
    winnerCount: number;
    winnerSelection: string;
    verification: string;
    verificationRule?: string;
    escrowAddress?: string;
  }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const now = Date.now();
      return {
        id: `bounty-${Date.now()}`,
        escrowAddress: null,
        ...data,
        poolUsd: String(parseFloat(data.poolAmount) * 3.25),
        perWinnerAmount: String(parseFloat(data.poolAmount) / data.winnerCount),
        perWinnerUsd: String((parseFloat(data.poolAmount) / data.winnerCount) * 3.25),
        status: 'active',
        platformFeeBps: 100,
        createdAt: new Date(now).toISOString(),
        endsAt: new Date(now + data.duration * 3600000).toISOString(),
        reviewEndsAt: new Date(now + data.duration * 3600000 + 86400000).toISOString(),
        completedAt: null,
        ownerId: 'user-1',
        owner: { id: 'user-1', username: 'bountyhive', displayName: 'BountyHive', avatarUrl: null },
        submissions: [],
        winners: [],
        submissionCount: 0,
      } as BountyResponse;
    }
    return request<BountyResponse>('/bounties', { method: 'POST', body: JSON.stringify(data) });
  },

  updateBounty: async (id: string, data: { status: string }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const bounty = MOCK_BOUNTIES.find((b) => b.id === id);
      if (!bounty) throw new Error('Bounty not found');
      return { ...bounty, ...data };
    }
    return request<BountyResponse>(`/bounties/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  submitProof: async (data: { bountyId: string; proofUrl: string }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        id: `sub-${Date.now()}`,
        bountyId: data.bountyId,
        userId: 'user-me',
        proofUrl: data.proofUrl,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        user: { id: 'user-me', username: 'me', displayName: 'Me', avatarUrl: null },
      } as SubmissionResponse;
    }
    return request<SubmissionResponse>('/submissions', { method: 'POST', body: JSON.stringify(data) });
  },

  updateSubmission: async (id: string, status: 'approved' | 'rejected') => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id, status } as SubmissionResponse;
    }
    return request<SubmissionResponse>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  getUser: async (id: string) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id, username: 'demo_user', displayName: 'Demo User', avatarUrl: null };
    }
    return request<any>(`/users/${id}`);
  },

  getUserBounties: async (id: string, status?: string) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let filtered = MOCK_BOUNTIES.filter((b) => b.ownerId === id);
      if (status) filtered = filtered.filter((b) => b.status === status);
      return { bounties: filtered };
    }
    const query = status ? `?status=${status}` : '';
    return request<{ bounties: BountyResponse[] }>(`/users/${id}/bounties${query}`);
  },

  getUserSubmissions: async (id: string) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const subs: SubmissionResponse[] = [];
      MOCK_BOUNTIES.forEach((b) => {
        b.submissions.forEach((s) => {
          if (s.userId === id) subs.push(s);
        });
      });
      return { submissions: subs };
    }
    return request<{ submissions: SubmissionResponse[] }>(`/users/${id}/submissions`);
  },

  upsertUser: async (data: {
    telegramId?: string;
    tonAddress?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id: 'user-me', ...data };
    }
    return request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  },

  health: async () => {
    if (USE_MOCK) {
      return { status: 'ok', timestamp: new Date().toISOString() };
    }
    return request<{ status: string; timestamp: string }>('/health');
  },
};

// ─── Response → Domain mappers ────────────────────────────────────────────────

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
    submissions: r.submissions.map(mapSubmission),
    winners: r.winners.map(mapWinner),
    endsAt: new Date(r.endsAt).getTime(),
    reviewEndsAt: r.reviewEndsAt ? new Date(r.reviewEndsAt).getTime() : undefined,
    completedAt: r.completedAt ? new Date(r.completedAt).getTime() : undefined,
    createdAt: r.createdAt,
    owner: r.owner,
  };
}