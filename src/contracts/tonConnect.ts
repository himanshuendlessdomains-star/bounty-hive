import { TonConnectUI } from '@tonconnect/ui-react';

// TON Connect provider — singleton
let tonConnectUI: TonConnectUI | null = null;

export function getTonConnectUI(): TonConnectUI {
  if (!tonConnectUI) {
    tonConnectUI = new TonConnectUI({
      manifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
    });
  }
  return tonConnectUI;
}

export async function connectWallet(): Promise<string | null> {
  const ui = getTonConnectUI();
  const connected = await ui.connectWallet();
  if (connected) {
    return connected.account.address;
  }
  return null;
}

export async function disconnectWallet(): Promise<void> {
  const ui = getTonConnectUI();
  await ui.disconnect();
}

export function getWalletAddress(): string | null {
  const ui = getTonConnectUI();
  return ui.wallet?.account.address ?? null;
}

export function isConnected(): boolean {
  const ui = getTonConnectUI();
  return ui.connected;
}

// Send a transaction via TON Connect
export async function sendTransaction(params: {
  to: string;
  value: string; // in nanotons
  payload?: string; // base64 encoded cell
}): Promise<string> {
  const ui = getTonConnectUI();
  const result = await ui.sendTransaction({
    messages: [
      {
        address: params.to,
        amount: params.value,
        payload: params.payload,
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 min
  });
  return result.boc;
}
