import React, { useState } from 'react';
import { TokenAsset } from '../types/bounty';

interface TokenSelectorProps {
  tokens: TokenAsset[];
  selected: TokenAsset | null;
  onSelect: (token: TokenAsset) => void;
}

export function TokenSelector({ tokens, selected, onSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = tokens.filter((t) => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 hover:border-[var(--border-focus)] transition-colors w-full">
        {selected ? (
          <>
            {selected.image ? <img src={selected.image} alt={selected.symbol} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-hive-500/20 flex items-center justify-center text-hive-500 text-xs font-bold">{selected.symbol.slice(0, 2)}</div>}
            <span className="text-white font-medium">{selected.symbol}</span>
            <span className="text-[var(--text-muted)] text-sm">{selected.name}</span>
          </>
        ) : <span className="text-[var(--text-muted)]">Select token</span>}
        <svg className="ml-auto w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-64 overflow-hidden">
          <div className="p-2">
            <input type="text" placeholder="Search tokens..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field text-sm" autoFocus />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((token) => (
              <button key={token.address} onClick={() => { onSelect(token); setOpen(false); setSearch(''); }} className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[var(--bg-card-hover)] transition-colors ${selected?.address === token.address ? 'bg-hive-500/10' : ''}`}>
                {token.image ? <img src={token.image} alt={token.symbol} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-hive-500/20 flex items-center justify-center text-hive-500 text-sm font-bold">{token.symbol.slice(0, 2)}</div>}
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">{token.symbol}</p>
                  <p className="text-[var(--text-muted)] text-xs">{token.name}</p>
                </div>
                {token.priceUsd && <span className="text-[var(--text-secondary)] text-xs">${token.priceUsd.toFixed(2)}</span>}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-[var(--text-muted)] text-sm text-center py-4">No tokens found</p>}
          </div>
        </div>
      )}
    </div>
  );
}
