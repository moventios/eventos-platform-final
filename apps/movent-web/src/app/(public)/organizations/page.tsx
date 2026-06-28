'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

type Organization = {
  id: string;
  name: string;
  description?: string | null;
  metadata?: { slug?: string; city?: string; category?: string } | null;
  createdAt?: string;
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
          (o.metadata?.slug || '').toLowerCase().includes(q),
      )
    : orgs;

  const fetchOrgs = () => {
    setLoading(true);
    setError(null);
    fetch('/api/v1/public/organizations')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrgs(data || []))
      .catch(() => {
        setOrgs([]);
        setError('Gagal memuat daftar organisasi.');
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1 bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daftar Organisasi Komunitas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Temukan penyelenggara kegiatan, pengelola tempat kumpul, dan domain organisasi di dalam jaringan.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari organisasi..."
          defaultValue={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 text-sm bg-background border-border text-foreground placeholder-muted-foreground focus:border-teal-500 focus:ring-teal-500 rounded-xl"
        />
      </div>

      {/* Grid of Orgs */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-sm">
          <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground/60" />
          <p className="text-base font-semibold text-foreground">Organisasi tidak ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Coba cari dengan kata kunci lain atau daftarkan ruang kerja baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                    {org.metadata?.slug || org.id.slice(0, 8)}.movent.io
                  </span>
                  <StatusBadge status={'active'} />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight truncate">
                  {org.name}
                </h3>
                {org.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {org.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  Terverifikasi
                </span>
                <span className="font-mono text-[9px] truncate max-w-[120px]">
                  ID: {org.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-card border border-border hover:border-teal-500/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Radio className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Daftarkan Organisasi Anda
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mulai kelola event, buat tiket masuk, atur jadwal ruangan, dan undang anggota tim dengan membuat organisasi Anda sendiri.
          </p>
        </div>
        <div className="w-full md:w-auto shrink-0">
          <Link href="/login?tab=register">
            <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl">
              Daftar Organisasi <ArrowRight className="ml-2 h-4 w-4" />
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
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <PublicOrganizationsContent />
    </Suspense>
  );
}
