"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string | null;
  role: string;
  isMasterOrAdmin: boolean;
  isSalesOrAbove: boolean;
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-terracotta text-white shadow-sm"
          : "text-muted hover:bg-warm hover:text-dark"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

export function DashboardShell({ children, userName, role, isMasterOrAdmin, isSalesOrAbove }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
      {isSalesOrAbove && <NavItem href="/dashboard/quotes" icon={FileText} label="Quotes" />}
      {isMasterOrAdmin && <NavItem href="/dashboard/admin/products" icon={Package} label="Products" />}
      <NavItem href="/dashboard/shopping" icon={ShoppingCart} label="Shopping" />
    </nav>
  );

  return (
    <div className="min-h-screen bg-warm flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-cream border-r border-stone/20 shrink-0">
        <div className="px-6 py-5 border-b border-stone/20">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Super Crown" className="h-8 w-auto object-contain" style={{ mixBlendMode: "multiply" }} />
          </Link>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          {nav}
        </div>

        <div className="px-4 py-4 border-t border-stone/20">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-dark truncate">{userName || "Team"}</p>
            <p className="text-xs text-muted uppercase tracking-wider">{role}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-dark hover:bg-warm rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-cream border-b border-stone/20 flex items-center justify-between px-4 h-14">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Super Crown" className="h-7 w-auto object-contain" style={{ mixBlendMode: "multiply" }} />
        </Link>
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-muted hover:text-dark transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-dark/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-cream border-b border-stone/20 p-4" onClick={(e) => e.stopPropagation()}>
            {nav}
            <div className="mt-4 pt-4 border-t border-stone/20">
              <p className="text-sm font-medium text-dark px-4 mb-1">{userName || "Team"}</p>
              <p className="text-xs text-muted uppercase tracking-wider px-4 mb-3">{role}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-dark hover:bg-warm rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:overflow-y-auto">
        <div className="pt-14 md:pt-0 px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
