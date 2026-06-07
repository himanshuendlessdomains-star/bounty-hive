// ─── Omniston — Mock Mode ─────────────────────────────────────────────────────
// No WebSocket connections. All methods return null.

import { SwapQuote } from '../types/bounty';

export class OmnistonClient {
  async connect(): Promise<void> {
    // No-op in mock mode
  }

  async getBestRoute(): Promise<null> {
    return null;
  }

  async buildSwapTransaction(): Promise<null> {
    return null;
  }

  async getBestQuote(params: {
    offerAddress: string;
    askAddress: string;
    offerUnits: string;
    slippageTolerance?: string;
    stonfiQuote?: SwapQuote | null;
  }): Promise<null> {
    return null;
  }

  disconnect() {
    // No-op
  }
}

export const omnistonClient = new OmnistonClient();
