import { useState, useCallback } from 'react';
import { useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { BountyEscrow } from '../contracts/BountyEscrow';
import { IS_TESTNET } from '../contracts/addresses';

const NETWORK = IS_TESTNET ? CHAIN.TESTNET : CHAIN.MAINNET;

export function useEscrowContract(escrowAddress: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  const send = useCallback(
    async (body: ReturnType<typeof BountyEscrow.buildSubmitProofMessage>, amount: string) => {
      if (!escrowAddress) { setError('Escrow address not available'); return null; }
      setLoading(true);
      setError(null);
      try {
        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          network: NETWORK,
          messages: [{ address: Address.parse(escrowAddress).toString(), amount: toNano(amount).toString(), payload: body.toBoc().toString('base64') }],
        });
        return true;
      } catch (err: any) {
        setError(err.message || 'Transaction failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [escrowAddress, tonConnectUI]
  );

  const submitProof = useCallback(
    (proofUrl: string) => send(BountyEscrow.buildSubmitProofMessage(proofUrl), '0.05'),
    [send]
  );

  const approveSubmission = useCallback(
    (submissionId: string) => send(BountyEscrow.buildApproveMessage(submissionId), '0.03'),
    [send]
  );

  const rejectSubmission = useCallback(
    (submissionId: string) => send(BountyEscrow.buildRejectMessage(submissionId), '0.03'),
    [send]
  );

  const cancelBounty = useCallback(
    () => send(BountyEscrow.buildCancelMessage(), '0.03'),
    [send]
  );

  return { submitProof, approveSubmission, rejectSubmission, cancelBounty, loading, error };
}
