'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, KeyRound, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  metadata?: { slug?: string; category?: string; organizer?: string };
  _slug?: string; // canonical slug returned by API
};

type PassTier = {
  id: string;
  name: string;
  price: string;
  capacity: number;
  quantityIssued: number;
  pointCost: number;
};

export default function PublicEventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const router = useRouter();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [points, setPoints] = useState<number | null>(null);
  const [tiers, setTiers] = useState<PassTier[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    
    fetch(`/api/v1/commerce/events/${eventId}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not_found');
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then((data: Event) => {
        setEvent(data);
        // If accessed by UUID but has a canonical slug, redirect for SEO
        const slug = data._slug || data.metadata?.slug;
        if (slug && slug !== eventId) {
          router.replace(`/events/${slug}`, { scroll: false });
        }
      })
      .catch((err) => {
        if (err?.message === 'not_found') {
          setError('Event tidak ditemukan.');
        } else {
          setError('Gagal memuat data event.');
        }
      })
      .finally(() => setLoading(false));

    // Optimistically fetch tiers and points
    fetch(`/api/v1/commerce/events/${eventId}/pass-tiers?eventId=${eventId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTiers(data || []))
      .catch(() => {});

    fetch('/api/v1/commerce/points')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('Not auth');
      })
      .then((data) => {
        if (data) setPoints(data.ownBalance ?? data.account?.balance ?? 0);
      })
      .catch(() => setPoints(null));

  }, [eventId]);

  const handleCheckout = async (tier: PassTier) => {
    if (points === null || points < tier.pointCost) {
      alert('Saldo Koin tidak mencukupi!');
      return;
    }
    
    setCheckoutLoading(tier.id);
    try {
      const res = await fetch('/api/v1/commerce/checkout/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passTierId: tier.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses tiket');
      
      alert('Tiket berhasil diklaim! Silakan cek menu Tiket Masuk di Dasbor Anda.');
      router.push('/app/passes');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1 bg-background text-foreground">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/events"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Jadwal Event
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : event ? (
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{event.name}</h1>
                  <StatusBadge status={event.status} />
                </div>
                {event.startsAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {new Date(event.startsAt).toLocaleString('id-ID', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })} WIB
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 shrink-0">
                <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tentang Event</h3>
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                {event.description || 'Tidak ada deskripsi.'}
              </p>
            </div>
          </div>

          {/* Ticketing Section */}
          {points !== null ? (
            <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Tiket & Pendaftaran
                </h3>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span>🪙</span>
                  <span>Saldo Anda: {points.toLocaleString('id-ID')} Koin</span>
                </div>
              </div>

              {tiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada tiket yang tersedia untuk event ini.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tiers.map((t) => (
                    <div key={t.id} className="border border-border/80 rounded-xl p-5 hover:border-teal-500/30 transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-foreground text-lg">{t.name}</h4>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                            🪙 {t.pointCost === 0 ? 'Gratis' : t.pointCost}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Stok: {t.capacity - t.quantityIssued}/{t.capacity}</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4">
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                          disabled={t.capacity - t.quantityIssued <= 0 || checkoutLoading === t.id}
                          onClick={() => handleCheckout(t)}
                        >
                          {checkoutLoading === t.id ? 'Memproses...' : t.capacity - t.quantityIssued <= 0 ? 'Habis (Sold Out)' : t.pointCost === 0 ? 'Klaim Gratis' : `Beli dengan ${t.pointCost} Koin`}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border hover:border-teal-500/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                  <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Pendaftaran & Tiket Diperlukan
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Untuk menghadiri event ini, mengklaim tiket masuk, atau memverifikasi kehadiran di lokasi, silakan masuk ke Ruang Kerja Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                    Masuk untuk Hadir
                  </Button>
                </Link>
                <Link href="/login?tab=register" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-border bg-background hover:bg-accent text-foreground">
                    Daftar Baru
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
