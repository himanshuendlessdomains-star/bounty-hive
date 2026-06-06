import { useState } from 'react';
import { useBountyStore } from '../stores/bountyStore';
import { useTonPrice } from '../hooks/useTonPrice';
import { calcPerWinner, validateMinPayout, formatTon, formatUsd } from '../utils/format';
import type { BountyType, WinnerSelection, VerificationMethod, CreateBountyPayload } from '../types/bounty';

const BOUNTY_TYPES: { value: BountyType; label: string; icon: string }[] = [
  { value: 'task', label: 'Task', icon: '✅' },
  { value: 'quiz', label: 'Quiz', icon: '🧠' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
];

export function CreateBountyPage() {
  const { setCreateDraft } = useBountyStore();
  const { price: tonPrice } = useTonPrice();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BountyType>('task');
  const [pool, setPool] = useState('');
  const [winnerCount, setWinnerCount] = useState('10');
  const [winnerSelection, setWinnerSelection] = useState<WinnerSelection>('draw');
  const [verification, setVerification] = useState<VerificationMethod>('manual');
  const [verificationRule, setVerificationRule] = useState('');

  const poolNum = parseFloat(pool) || 0;
  const winnersNum = parseInt(winnerCount) || 1;
  const perWinner = calcPerWinner(pool, winnersNum);
  const perWinnerUsd = (parseFloat(perWinner) * tonPrice).toFixed(2);
  const isValidPayout = validateMinPayout(perWinner, tonPrice);

  const handleConfirm = () => {
    const draft: CreateBountyPayload = {
      title,
      description,
      type,
      poolAmount: pool,
      winnerCount: winnersNum,
      winnerSelection,
      verification,
      verificationRule: verification === 'auto' ? verificationRule : undefined,
    };
    setCreateDraft(draft);
    // TODO: Submit to backend / smart contract
    alert('Bounty created! (backend integration pending)');
  };

  return (
    <div className="px-4 pb-20">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              step >= s ? 'bg-hive-500' : 'bg-[var(--border)]'
            }`
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">What's your bounty about?</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short, catchy title"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--text-secondary)] focus:border-hive-500 outline-none"
          />
          <button
            disabled={!title.trim()}
            onClick={() => setStep(2)}
            className="w-full mt-4 bg-hive-500 hover:bg-hive-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Describe what people need to do</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Be specific — what counts as a valid submission?"
            rows={4}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--text-secondary)] focus:border-hive-500 outline-none resize-none"
          />
          <button
            disabled={!description.trim()}
            onClick={() => setStep(3)}
            className="w-full mt-4 bg-hive-500 hover:bg-hive-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Bounty type</h2>
          <div className="space-y-3">
            {BOUNTY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  type === t.value
                    ? 'border-hive-500 bg-hive-500/10'
                    : 'border-[var(--border)] bg-[var(--bg-card)]'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-white font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="w-full mt-4 bg-hive-500 hover:bg-hive-600 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Prize pool & winners</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[var(--text-secondary)] text-sm mb-1 block">Total pool (TON)</label>
              <input
                type="number"
                value={pool}
                onChange={(e) => setPool(e.target.value)}
                placeholder="1"
                min="0.01"
                step="0.01"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-hive-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[var(--text-secondary)] text-sm mb-1 block">Number of winners</label>
              <input
                type="number"
                value={winnerCount}
                onChange={(e) => setWinnerCount(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-hive-500 outline-none"
              />
            </div>
            {poolNum > 0 && winnersNum > 0 && (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-white">
                  Each winner: <span className="text-hive-400 font-bold">{formatTon(perWinner)} TON</span>
                  <span className="text-[var(--text-secondary)] ml-1">({formatUsd(perWinnerUsd)})</span>
                </p>
                {!isValidPayout && (
                  <p className="text-red-400 text-sm mt-1">⚠️ Minimum $0.01 per winner not met</p>
                )}
              </div>
            )}
          </div>
          <button
            disabled={!poolNum || !winnersNum || !isValidPayout}
            onClick={() => setStep(5)}
            className="w-full mt-4 bg-hive-500 hover:bg-hive-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Selection & verification</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[var(--text-secondary)] text-sm mb-2 block">Winner selection</label>
              <div className="flex gap-3">
                {(['draw', 'manual'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setWinnerSelection(s)}
                    className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${
                      winnerSelection === s
                        ? 'border-hive-500 bg-hive-500/10 text-hive-400'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-white'
                    }`}
                  >
                    {s === 'draw' ? '🎲 Draw' : '👆 Manual'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[var(--text-secondary)] text-sm mb-2 block">Verification</label>
              <div className="flex gap-3">
                {(['manual', 'auto'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVerification(v)}
                    className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${
                      verification === v
                        ? 'border-hive-500 bg-hive-500/10 text-hive-400'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-white'
                    }`}
                  >
                    {v === 'manual' ? '👁 Manual' : '🤖 Auto'}
                  </button>
                ))}
              </div>
            </div>
            {verification === 'auto' && (
              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">Verification rule</label>
                <input
                  value={verificationRule}
                  onChange={(e) => setVerificationRule(e.target.value)}
                  placeholder="e.g. Must include screenshot with @username"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--text-secondary)] focus:border-hive-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Title</span><span className="text-white">{title}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type</span><span className="text-white capitalize">{type}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Pool</span><span className="text-hive-400">{pool} TON</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Winners</span><span className="text-white">{winnerCount}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Each gets</span><span className="text-white">{formatTon(perWinner)} TON</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Selection</span><span className="text-white capitalize">{winnerSelection}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Verification</span><span className="text-white capitalize">{verification}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Duration</span><span className="text-white">24 hours</span></div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full mt-4 bg-hive-500 hover:bg-hive-600 text-black font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            🏴‍☠️ Go Live!
          </button>
        </div>
      )}
    </div>
  );
}
