// API client for BountyHive backend

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

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
