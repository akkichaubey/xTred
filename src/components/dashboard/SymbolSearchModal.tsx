"use client";

import { useState, useMemo } from "react";
import { useTickerStore } from "@/stores/useTickerStore";
import { MARKET_REGISTRY } from "@/lib/constants/markets";
import { formatPrice, formatPercent, getPnLClass } from "@/lib/utils";

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableMarkets = Object.values(MARKET_REGISTRY).map((m) => ({
  symbol: m.symbol,
  name: m.name,
  price: m.basePrice,
  change: m.change24hPct,
}));

export default function SymbolSearchModal({ isOpen, onClose }: SymbolSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const addCustomSymbol = useTickerStore((s) => s.addCustomSymbol);
  const customSymbols = useTickerStore((s) => s.customSymbols);
  const tickers = useTickerStore((s) => s.tickers);

  const filteredMarkets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableMarkets;
    return availableMarkets.filter(
      (m) => m.symbol.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (symbol: string) => {
    addCustomSymbol(symbol);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title font-display">Add Market Symbol</h2>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets (e.g. AVAXUSD, DOGEUSD, LINKUSD)..."
            className="search-input font-display"
            autoFocus
          />
        </div>

        {/* Market Results List */}
        <div className="markets-list">
          {filteredMarkets.length === 0 ? (
            <div className="no-results">No matching markets found for "{searchQuery}"</div>
          ) : (
            filteredMarkets.map((m) => {
              const liveTicker = tickers[m.symbol];
              const price = liveTicker?.markPrice || m.price;
              const change = liveTicker?.change24hPct || m.change;
              const pnlClass = getPnLClass(change);
              const isAdded = customSymbols.includes(m.symbol);

              return (
                <div
                  key={m.symbol}
                  onClick={() => handleSelect(m.symbol)}
                  className="market-row"
                >
                  <div className="market-info">
                    <span className="market-sym font-display">{m.symbol}</span>
                    <span className="market-name">{m.name}</span>
                  </div>

                  <div className="market-metrics">
                    <span className="market-price tabular-nums font-mono">
                      ${formatPrice(price)}
                    </span>
                    <span className={`market-change tabular-nums font-mono ${pnlClass}`}>
                      {formatPercent(change)}
                    </span>
                    <span className="add-badge">
                      {isAdded ? "Active" : "+ Add"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 520px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: #0f172a;
          border: 1px solid var(--color-border-strong);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          animation: modalPop 200ms ease;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 1.125rem;
        }

        .btn-close:hover {
          color: var(--color-text-primary);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.875rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.5rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 150ms ease;
        }

        .search-input:focus {
          border-color: var(--color-brand-400);
        }

        .markets-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
          max-height: 340px;
          padding-right: 0.25rem;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .market-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .market-row:hover {
          border-color: var(--color-brand-400);
          background: var(--color-bg-overlay);
        }

        .market-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .market-sym {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .market-name {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .market-metrics {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .market-price {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .market-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .add-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          background: var(--color-brand-500);
          color: #ffffff;
          border-radius: var(--radius-xs);
        }

        @keyframes modalPop {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
