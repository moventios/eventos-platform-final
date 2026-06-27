'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Shield, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

const publicNavItems = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/venues', label: 'Venues', icon: Building2 },
  { href: '/organizations', label: 'Organizations', icon: Users },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 flex h-8 w-8 items-center justify-center rounded-xl shadow-md shadow-teal-500/10 transition-transform group-hover:scale-105">
                  <span className="text-sm font-bold text-white">M</span>
                </div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
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
                      className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5 ${
                        isActive ? 'text-teal-400 font-semibold' : 'text-slate-400'
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
              <Link href="/login" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                Sign In
              </Link>
              <Link href="/login?tab=register">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-600/10 rounded-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900/95 p-4 space-y-3 absolute top-16 left-0 w-full animate-fade-in">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <hr className="border-slate-800 my-2" />
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm text-slate-400 hover:text-white">
                Sign In
              </Link>
              <Link href="/login?tab=register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white">
                  Get Started
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
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 flex h-6 w-6 items-center justify-center rounded-lg">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <span className="text-md font-bold tracking-tight text-white">Moventios</span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                The open event operating desktop and community collaboration matrix. Built on robust sovereign infrastructure.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Directories</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/events" className="hover:text-slate-300">Public Events</Link></li>
                <li><Link href="/venues" className="hover:text-slate-300">Ecosystem Venues</Link></li>
                <li><Link href="/organizations" className="hover:text-slate-300">Organizations Matrix</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Product</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/app" className="hover:text-slate-300">Mission Control</Link></li>
                <li><Link href="/login" className="hover:text-slate-300">Tenant Registration</Link></li>
                <li><a href="#" className="hover:text-slate-300">Pricing Model</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Legal & Ops</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#" className="hover:text-slate-300">Platform Terms</a></li>
                <li><a href="#" className="hover:text-slate-300">Sovereign Hosting</a></li>
                <li><a href="#" className="hover:text-slate-300">Security Constitutions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-600">
              © {new Date().getFullYear()} Moventios & Movent Infrastructure. All rights reserved.
            </p>
            <div className="flex gap-4 text-[10px] text-slate-600">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
