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
};

export default function PublicVenueDetailPage() {
  const params = useParams<{ id: string }>();
  const venueId = params?.id;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [venueId]);

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

          {/* Spaces / Rooms */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Ruangan yang Tersedia</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {rooms.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-35" />
                  <p className="text-sm">Belum ada ruangan yang terdaftar di venue ini.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background">
                          <BookOpen className="h-4.5 w-4.5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">{room.name}</span>
                          <span className="ml-3 text-xs text-muted-foreground">Kapasitas: {room.capacity} orang</span>
                        </div>
                      </div>
                      <StatusBadge status={room.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Marketing/Conversion CTA Card */}
          <div className="bg-card border border-border hover:border-teal-500/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Pesan Ruangan di Venue Ini
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Untuk mengajukan pemesanan ruangan, melihat jadwal pemakaian, atau mengelola reservasi event, silakan masuk ke Ruang Kerja Anda.
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
        </div>
      ) : null}
    </div>
  );
}
