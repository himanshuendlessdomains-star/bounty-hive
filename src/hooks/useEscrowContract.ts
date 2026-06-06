import { useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, Cell } from '@ton/core';
import { BountyEscrow } from '../contracts/BountyEscrow';

export function useEscrowContract(escrowAddress: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  const submitProof = useCallback(
    async (proofUrl: string) => {
      if (!escrowAddress) {
        setError('Escrow address not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const escrow = Address.parse(escrowAddress);
        const body = BountyEscrow.buildSubmitProofMessage(proofUrl);

        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: escrow.toString(),
              amount: toNano('0.05').toString(), // gas
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to submit proof');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [escrowAddress, tonConnectUI]
  );

  const approveSubmission = useCallback(
    async (submissionId: string) => {
      if (!escrowAddress) {
        setError('Escrow address not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const escrow = Address.parse(escrowAddress);
        const body = BountyEscrow.buildApproveMessage(submissionId);

        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: escrow.toString(),
              amount: toNano('0.03').toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to approve submission');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [escrowAddress, tonConnectUI]
  );

  const rejectSubmission = useCallback(
    async (submissionId: string) => {
      if (!escrowAddress) {
        setError('Escrow address not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const escrow = Address.parse(escrowAddress);
        const body = BountyEscrow.buildRejectMessage(submissionId);

        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: escrow.toString(),
              amount: toNano('0.03').toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to reject submission');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [escrowAddress, tonConnectUI]
  );

  const cancelBounty = useCallback(
    async () => {
      if (!escrowAddress) {
        setError('Escrow address not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const escrow = Address.parse(escrowAddress);
        const body = BountyEscrow.buildCancelMessage();

        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: escrow.toString(),
              amount: toNano('0.03').toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to cancel bounty');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [escrowAddress, tonConnectUI]
  );

  return {
    submitProof,
    approveSubmission,
    rejectSubmission,
    cancelBounty,
    loading,
    error,
  };
}
