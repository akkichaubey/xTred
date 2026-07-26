"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Globe,
  Newspaper,
  Waves,
  BarChart3,
  Link2,
  Bell,
  Settings,
  BookOpen,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/macro", label: "Macro", icon: Globe },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/flows", label: "Flows", icon: Waves },
  { href: "/derivatives", label: "Derivatives", icon: BarChart3 },
  { href: "/onchain", label: "On-chain", icon: Link2 },
];

const bottomNavItems = [
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn("sidebar-nav-item", isActive && "sidebar-nav-item--active")}
    >
      <Icon size={16} className="sidebar-nav-icon" />
      <span className="sidebar-nav-label">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="sidebar-nav-badge">{badge > 99 ? "99+" : badge}</span>
      )}
    </Link>
  );
}

function LogoutButton() {
  const [, formAction, isPending] = useActionState(
    async () => { await logoutAction(); return null; },
    null
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="sidebar-logout-btn"
        title="Sign out"
      >
        <LogOut size={15} />
        <span>Sign out</span>
      </button>
    </form>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 22L14 10L20 16L26 8"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="10" r="2" fill="#10b981" />
            <circle cx="20" cy="16" r="2" fill="#f59e0b" />
            <circle cx="26" cy="8" r="2" fill="#ef4444" />
          </svg>
        </div>
        <div>
          <div className="sidebar-brand-name">xTred</div>
          <div className="sidebar-brand-tag">AI Trading Intelligence</div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="sidebar-live-row">
        <span className="live-dot" />
        <span className="sidebar-live-text">Live Market Feed</span>
        <Zap size={10} style={{ color: "var(--color-bullish)", marginLeft: "auto" }} />
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="sidebar-nav-group">
          <span className="sidebar-nav-group-label">Analysis</span>
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="sidebar-nav-group" style={{ marginTop: "auto" }}>
          <span className="sidebar-nav-group-label">Tools</span>
          {bottomNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <LogoutButton />
        <div className="sidebar-version">v0.1.0 · Phase 1</div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--spacing-sidebar);
          background: var(--color-bg-surface);
          border-right: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          z-index: var(--z-sidebar);
          overflow: hidden;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1rem 0.875rem;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .sidebar-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-brand-name {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .sidebar-brand-tag {
          font-size: 0.625rem;
          color: var(--color-text-muted);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .sidebar-live-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.04);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .sidebar-live-text {
          font-size: 0.6875rem;
          color: var(--color-bullish);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0.75rem 0.5rem;
          gap: 1.25rem;
          overflow-y: auto;
        }

        .sidebar-nav-group {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .sidebar-nav-group-label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-text-disabled);
          padding: 0 0.5rem 0.4rem;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5rem 0.625rem;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 150ms ease, color 150ms ease;
          position: relative;
        }

        .sidebar-nav-item:hover {
          background: var(--color-bg-overlay);
          color: var(--color-text-primary);
        }

        .sidebar-nav-item--active {
          background: rgba(59, 130, 246, 0.12);
          color: var(--color-brand-400);
        }

        .sidebar-nav-item--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: var(--color-brand-500);
          border-radius: 0 2px 2px 0;
        }

        .sidebar-nav-icon {
          flex-shrink: 0;
          opacity: 0.8;
        }

        .sidebar-nav-label {
          flex: 1;
        }

        .sidebar-nav-badge {
          font-size: 0.625rem;
          font-weight: 600;
          background: var(--color-alert-critical);
          color: white;
          padding: 1px 5px;
          border-radius: var(--radius-full);
          min-width: 18px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 0.75rem 0.5rem;
          border-top: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.4375rem 0.625rem;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.8125rem;
          cursor: pointer;
          transition: background 150ms ease, color 150ms ease;
        }

        .sidebar-logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: var(--color-bearish);
        }

        .sidebar-version {
          font-size: 0.625rem;
          color: var(--color-text-disabled);
          text-align: center;
          letter-spacing: 0.04em;
        }
      `}</style>
    </aside>
  );
}
