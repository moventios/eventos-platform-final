'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Plus, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

type Organization = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
};

function PublicOrganizationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('search') || '').toLowerCase();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredOrgs = q
    ? orgs.filter(
        (o) =>
          (o.name || '').toLowerCase().includes(q) ||
          (o.slug || '').toLowerCase().includes(q),
      )
    : orgs;

  const fetchOrgs = () => {
    setLoading(true);
    setError(null);
    fetch('/api/v1/iam/tenants')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrgs(data || []))
      .catch(() => {
        setOrgs([]);
        setError('Could not load organizations.');
      })
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val);
    else params.delete('search');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Organizations Matrix</h1>
          <p className="mt-1 text-sm text-slate-400">
            Discover community organizers, event hosts, and sovereign workspace domains in the network.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search organizations..."
          defaultValue={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 text-sm bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
        />
      </div>

      {/* Grid of Orgs */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-40 w-full rounded-2xl bg-slate-800/40" />
          <Skeleton className="h-40 w-full rounded-2xl bg-slate-800/40" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-950/20 rounded-2xl border border-slate-850">
          <Users className="mx-auto mb-4 h-10 w-10 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">No organizations found</p>
          <p className="text-xs text-slate-500 mt-1">Try a different search or register a new workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-teal-500 font-bold uppercase tracking-wider">
                    {org.slug}.movent.io
                  </span>
                  <StatusBadge status={org.isActive ? 'active' : 'inactive'} />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight truncate">
                  {org.name}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                  Verified Node
                </span>
                <span className="font-mono text-[9px] truncate max-w-[120px]">
                  {org.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-teal-950/40 to-emerald-950/30 border border-teal-500/20 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Radio className="h-5 w-5 text-teal-400" />
            Launch Your Community Node
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Register your own sovereign organization space to host events, issue tickets, map physical venues, and invite team members.
          </p>
        </div>
        <div className="w-full md:w-auto shrink-0">
          <Link href="/login?tab=register">
            <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl">
              Register Organization <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PublicOrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl bg-slate-800/40" />
          <Skeleton className="h-64 w-full rounded-xl bg-slate-800/40" />
        </div>
      }
    >
      <PublicOrganizationsContent />
    </Suspense>
  );
}
