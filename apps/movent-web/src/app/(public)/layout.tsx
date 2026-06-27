'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Users, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const publicNavItems = [
  { href: '/events', label: 'Event', icon: Calendar },
  { href: '/venues', label: 'Venue', icon: Building2 },
  { href: '/organizations', label: 'Organisasi', icon: Users },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-800 dark:selection:text-teal-200">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 flex h-8 w-8 items-center justify-center rounded-xl shadow-md shadow-teal-500/10 transition-transform group-hover:scale-105">
                  <span className="text-sm font-bold text-white">M</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Moventios
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                {publicNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 ${
                        isActive ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4 opacity-70" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <DarkModeToggle />
              <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Masuk
              </Link>
              <Link href="/login?tab=register">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-600/10 rounded-lg">
                  Mulai Sekarang
                </Button>
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <DarkModeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-md p-4 space-y-3 absolute top-16 left-0 w-full animate-fade-in">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm text-muted-foreground hover:text-foreground">
                Masuk
              </Link>
              <Link href="/login?tab=register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white">
                  Mulai Sekarang
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 flex h-6 w-6 items-center justify-center rounded-lg">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span className="text-md font-bold tracking-tight text-foreground">Moventios</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Platform manajemen event dan pemesanan venue komunitas mandiri yang aman, andal, dan transparan.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Direktori</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/events" className="hover:text-foreground">Jadwal Event</Link></li>
                <li><Link href="/venues" className="hover:text-foreground">Daftar Venue</Link></li>
                <li><Link href="/organizations" className="hover:text-foreground">Daftar Organisasi</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Produk</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/app" className="hover:text-foreground">Mission Control</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Pendaftaran Ruang Kerja</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Legal & Hubungi</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
                <li><Link href="/policy" className="hover:text-foreground">Kebijakan Privasi</Link></li>
                <li><Link href="/about" className="hover:text-foreground">Tentang Kami</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground">
              © {new Date().getFullYear()} Moventios. Semua hak cipta dilindungi.
            </p>
            <div className="flex gap-4 text-[10px] text-muted-foreground">
              <Link href="/policy" className="hover:underline">Kebijakan Privasi</Link>
              <Link href="/terms" className="hover:underline">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
      {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}
