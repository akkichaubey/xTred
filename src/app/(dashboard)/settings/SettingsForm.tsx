"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/stores/settings-store";
import {
  testDeltaConnectionAction,
  testGeminiConnectionAction,
  updateRiskSettings,
} from "./actions";
import type { RefreshInterval, DeltaEnvironment, GeminiModel } from "@/types/settings";
import {
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Save,
  Cpu,
  Sliders,
  AlertCircle,
  Power,
  Globe,
  Copy,
  Check,
} from "lucide-react";

interface SettingsFormProps {
  initialProfile?: {
    risk_max_trade_pct?: number;
    risk_max_daily_pct?: number;
    risk_max_weekly_pct?: number;
  };
}

export default function SettingsForm({ initialProfile }: SettingsFormProps) {
  const store = useSettingsStore();

  // Local Form State
  const [deltaApiKey, setDeltaApiKey] = useState(store.deltaApiKey);
  const [deltaApiSecret, setDeltaApiSecret] = useState(store.deltaApiSecret);
  const [deltaEnv, setDeltaEnv] = useState<DeltaEnvironment>(store.deltaEnv || "india");
  const [geminiApiKey, setGeminiApiKey] = useState(store.geminiApiKey);
  const [geminiModel, setGeminiModel] = useState<GeminiModel>(store.geminiModel || "gemini-2.5-pro");
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(store.refreshInterval || 5);
  const [tradePct, setTradePct] = useState<number>(initialProfile?.risk_max_trade_pct ?? store.riskMaxTradePct ?? 1.0);
  const [dailyPct, setDailyPct] = useState<number>(initialProfile?.risk_max_daily_pct ?? store.riskMaxDailyPct ?? 3.0);
  const [weeklyPct, setWeeklyPct] = useState<number>(initialProfile?.risk_max_weekly_pct ?? store.riskMaxWeeklyPct ?? 6.0);

  // Masking Toggles
  const [showDeltaKey, setShowDeltaKey] = useState(false);
  const [showDeltaSecret, setShowDeltaSecret] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Testing & Saving Loading States
  const [isPending, startTransition] = useTransition();
  const [isTestingDelta, setIsTestingDelta] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Public IP detection (for Delta Exchange IP whitelisting)
  const [myIp, setMyIp] = useState<string | null>(null);
  const [ipCopied, setIpCopied] = useState(false);

  useEffect(() => {
    fetch("/api/myip")
      .then((r) => r.json())
      .then((d) => setMyIp(d.ip || null))
      .catch(() => setMyIp(null));
  }, []);

  const handleCopyIp = () => {
    if (!myIp) return;
    navigator.clipboard.writeText(myIp).then(() => {
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 2000);
    });
  };

  // Change Detection
  const isChanged = useMemo(() => {
    return (
      deltaApiKey !== store.deltaApiKey ||
      deltaApiSecret !== store.deltaApiSecret ||
      deltaEnv !== store.deltaEnv ||
      geminiApiKey !== store.geminiApiKey ||
      geminiModel !== store.geminiModel ||
      refreshInterval !== store.refreshInterval ||
      tradePct !== store.riskMaxTradePct ||
      dailyPct !== store.riskMaxDailyPct ||
      weeklyPct !== store.riskMaxWeeklyPct
    );
  }, [
    deltaApiKey,
    deltaApiSecret,
    deltaEnv,
    geminiApiKey,
    geminiModel,
    refreshInterval,
    tradePct,
    dailyPct,
    weeklyPct,
    store,
  ]);

  // Test Delta Exchange API Connection
  const handleTestDelta = async () => {
    setIsTestingDelta(true);
    setMessage(null);

    const res = await testDeltaConnectionAction(deltaApiKey, deltaApiSecret, deltaEnv);
    setIsTestingDelta(false);

    if (res.success) {
      store.setDeltaStatus("connected");
      setMessage({ type: "success", text: res.message });
    } else {
      store.setDeltaStatus("disconnected");
      setMessage({ type: "error", text: res.message });
    }
  };

  // Toggle Delta Status Manually
  const handleToggleDeltaStatus = () => {
    const nextStatus = store.deltaStatus === "connected" ? "disconnected" : "connected";
    store.setDeltaStatus(nextStatus);
    setMessage({
      type: nextStatus === "connected" ? "success" : "error",
      text: `Delta Exchange API manually set to ${nextStatus.toUpperCase()}.`,
    });
  };

  // Test Gemini AI API Connection
  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setMessage(null);

    const res = await testGeminiConnectionAction(geminiApiKey);
    setIsTestingGemini(false);

    if (res.success) {
      store.setGeminiStatus("connected");
      setMessage({ type: "success", text: res.message });
    } else {
      store.setGeminiStatus("disconnected");
      setMessage({ type: "error", text: res.message });
    }
  };

  // Toggle Gemini Status Manually
  const handleToggleGeminiStatus = () => {
    const nextStatus = store.geminiStatus === "connected" ? "disconnected" : "connected";
    store.setGeminiStatus(nextStatus);
    setMessage({
      type: nextStatus === "connected" ? "success" : "error",
      text: `Gemini AI Engine manually set to ${nextStatus.toUpperCase()}.`,
    });
  };

  // Save Settings
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        // 1. Update Zustand Settings Store
        store.updateSettings({
          deltaApiKey,
          deltaApiSecret,
          deltaEnv,
          geminiApiKey,
          geminiModel,
          refreshInterval,
          riskMaxTradePct: tradePct,
          riskMaxDailyPct: dailyPct,
          riskMaxWeeklyPct: weeklyPct,
        });

        // 2. Persist Risk Settings to Supabase DB Profile
        await updateRiskSettings({
          risk_max_trade_pct: tradePct,
          risk_max_daily_pct: dailyPct,
          risk_max_weekly_pct: weeklyPct,
        });

        setMessage({ type: "success", text: "All settings saved and applied dynamically!" });
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Failed to save settings.";
        setMessage({ type: "error", text });
      }
    });
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setDeltaApiKey(DEFAULT_SETTINGS.deltaApiKey);
    setDeltaApiSecret(DEFAULT_SETTINGS.deltaApiSecret);
    setDeltaEnv(DEFAULT_SETTINGS.deltaEnv);
    setGeminiApiKey(DEFAULT_SETTINGS.geminiApiKey);
    setGeminiModel(DEFAULT_SETTINGS.geminiModel);
    setRefreshInterval(DEFAULT_SETTINGS.refreshInterval);
    setTradePct(DEFAULT_SETTINGS.riskMaxTradePct);
    setDailyPct(DEFAULT_SETTINGS.riskMaxDailyPct);
    setWeeklyPct(DEFAULT_SETTINGS.riskMaxWeeklyPct);

    store.resetToDefaults();
    setMessage({ type: "success", text: "Reset all platform settings to defaults." });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Alert Status Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-[var(--radius-lg)] border text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in ${
            message.type === "success"
              ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)] border-[var(--color-bullish)]/40"
              : "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] border-[var(--color-bearish)]/40"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[10px] uppercase font-bold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Delta Exchange IP Whitelist Helper Banner ────────────────────────── */}
      <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-500)]/8 space-y-2">
        <div className="flex items-center gap-2 text-[var(--color-brand-400)]">
          <Globe className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">Your Current Public IP (for Delta Exchange Whitelist)</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] px-3 py-2">
            <span className="font-mono text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
              {myIp ?? "Detecting…"}
            </span>
            {myIp && (
              <button
                type="button"
                onClick={handleCopyIp}
                title="Copy IP to clipboard"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] transition-colors cursor-pointer"
              >
                {ipCopied ? <Check className="w-3.5 h-3.5 text-[var(--color-bullish)]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <a
            href="https://www.delta.exchange/app/account/manageapikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-[var(--color-brand-400)] underline underline-offset-2 hover:text-[var(--color-brand-300)] transition-colors"
          >
            Open Delta Exchange API Keys →
          </a>
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
          Copy this IP and paste it into the <strong className="text-[var(--color-text-secondary)]">Whitelisted IP</strong> field when creating or editing your Delta Exchange API Key.
          If your ISP changes your IP, come back here to get the new one.
        </p>
      </div>

      {/* ─── 1. Delta Exchange API Configuration ─────────────────────────────── */}
      <div className="card p-5 space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-[var(--color-text-primary)]">
                Delta Exchange API Credentials
              </h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Used for signed live trading & authenticated wallet queries
              </p>
            </div>
          </div>

          {/* Interactive Clickable Connection Status Toggle */}
          <button
            type="button"
            onClick={handleToggleDeltaStatus}
            title="Click to toggle Connected / Disconnected state"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              store.deltaStatus === "connected"
                ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)] border border-[var(--color-bullish)]/30 hover:bg-[var(--color-bearish-dim)] hover:text-[var(--color-bearish)]"
                : store.deltaStatus === "disconnected"
                ? "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] border border-[var(--color-bearish)]/30 hover:bg-[var(--color-bullish-dim)] hover:text-[var(--color-bullish)]"
                : "bg-[var(--color-bg-overlay)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
            }`}
          >
            {store.deltaStatus === "connected" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>CONNECTED</span>
                <Power className="w-3 h-3 ml-1 opacity-70" />
              </>
            ) : store.deltaStatus === "disconnected" ? (
              <>
                <XCircle className="w-3 h-3" />
                <span>DISCONNECTED</span>
                <Power className="w-3 h-3 ml-1 opacity-70" />
              </>
            ) : (
              <span>UNTESTED (CLICK TO TOGGLE)</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Delta API Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showDeltaKey ? "text" : "password"}
                value={deltaApiKey}
                onChange={(e) => setDeltaApiKey(e.target.value)}
                placeholder="Enter Delta API Key..."
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-9 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowDeltaKey(!showDeltaKey)}
                className="absolute right-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                {showDeltaKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Delta API Secret
            </label>
            <div className="relative flex items-center">
              <input
                type={showDeltaSecret ? "text" : "password"}
                value={deltaApiSecret}
                onChange={(e) => setDeltaApiSecret(e.target.value)}
                placeholder="Enter Delta API Secret..."
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-9 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowDeltaSecret(!showDeltaSecret)}
                className="absolute right-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                {showDeltaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Environment Selector */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Delta Exchange Region & Environment
            </label>
            <select
              value={deltaEnv}
              onChange={(e) => setDeltaEnv(e.target.value as DeltaEnvironment)}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--color-text-primary)] font-mono focus:border-[var(--color-brand-500)] outline-none cursor-pointer"
            >
              <option value="india">Delta Exchange India (api.india.delta.exchange)</option>
              <option value="production">Delta Global Mainnet (api.delta.exchange)</option>
              <option value="testnet">Delta Testnet (cdn-ind.testnet.deltaex.org)</option>
            </select>
          </div>
        </div>

        {/* Test Connection Action */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleTestDelta}
            disabled={isTestingDelta}
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs font-semibold border border-[var(--color-border-subtle)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isTestingDelta ? (
              <span>Testing Connection...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[var(--color-brand-400)]" />
                <span>Test Delta Connection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── 2. Google Gemini AI Configuration ──────────────────────────────────────── */}
      <div className="card p-5 space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[var(--radius-md)] bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-[var(--color-text-primary)]">
                Google Gemini AI Configuration
              </h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Powers probabilistic market distribution analysis & technical reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Gemini Model Selector Dropdown */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Model:
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value as GeminiModel)}
                className="bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-2.5 py-1 text-xs text-[var(--color-brand-400)] font-semibold focus:border-[var(--color-brand-500)] outline-none cursor-pointer"
              >
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Recommended)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (High Speed)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Eco Mode)</option>
              </select>
            </div>

            {/* Interactive Clickable Connection Status Toggle */}
            <button
              type="button"
              onClick={handleToggleGeminiStatus}
              title="Click to toggle Connected / Disconnected state"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                store.geminiStatus === "connected"
                  ? "bg-[var(--color-bullish-dim)] text-[var(--color-bullish)] border border-[var(--color-bullish)]/30 hover:bg-[var(--color-bearish-dim)] hover:text-[var(--color-bearish)]"
                  : store.geminiStatus === "disconnected"
                  ? "bg-[var(--color-bearish-dim)] text-[var(--color-bearish)] border border-[var(--color-bearish)]/30 hover:bg-[var(--color-bullish-dim)] hover:text-[var(--color-bullish)]"
                  : "bg-[var(--color-bg-overlay)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
              }`}
            >
              {store.geminiStatus === "connected" ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                  <Power className="w-3 h-3 ml-1 opacity-70" />
                </>
              ) : store.geminiStatus === "disconnected" ? (
                <>
                  <XCircle className="w-3 h-3" />
                  <span>DISCONNECTED</span>
                  <Power className="w-3 h-3 ml-1 opacity-70" />
                </>
              ) : (
                <span>UNTESTED (CLICK TO TOGGLE)</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
            Gemini API Key
          </label>
          <div className="relative flex items-center">
            <input
              type={showGeminiKey ? "text" : "password"}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-9 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Test Connection Action */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleTestGemini}
            disabled={isTestingGemini}
            className="px-3.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs font-semibold border border-[var(--color-border-subtle)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isTestingGemini ? (
              <span>Testing Connection...</span>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Gemini Connection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── 3. Refresh Interval Settings ────────────────────────────────────── */}
      <div className="card p-5 space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border-subtle)] pb-3">
          <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[var(--color-text-primary)]">
              Data Stream Refresh Interval
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Controls dashboard price streams, portfolio updates, positions, and AI analysis loop rates
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
            Select Refresh Frequency
          </label>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value) as RefreshInterval)}
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2.5 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none cursor-pointer"
          >
            <option value={1}>1 Second (Ultra-High Speed)</option>
            <option value={2}>2 Seconds (High Speed)</option>
            <option value={3}>3 Seconds (Fast)</option>
            <option value={5}>5 Seconds (Default Standard)</option>
            <option value={10}>10 Seconds (Balanced)</option>
            <option value={15}>15 Seconds (Low Bandwidth)</option>
            <option value={30}>30 Seconds (Eco Mode)</option>
            <option value={60}>60 Seconds (1 Minute)</option>
          </select>

          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed bg-[var(--color-bg-base)] p-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
            💡 <strong>Dynamic Application:</strong> Changing this setting instantly updates all active price streams, portfolio tracking loops, open position P&L calculations, and orderbook updates without requiring a page reload.
          </p>
        </div>
      </div>

      {/* ─── 4. Risk Management Parameters ───────────────────────────────────── */}
      <div className="card p-5 space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border-subtle)] pb-3">
          <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-sideways-dim)] text-[var(--color-sideways)] border border-[var(--color-sideways)]/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[var(--color-text-primary)]">
              Risk Management Parameters
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Personal risk thresholds & loss circuit breakers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Max Risk Per Trade */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Max Risk Per Trade (%)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10.0"
                value={tradePct}
                onChange={(e) => setTradePct(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-7 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
              />
              <span className="absolute right-3 font-semibold text-[var(--color-text-muted)]">%</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Recommended: 1.0%</span>
          </div>

          {/* Max Daily Loss */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Max Daily Loss Limit (%)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20.0"
                value={dailyPct}
                onChange={(e) => setDailyPct(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-7 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
              />
              <span className="absolute right-3 font-semibold text-[var(--color-text-muted)]">%</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] block">24h Circuit breaker</span>
          </div>

          {/* Max Weekly Loss */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--color-text-primary)] block">
              Max Weekly Loss Limit (%)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="1.0"
                min="1.0"
                max="40.0"
                value={weeklyPct}
                onChange={(e) => setWeeklyPct(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 pr-7 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] outline-none"
              />
              <span className="absolute right-3 font-semibold text-[var(--color-text-muted)]">%</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Weekly trading halt</span>
          </div>
        </div>
      </div>

      {/* ─── Actions Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold border border-[var(--color-border-subtle)] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>

        <button
          type="submit"
          disabled={!isChanged || isPending}
          className={`px-5 py-2.5 rounded-[var(--radius-md)] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer ${
            !isChanged || isPending
              ? "bg-[var(--color-bg-overlay)] text-[var(--color-text-disabled)] cursor-not-allowed border border-[var(--color-border-subtle)]"
              : "bg-[var(--color-brand-500)] text-white hover:bg-blue-600 shadow-[var(--shadow-brand-glow)]"
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
