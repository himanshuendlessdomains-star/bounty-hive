// API client for BountyHive backend

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

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Bounties ────────────────────────────────────────────────────────────────

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
  owner: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
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
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  bounty?: BountyResponse;
}

export interface WinnerResponse {
  id: string;
  bountyId: string;
  userId: string;
  payoutAmount: string;
  payoutTxHash: string | null;
  paidAt: string | null;
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export const api = {
  // ─── Bounties ────────────────────────────────────────────────────────────

  getBounties: (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<{ bounties: BountyResponse[]; total: number; page: number; limit: number }>(
      `/bounties?${query.toString()}`
    );
  },

  getBounty: (id: string) => request<BountyResponse>(`/bounties/${id}`),

  createBounty: (data: {
    title: string;
    description: string;
    type: string;
    poolAmount: string;
    winnerCount: number;
    winnerSelection: string;
    verification: string;
    verificationRule?: string;
    escrowAddress?: string;
    ownerId: string;
  }) => request<BountyResponse>('/bounties', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateBounty: (id: string, data: { status: string }) =>
    request<BountyResponse>(`/bounties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ─── Submissions ──────────────────────────────────────────────────────────

  submitProof: (data: { bountyId: string; userId: string; proofUrl: string }) =>
    request<SubmissionResponse>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSubmission: (id: string, status: 'approved' | 'rejected') =>
    request<SubmissionResponse>(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ─── Users ────────────────────────────────────────────────────────────────

  getUser: (id: string) => request<any>(`/users/${id}`),

  getUserBounties: (id: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<{ bounties: BountyResponse[] }>(`/users/${id}/bounties${query}`);
  },

  getUserSubmissions: (id: string) =>
    request<{ submissions: SubmissionResponse[] }>(`/users/${id}/submissions`),

  upsertUser: (data: {
    telegramId: string;
    tonAddress?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }) => request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // ─── Health ───────────────────────────────────────────────────────────────

  health: () => request<{ status: string; timestamp: string }>('/health'),
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
    verificationRule: r.verificationRule ?? '',
    status: r.status as BountyStatus,
    duration: r.duration,
    platformFeeBps: r.platformFeeBps,
    ownerId: r.ownerId,
    submissions: r.submissions?.map(mapSubmission) ?? [],
    winners: r.winners?.map(mapWinner),
    endsAt: new Date(r.endsAt).getTime(),
    reviewEndsAt: r.reviewEndsAt ? new Date(r.reviewEndsAt).getTime() : undefined,
    completedAt: r.completedAt ? new Date(r.completedAt).getTime() : undefined,
    createdAt: r.createdAt,
    owner: r.owner,
  };
}
