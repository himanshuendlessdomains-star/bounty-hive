import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import {
  submitProof,
  approveSubmission,
  rejectSubmission,
  selectWinners,
  cancelBounty,
  triggerAutoComplete,
} from '../contracts/BountyEscrow';

export function useEscrowContract(escrowAddress: string | null) {
  const { isConnected } = useWalletStore();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitProof = useCallback(async (proofUrl: string) => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await submitProof(escrowAddress, proofUrl);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  const handleApprove = useCallback(async (submissionId: number) => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await approveSubmission(escrowAddress, submissionId);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  const handleReject = useCallback(async (submissionId: number) => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await rejectSubmission(escrowAddress, submissionId);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  const handleSelectWinners = useCallback(async (winnerAddresses: string[]) => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await selectWinners(escrowAddress, winnerAddresses);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  const handleCancel = useCallback(async () => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await cancelBounty(escrowAddress);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  const handleAutoComplete = useCallback(async () => {
    if (!escrowAddress || !isConnected) return null;
    setIsSending(true);
    setError(null);
    try {
      return await triggerAutoComplete(escrowAddress);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }, [escrowAddress, isConnected]);

  return {
    submitProof: handleSubmitProof,
    approve: handleApprove,
    reject: handleReject,
    selectWinners: handleSelectWinners,
    cancel: handleCancel,
    autoComplete: handleAutoComplete,
    isSending,
    error,
  };
}
