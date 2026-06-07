// ─── Omniston DEX Aggregator Client ──────────────────────────────────────────
// Provides real-time best-route aggregation across StonFi, DeDust, and other
// TON DEXes. Falls back gracefully when WebSocket is unavailable.

import { SwapQuote, SwapRoute } from '../types/bounty';
import { getBestQuote, getSwapRoute, type QuoteParams, type RouteParams } from './stonfi';

export type { QuoteParams, RouteParams };
export { getBestQuote, getSwapRoute, TON_ADDRESS, FALLBACK_TOKENS, fetchTokenList } from './stonfi';

// Re-export for backward compatibility
export class OmnistonClient {
  private ws: WebSocket | null = null;
  private connected = false;

  async connect(): Promise<void> {
    // WebSocket connection to Omniston for real-time price updates
    // Not required for basic swap flow — REST API is used instead
    try {
      this.ws = new WebSocket('wss://api.omniston.ai/v1/ws');
      this.ws.onopen = () => { this.connected = true; };
      this.ws.onclose = () => { this.connected = false; };
      this.ws.onerror = () => { this.connected = false; };
    } catch {
      // WebSocket not available — REST API still works
      this.connected = false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Delegate to stonfi.ts functions (which try Omniston first, then StonFi)
  async getBestQuote(params: QuoteParams): Promise<SwapQuote | null> {
    return getBestQuote(params);
  }

  async getSwapRoute(params: RouteParams): Promise<SwapRoute | null> {
    return getSwapRoute(params);
  }
}

export const omnistonClient = new OmnistonClient();
