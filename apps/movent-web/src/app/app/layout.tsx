'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';
import {
  Bell,
  BookOpen,
  Calendar,
  Compass,
  FolderKanban,
  MapPin,
  MessageSquare,
  Moon,
  Radio,
  Shield,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { Building2, CalendarDays, LayoutDashboard, Settings, Ticket } from 'lucide-react';

const primaryNavItems = [
  { href: '/app', label: 'Dasbor Kontrol', icon: LayoutDashboard, exact: true },
];

const operationsNavItems = [
  { href: '/app/passes', label: 'Tiket Masuk', icon: Ticket },
  { href: '/app/bookings', label: 'Pemesanan Ruangan', icon: CalendarDays },
];

const assetsNavItems = [
  { href: '/app/events', label: 'Kelola Event', icon: Calendar },
  { href: '/app/venues', label: 'Kelola Venue', icon: Building2 },
];

const governanceNavItems = [{ href: '/app/approvals', label: 'Antrean Persetujuan', icon: Shield }];

const managementNavItems = [
  { href: '/app/admin', label: 'Administrasi', icon: Settings },
  { href: '/app/admin/points', label: 'Kelola Koin', icon: Zap },
];

export default function EcosystemLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/app/approvals')) {
      fetch('/api/v1/workflow/approvals')
        .then((r) => r.json())
        .then((data: unknown[]) => setPendingCount(data.length))
        .catch(() => setPendingCount(0));
    } else {
      setPendingCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    fetch('/api/v1/commerce/points')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setPoints(data.ownBalance ?? data.account?.balance ?? 1000);
        }
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="bg-card flex w-56 shrink-0 flex-col border-r border-border/60 shadow-sm">
        {/* Brand */}
        <div className="border-b border-border/40 px-5 py-5">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="bg-gradient-brand flex h-7 w-7 items-center justify-center rounded-lg shadow-sm">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <span className="text-gradient text-[15px] font-bold">Moventios</span>
          </Link>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
              exact
            />
          ))}

          <NavSection label="Operasional">
            {operationsNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                pathname={pathname}
              />
            ))}
          </NavSection>

          <NavSection label="Aset">
            {assetsNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                pathname={pathname}
              />
            ))}
          </NavSection>

          <NavSection label="Tata Kelola">
            {governanceNavItems.map((item) => {
              const badgeCount =
                item.label === 'Antrean Persetujuan' && pendingCount > 0 ? pendingCount : undefined;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  pathname={pathname}
                  {...(badgeCount !== undefined ? { badge: badgeCount } : {})}
                />
              );
            })}
          </NavSection>

          <NavSection label="Manajemen">
            {managementNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                pathname={pathname}
              />
            ))}
          </NavSection>
        </div>
        {/* Sidebar footer */}
        <div className="border-t border-border/40 px-4 py-3">
          <p className="text-[10px] text-muted-foreground/60">© 2024 Moventios</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-card/60 flex items-center justify-between border-b border-border/60 px-6 py-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm font-semibold text-foreground">
                {[
                  { href: '/app', label: 'Dasbor Kontrol', exact: true },
                  { href: '/app/passes', label: 'Tiket Masuk' },
                  { href: '/app/bookings', label: 'Pemesanan Ruangan' },
                  { href: '/app/events', label: 'Kelola Event' },
                  { href: '/app/venues', label: 'Kelola Venue' },
                  { href: '/app/approvals', label: 'Antrean Persetujuan' },
                  { href: '/app/admin', label: 'Administrasi' },
                ].find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))
                  ?.label ?? 'Moventios'}
              </span>
              <span className="ml-2.5 hidden text-xs text-muted-foreground md:inline">
                Kelola ruang kerja komunitas Anda
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {points !== null && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span>🪙</span>
                <span>{points.toLocaleString('id-ID')} Koin</span>
              </div>
            )}
            <DarkModeToggle />
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Keluar
            </Link>
          </div>
        </header>
        <main className="animate-fade-in flex-1 overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-2">
      <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  badge,
  exact = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  badge?: number | undefined;
  exact?: boolean | undefined;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-3.5 w-3.5 shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground/70',
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="rounded-lg p-2 text-muted-foreground transition-all duration-150"
        aria-label="Toggle dark mode"
        disabled
      >
        <Moon className="h-4 w-4 opacity-0" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
