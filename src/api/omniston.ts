// ─── Omniston SDK Client ─────────────────────────────────────────────────────
// Aggregates best swap routes across DEXs for optimal pricing

import { SwapQuote } from '../types/bounty';

const OMNISTON_WS = 'wss://omni-ws.ston.fi';

interface OmnistonRoute {
  id: string;
  sourceAsset: string;
  destinationAsset: string;
  sourceAmount: string;
  destinationAmount: string;
  priceImpact: string;
  steps: Array<{
    from: string;
    to: string;
    pool: string;
    fee: string;
  }>;
}

interface OmnistonQuote {
  route: OmnistonRoute;
  txParams: {
    to: string;
    value: string;
    body?: string;
  };
}

export class OmnistonClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    { resolve: (value: any) => void; reject: (err: Error) => void }
  >();

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(OMNISTON_WS);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(new Error('Omniston connection failed'));
      this.ws.onmessage = (event) => this.handleMessage(event.data);

      this.ws.onclose = () => {
        // Reject all pending requests
        for (const [, { reject }] of this.pendingRequests) {
          reject(new Error('Connection closed'));
        }
        this.pendingRequests.clear();
      };
    });
  }

  private handleMessage(data: string) {
    try {
      const response = JSON.parse(data);
      const id = response.id;
      const pending = this.pendingRequests.get(id);
      if (!pending) return;

      this.pendingRequests.delete(id);

      if (response.error) {
        pending.reject(new Error(response.error.message || 'Omniston error'));
      } else {
        pending.resolve(response.result);
      }
    } catch (err) {
      console.error('Failed to parse Omniston message:', err);
    }
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const id = ++this.requestId;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.ws!.send(JSON.stringify(request));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30_000);
    });
  }

  // ─── Get best route ──────────────────────────────────────────────────────

  async getBestRoute(params: {
    bidAssetAddress: string;
    askAssetAddress: string;
    bidUnits: string;
    slippageBps?: number;
    maxOutgoingMessages?: number;
  }): Promise<OmnistonRoute | null> {
    try {
      const result = await this.sendRequest('bestRoute', {
        bid_asset_address: params.bidAssetAddress,
        ask_asset_address: params.askAssetAddress,
        bid_units: params.bidUnits,
        slippage_bps: params.slippageBps || 100, // 1%
        max_outgoing_messages: params.maxOutgoingMessages || 4,
      });

      return result?.route || result || null;
    } catch (err) {
      console.error('Omniston getBestRoute failed:', err);
      return null;
    }
  }

  // ─── Build swap transaction ───────────────────────────────────────────────

  async buildSwapTransaction(params: {
    route: OmnistonRoute;
    sourceAddress: string;
    destinationAddress: string;
  }): Promise<{ to: string; value: string; body?: string } | null> {
    try {
      const result = await this.sendRequest('buildSwapTransaction', {
        route_id: params.route.id,
        source_address: params.sourceAddress,
        destination_address: params.destinationAddress,
      });

      return result?.txParams || result || null;
    } catch (err) {
      console.error('Omniston buildSwapTransaction failed:', err);
      return null;
    }
  }

  // ─── Compare routes (StonFi vs Omniston) ──────────────────────────────────

  async getBestQuote(params: {
    offerAddress: string;
    askAddress: string;
    offerUnits: string;
    slippageTolerance?: string;
    stonfiQuote?: SwapQuote | null;
  }): Promise<SwapQuote | null> {
    try {
      const route = await this.getBestRoute({
        bidAssetAddress: params.offerAddress,
        askAssetAddress: params.askAddress,
        bidUnits: params.offerUnits,
      });

      if (!route) return params.stonfiQuote;

      const omnistonQuote: SwapQuote = {
        offerAddress: params.offerAddress,
        askAddress: params.askAddress,
        offerUnits: params.offerUnits,
        minAskUnits: route.destinationAmount || '0',
        priceImpact: route.priceImpact || '0',
        routerAddress: route.steps?.[0]?.pool || '',
        provider: 'omniston',
      };

      // Compare with StonFi quote
      if (params.stonfiQuote) {
        const stonfiOutput = BigInt(params.stonfiQuote.minAskUnits || '0');
        const omnistonOutput = BigInt(omnistonQuote.minAskUnits || '0');

        if (omnistonOutput > stonfiOutput) {
          return omnistonQuote;
        }
        return params.stonfiQuote;
      }

      return omnistonQuote;
    } catch (err) {
      console.error('Failed to get best quote:', err);
      return params.stonfiQuote;
    }
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton
export const omnistonClient = new OmnistonClient();
