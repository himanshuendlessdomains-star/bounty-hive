import {
  Bounty,
  BountyType,
  WinnerSelection,
  VerificationMethod,
  BountyStatus,
  SubmissionStatus,
} from '../types/bounty';
import { useWalletStore } from '../stores/walletStore';
import { MOCK_BOUNTIES } from './mock';

// ─── Config ────────────────────────────────────────────────────────────────────
const USE_MOCK = !import.meta.env.VITE_API_URL;
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Timeout wrapper ───────────────────────────────────────────────────────────
const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (tgInitData) headers['x-telegram-init-data'] = tgInitData;
  if (tonAddress) headers['x-ton-address'] = tonAddress;

  const res = await withTimeout(
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers as Record<string, string> || {}),
      },
    }),
  );

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// ─── Simulate network delay for mock mode ─────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MOCK_DELAY = 400;

// ─── Response types ────────────────────────────────────────────────────────────

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

// ─── API methods ──────────────────────────────────────────────────────────────

export const api = {
  getBounties: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let filtered = [...MOCK_BOUNTIES];
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((b) => b.status === params.status);
      }
      if (params?.type) {
        filtered = filtered.filter((b) => b.type === params.type);
      }
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
  }): Promise<BountyResponse> => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const now = new Date().toISOString();
      const endsAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const reviewEndsAt = new Date(Date.now() + 10 * 86400000).toISOString();
      const perWinnerAmount = (parseFloat(data.poolAmount) / data.winnerCount).toFixed(6);
      return {
        id: `mock-${Date.now()}`,
        escrowAddress: data.escrowAddress ?? null,
        title: data.title,
        description: data.description,
        type: data.type,
        poolAmount: data.poolAmount,
        poolUsd: '0',
        winnerCount: data.winnerCount,
        perWinnerAmount,
        perWinnerUsd: '0',
        winnerSelection: data.winnerSelection,
        verification: data.verification,
        verificationRule: data.verificationRule ?? '',
        status: 'active',
        duration: 7,
        platformFeeBps: 100,
        createdAt: now,
        endsAt,
        reviewEndsAt,
        completedAt: null,
        ownerId: 'mock-user',
        owner: { id: 'mock-user', username: null, displayName: 'Mock User', avatarUrl: null },
        submissions: [],
        winners: [],
        submissionCount: 0,
      };
    }
    return request<BountyResponse>('/bounties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submitProof: async (data: { bountyId: string; proofUrl: string }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id: `mock-sub-${Date.now()}`, bountyId: data.bountyId, proofUrl: data.proofUrl, status: 'pending' };
    }
    return request<SubmissionResponse>(`/bounties/${data.bountyId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ proofUrl: data.proofUrl }),
    });
  },

  updateSubmission: async (submissionId: string, status: 'approved' | 'rejected') => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id: submissionId, status };
    }
    return request<SubmissionResponse>(`/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  upsertUser: async (data: { tonAddress: string; displayName?: string }) => {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return { id: `user-${data.tonAddress.slice(0, 8)}`, tonAddress: data.tonAddress, username: null, displayName: data.displayName || data.tonAddress.slice(0, 6) + '...' };
    }
    return request<{ id: string; tonAddress: string; username: string | null; displayName: string | null }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Map API response → frontend Bounty type ────────────────────────────────────

function toNum(val: string | number | null | undefined, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback;
  const n = typeof val === 'number' ? val : Number(val);
  return isNaN(n) ? fallback : n;
}

function toStr(val: string | null | undefined, fallback: string = ''): string {
  return val ?? fallback;
}

export function mapBounty(b: BountyResponse): Bounty {
  return {
    id: b.id,
    escrowAddress: b.escrowAddress ?? undefined,
    title: b.title,
    description: b.description,
    type: b.type as BountyType,
    poolAmount: b.poolAmount,
    poolUsd: b.poolUsd,
    winnerCount: b.winnerCount,
    perWinnerAmount: b.perWinnerAmount,
    perWinnerUsd: b.perWinnerUsd,
    winnerSelection: b.winnerSelection as WinnerSelection,
    verification: b.verification as VerificationMethod,
    verificationRule: b.verificationRule,
    status: b.status as BountyStatus,
    duration: toNum(b.duration),
    platformFeeBps: toNum(b.platformFeeBps),
    createdAt: b.createdAt,
    endsAt: toNum(b.endsAt),
    reviewEndsAt: toNum(b.reviewEndsAt),
    completedAt: b.completedAt ? toNum(b.completedAt) : undefined,
    ownerId: b.ownerId,
    owner: b.owner,
    submissions: (b.submissions || []).map((s: SubmissionResponse) => ({
      id: s.id,
      bountyId: s.bountyId,
      userId: s.userId,
      proofUrl: s.proofUrl,
      status: s.status as SubmissionStatus,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt ?? undefined,
      user: s.user,
    })),
    winners: (b.winners || []).map((w: WinnerResponse) => ({
      id: w.id,
      bountyId: w.bountyId,
      userId: w.userId,
      payoutAmount: w.payoutAmount,
      payoutTxHash: w.payoutTxHash,
      paidAt: w.paidAt ?? undefined,
      user: w.user,
    })),
    submissionCount: toNum(b.submissionCount ?? b.submissions?.length ?? 0),
  };
}