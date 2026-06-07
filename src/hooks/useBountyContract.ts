import { useState, useCallback } from 'react';
import { TonClient, Address, toNano, fromNano } from '@ton/ton';
import { beginCell } from '@ton/core';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';
import { useBountyStore } from '../stores/bountyStore';
import { api, mapBounty } from '../api/client';
import { CreateBountyPayload } from '../types/bounty';
import { getTonConnectUI } from '../contracts/tonConnect';

// ─── Config ────────────────────────────────────────────────────────────────────

const TON_NETWORK = import.meta.env.VITE_TON_NETWORK || 'mainnet';
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS || '';
const TONCENTER_API_KEY = import.meta.env.VITE_TONCENTER_API_KEY || '';

const TON_ENDPOINT = TON_NETWORK === 'mainnet'
  ? 'https://toncenter.com/api/v2/'
  : 'https://testnet.toncenter.com/api/v2/';

const PLATFORM_ADDRESS = 'UQBt5d56LX8GnpYsTl9NVn2h4TNVcKlagsa3HpG2mVZfG5kx';
const PLATFORM_FEE_BPS = 100; // 1%

// ─── CreateBounty message op code (from Tact contract) ──────────────────────────
// The BountyFactory contract receives CreateBounty messages
// Op code is computed as: crc32("CreateBounty") & 0x7FFFFFFF
// We'll compute it or use the known value from the compiled contract
const CREATE_BOUNTY_OP = 0x6A3E4B5C; // Will be updated after computing actual op code

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
            // Fields: title, description, bountyType, winnerCount, winnerSelection, verification, verificationRule
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

            // After sending, we need to find the escrow address
            // The factory computes it deterministically from init data
            // We'll query the factory after a short delay
            console.log('Bounty creation tx sent:', result.boc);

            // Wait for the transaction to be processed
            await new Promise(r => setTimeout(r, 5000));

            // Query the factory for the new bounty address
            try {
              const client = new TonClient({
                endpoint: TON_ENDPOINT,
                options: TONCENTER_API_KEY ? { headers: { 'X-API-Key': TONCENTER_API_KEY } } : undefined,
              });
              const factoryAddr = Address.parse(FACTORY_ADDRESS);
              const factoryState = await client.runMethod(factoryAddr, 'bountyCount');
              const count = factoryState.stack.readNumber();

              if (count > 0) {
                const lastIdx = count - 1;
                const bountyAddrResult = await client.runMethod(factoryAddr, 'bountyAddress', [{ type: 'int', value: BigInt(lastIdx) }]);
                onChainEscrowAddress = bountyAddrResult.stack.readAddress().toString();
                setEscrowAddress(onChainEscrowAddress);
              }
            } catch (err) {
              console.warn('Could not read escrow address from factory (transaction may still be processing):', err);
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
