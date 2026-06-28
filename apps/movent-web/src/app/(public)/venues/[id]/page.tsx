'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, KeyRound, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Venue = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  status: string;
};

type Room = {
  id: string;
  name: string;
  capacity: number;
  status: string;
  pointCost: number;
};

export default function PublicVenueDetailPage() {
  const params = useParams<{ id: string }>();
  const venueId = params?.id;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [points, setPoints] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<Record<string, { startsAt: string, endsAt: string }>>({});

  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/spatial/facilities/${venueId}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not_found');
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then((data: Venue & { rooms?: Room[] }) => {
        setVenue(data);
        setRooms(data.rooms || []);
      })
      .catch((err) => {
        if (err?.message === 'not_found') {
          setError('Venue tidak ditemukan.');
        } else {
          setError('Gagal memuat detail venue.');
        }
      })
      .finally(() => setLoading(false));

    fetch('/api/v1/commerce/points')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('Not auth');
      })
      .then((data) => {
        if (data) setPoints(data.ownBalance ?? data.account?.balance ?? 0);
      })
      .catch(() => setPoints(null));

  }, [venueId]);

  const handleCheckout = async (room: Room) => {
    const form = bookingForm[room.id];
    if (!form?.startsAt || !form?.endsAt) {
      alert('Silakan pilih waktu mulai dan selesai penyewaan.');
      return;
    }
    
    if (new Date(form.startsAt) >= new Date(form.endsAt)) {
      alert('Waktu selesai harus lebih dari waktu mulai.');
      return;
    }

    if (points === null || points < room.pointCost) {
      alert('Saldo Koin tidak mencukupi!');
      return;
    }
    
    setCheckoutLoading(room.id);
    try {
      const res = await fetch('/api/v1/commerce/checkout/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room.id,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
          title: `Sewa ${room.name}`,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses penyewaan');
      
      alert('Ruangan berhasil disewa! Silakan cek menu Ruang & Aset di Dasbor Anda.');
      window.location.href = '/app/bookings'; // redirect to booking dashboard
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
          href="/venues"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Daftar Venue
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
      ) : venue ? (
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{venue.name}</h1>
                  <StatusBadge status={venue.status} />
                </div>
                {venue.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {venue.address}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 shrink-0">
                <MapPin className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tentang Venue</h3>
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                {venue.description || 'Tidak ada deskripsi.'}
              </p>
            </div>
          </div>

          {/* Rooms List */}
          {points !== null ? (
            <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Daftar Ruangan & Sewa
                </h3>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span>🪙</span>
                  <span>Saldo Anda: {points.toLocaleString('id-ID')} Koin</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((r) => (
                  <div key={r.id} className="border border-border p-5 rounded-xl flex flex-col gap-4 hover:border-teal-500/30 transition-colors bg-background">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{r.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Kapasitas: {r.capacity} orang</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={r.status} />
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2">
                          🪙 {r.pointCost === 0 ? 'Gratis' : r.pointCost}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-border mt-auto">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Waktu Mulai</label>
                          <input 
                            type="datetime-local" 
                            className="w-full text-xs p-2 rounded-md border border-border bg-background text-foreground"
                            value={bookingForm[r.id]?.startsAt || ''}
                            onChange={(e) => setBookingForm({ ...bookingForm, [r.id]: { ...bookingForm[r.id], startsAt: e.target.value }})}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Waktu Selesai</label>
                          <input 
                            type="datetime-local" 
                            className="w-full text-xs p-2 rounded-md border border-border bg-background text-foreground"
                            value={bookingForm[r.id]?.endsAt || ''}
                            onChange={(e) => setBookingForm({ ...bookingForm, [r.id]: { ...bookingForm[r.id], endsAt: e.target.value }})}
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                        disabled={r.status !== 'available' || checkoutLoading === r.id}
                        onClick={() => handleCheckout(r)}
                      >
                        {checkoutLoading === r.id ? 'Memproses...' : r.status !== 'available' ? 'Tidak Tersedia' : `Sewa dengan ${r.pointCost} Koin`}
                      </Button>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">Belum ada ruangan yang tersedia di fasilitas ini.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border hover:border-teal-500/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                  <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Penyewaan Fasilitas Diperlukan
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Untuk melihat ketersediaan ruangan dan melakukan pemesanan (booking), silakan masuk ke Ruang Kerja Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                    Masuk untuk Memesan
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
