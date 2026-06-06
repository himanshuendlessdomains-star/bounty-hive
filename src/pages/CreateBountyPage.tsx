import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBountyContract } from '../hooks/useBountyContract';
import { useTonPrice } from '../hooks/useTonPrice';
import { useWalletStore } from '../stores/walletStore';
import { useToast } from '../components/Toast';
import { DepositFlow } from '../components/DepositFlow';
import { WalletButton } from '../components/WalletButton';
import { CREATE_BOUNTY_STEPS, BountyType, WinnerSelection, VerificationMethod } from '../types/bounty';
import { validateMinPayout, calcPerWinner } from '../utils/format';

export function CreateBountyPage() {
  const navigate = useNavigate();
  const { createBounty, loading: creating, error: createError } = useBountyContract();
  const { price: tonPrice } = useTonPrice();
  const { address: walletAddress, connected } = useWalletStore();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BountyType>('task');
  const [poolAmount, setPoolAmount] = useState('');
  const [winnerCount, setWinnerCount] = useState(10);
  const [winnerSelection, setWinnerSelection] = useState<WinnerSelection>('draw');
  const [verification, setVerification] = useState<VerificationMethod>('manual');
  const [verificationRule, setVerificationRule] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const perWinner = calcPerWinner(poolAmount || '0', winnerCount);
  const { valid: minPayoutValid, perWinnerUsd } = validateMinPayout(poolAmount || '0', winnerCount, tonPrice);

  const canProceed = () => {
    switch (step) {
      case 1: return title.trim().length >= 3;
      case 2: return description.trim().length >= 10;
      case 3: return parseFloat(poolAmount) > 0 && winnerCount > 0 && minPayoutValid;
      case 4: return true;
      case 5: return connected;
      default: return false;
    }
  };

  const handleCreate = async () => {
    const result = await createBounty({
      title,
      description,
      type,
      poolAmount,
      winnerCount,
      winnerSelection,
      verification,
      verificationRule,
      ownerId: walletAddress!,
    });

    if (result) {
      addToast('success', 'Bounty created! 🏴‍☠️');
      navigate(`/bounty/${result.id}`);
    } else {
      addToast('error', createError || 'Failed to create bounty');
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-white">Create Bounty</h1>
          <WalletButton />
        </div>
        <div className="flex items-center gap-1">
          {CREATE_BOUNTY_STEPS.map((s) => (
            <div key={s.id} className={`flex-1 h-1 rounded-full ${s.id <= step ? 'bg-hive-500' : 'bg-[var(--border)]'}`} />
          ))}
        </div>
        <p className="text-[var(--text-secondary)] text-xs mt-2">
          Step {step}: {CREATE_BOUNTY_STEPS[step - 1]?.title}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {step === 1 && (
          <>
            <h2 className="text-white font-semibold">What's your bounty about?</h2>
            <input type="text" placeholder="Bounty title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" maxLength={100} />
            <div className="space-y-2">
              <p className="text-[var(--text-secondary)] text-sm">Type</p>
              {(['task', 'quiz', 'creative'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`w-full text-left p-3 rounded-xl border transition-colors ${type === t ? 'border-hive-500 bg-hive-500/10' : 'border-[var(--border)] hover:border-[var(--border-focus)]'}`}>
                  <p className="text-white font-medium">{t === 'task' ? '✅ Task' : t === 'quiz' ? '🧠 Quiz' : '🎨 Creative'}</p>
                  <p className="text-[var(--text-muted)] text-xs">{t === 'task' ? 'Complete an action' : t === 'quiz' ? 'Answer a question' : 'Create something original'}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-white font-semibold">Describe what hunters need to do</h2>
            <textarea placeholder="Be specific about what proof you need..." value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[120px] resize-none" maxLength={500} />
            <p className="text-[var(--text-muted)] text-xs">{description.length}/500</p>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-white font-semibold">Set the reward pool</h2>
            <DepositFlow onDeposit={(amount) => setDepositAmount(amount)} />
            <div className="card">
              <div className="space-y-3">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm">Pool amount (TON)</label>
                  <input type="number" placeholder="1.0" value={poolAmount} onChange={(e) => setPoolAmount(e.target.value)} className="input-field" min="0" step="any" />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] text-sm">Number of winners</label>
                  <input type="number" placeholder="10" value={winnerCount} onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)} className="input-field" min="1" max="1000" />
                </div>
                {poolAmount && winnerCount > 0 && (
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Per winner</span>
                      <span className="text-white font-medium">{perWinner} TON</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Per winner (USD)</span>
                      <span className={minPayoutValid ? 'text-hive-500' : 'text-red-400'}>${perWinnerUsd.toFixed(4)}</span>
                    </div>
                    {!minPayoutValid && <p className="text-red-400 text-xs mt-1">Minimum payout must be ≥ $0.01</p>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-white font-semibold">How are winners selected?</h2>
            <div className="space-y-3">
              <button onClick={() => setWinnerSelection('draw')} className={`w-full text-left p-4 rounded-xl border transition-colors ${winnerSelection === 'draw' ? 'border-hive-500 bg-hive-500/10' : 'border-[var(--border)] hover:border-[var(--border-focus)]'}`}>
                <p className="text-white font-medium">🎲 Random Draw</p>
                <p className="text-[var(--text-muted)] text-xs">Winners randomly selected from approved submissions</p>
              </button>
              <button onClick={() => setWinnerSelection('manual')} className={`w-full text-left p-4 rounded-xl border transition-colors ${winnerSelection === 'manual' ? 'border-hive-500 bg-hive-500/10' : 'border-[var(--border)] hover:border-[var(--border-focus)]'}`}>
                <p className="text-white font-medium">✋ Manual Pick</p>
                <p className="text-[var(--text-muted)] text-xs">You choose the winners from approved submissions</p>
              </button>
            </div>
            <h3 className="text-white font-semibold mt-6">Verification method</h3>
            <div className="space-y-3">
              <button onClick={() => setVerification('manual')} className={`w-full text-left p-4 rounded-xl border transition-colors ${verification === 'manual' ? 'border-hive-500 bg-hive-500/10' : 'border-[var(--border)] hover:border-[var(--border-focus)]'}`}>
                <p className="text-white font-medium">👁 Manual Review</p>
                <p className="text-[var(--text-muted)] text-xs">You review and approve each submission</p>
              </button>
              <button onClick={() => setVerification('auto')} className={`w-full text-left p-4 rounded-xl border transition-colors ${verification === 'auto' ? 'border-hive-500 bg-hive-500/10' : 'border-[var(--border)] hover:border-[var(--border-focus)]'}`}>
                <p className="text-white font-medium">⚡ Auto-verify</p>
                <p className="text-[var(--text-muted)] text-xs">Auto-approved after 24h if you don't review</p>
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-white font-semibold">Review & Launch</h2>
            <div className="card space-y-3">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Title</span><span className="text-white font-medium">{title}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type</span><span className="text-white">{type === 'task' ? '✅ Task' : type === 'quiz' ? '🧠 Quiz' : '🎨 Creative'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Pool</span><span className="text-hive-500 font-bold">{poolAmount} TON</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Winners</span><span className="text-white">{winnerCount}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Per winner</span><span className="text-white">{perWinner} TON</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Selection</span><span className="text-white">{winnerSelection === 'draw' ? '🎲 Random' : '✋ Manual'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Verification</span><span className="text-white">{verification === 'manual' ? '👁 Manual' : '⚡ Auto'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Duration</span><span className="text-white">24 hours</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Fee</span><span className="text-white">1%</span></div>
            </div>
            {!connected && <p className="text-yellow-400 text-sm text-center">Connect your wallet to create a bounty</p>}
          </>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">Back</button>}
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-primary flex-1">Next</button>
          ) : (
            <button onClick={handleCreate} disabled={!connected || creating} className="btn-primary flex-1">
              {creating ? 'Creating...' : '🏴‍☠️ Launch Bounty'}
            </button>
          )}
        </div>

        {createError && <p className="text-red-400 text-sm text-center">{createError}</p>}
      </div>
    </div>
  );
}
