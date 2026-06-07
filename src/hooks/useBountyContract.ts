import { useState, useCallback } from 'react';
import { beginCell } from '@ton/core';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';
import { useBountyStore } from '../stores/bountyStore';
import { api, mapBounty } from '../api/client';
import { CreateBountyPayload } from '../types/bounty';
import { getTonConnectUI } from '../contracts/tonConnect';
import { toNano } from '../utils/format';

// ─── Config ────────────────────────────────────────────────────────────────────

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '';

// CreateBounty message op code (from Tact contract)
const CREATE_BOUNTY_OP = 0x6A3E4B5C;

export function useBountyContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const { addBounty } = useBountyStore();
  const { address: walletAddress } = useWalletStore();
  const { userId, syncUser } = useUserStore();

  const createBounty = useCallback(
    async (payload: CreateBountyPayload) => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Ensure user is synced with backend
        let currentUserId = userId;
        if (!currentUserId) {
          currentUserId = await syncUser(walletAddress);
          if (!currentUserId) {
            throw new Error('Failed to sync user — please reconnect wallet');
          }
        }

        // 2. Calculate pool amount in nanotons
        const poolAmountNano = toNano(payload.poolAmount).toString();

        // 3. If factory address is configured, deploy escrow on-chain
        let onChainEscrowAddress: string | undefined;

        if (FACTORY_ADDRESS) {
          try {
            const ui = getTonConnectUI();

            // Build CreateBounty message body
            const body = beginCell()
              .storeUint(CREATE_BOUNTY_OP, 32)  // op code
              .storeUint(0, 64)                  // query_id
              .storeRef(beginCell()              // ref with string data
                .storeStringTail(payload.title)
                .endCell())
              .storeRef(beginCell()
                .storeStringTail(payload.description)
                .endCell())
              .storeRef(beginCell()
                .storeStringTail(payload.type)
                .endCell())
              .storeUint(payload.winnerCount, 32) // winnerCount
              .storeRef(beginCell()
                .storeStringTail(payload.winnerSelection)
                .endCell())
              .storeRef(beginCell()
                .storeStringTail(payload.verification)
                .endCell())
              .storeRef(beginCell()
                .storeStringTail(payload.verificationRule || '')
                .endCell())
              .endCell();

            // Add gas for escrow deployment (0.05 TON on top of pool)
            const totalAmount = BigInt(poolAmountNano) + toNano('0.05');

            const result = await ui.sendTransaction({
              messages: [{
                address: FACTORY_ADDRESS,
                amount: totalAmount.toString(),
                payload: body.toBoc().toString('base64'),
              }],
              validUntil: Math.floor(Date.now() / 1000) + 600,
            });

            console.log('Bounty creation tx sent:', result.boc);

            // Wait for the transaction to be processed
            await new Promise(r => setTimeout(r, 5000));

            // Try to read the escrow address from the factory
            // This is best-effort — the backend will also track it via indexer
            try {
              const response = await fetch(
                `${import.meta.env.VITE_API_URL || '/api'}/bounties?owner=${currentUserId}&limit=1`
              );
              if (response.ok) {
                const bounties = await response.json();
                if (Array.isArray(bounties) && bounties.length > 0) {
                  const latest = bounties[0];
                  if (latest.escrowAddress) {
                    onChainEscrowAddress = latest.escrowAddress;
                    setEscrowAddress(onChainEscrowAddress);
                  }
                }
              }
            } catch (err) {
              console.warn('Could not fetch escrow address from backend:', err);
            }
          } catch (err: unknown) {
            // If on-chain deployment fails, still create in DB (without escrow)
            console.warn('On-chain deployment failed, creating bounty in DB only:', err);
          }
        }

        // 4. Create bounty in backend (with or without escrow address)
        const backendBounty = await api.createBounty({
          title: payload.title,
          description: payload.description,
          type: payload.type,
          poolAmount: payload.poolAmount,
          winnerCount: payload.winnerCount,
          winnerSelection: payload.winnerSelection,
          verification: payload.verification,
          verificationRule: payload.verificationRule,
          escrowAddress: onChainEscrowAddress,
        });

        addBounty(mapBounty(backendBounty));
        return backendBounty;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create bounty';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, userId, addBounty, syncUser]
  );

  return { createBounty, escrowAddress, loading, error };
}
