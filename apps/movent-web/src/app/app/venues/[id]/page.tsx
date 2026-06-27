'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BookOpen, CalendarDays, MapPin, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const roomSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  capacity: z.coerce.number().int().positive('Kapasitas harus berupa angka positif'),
  pointCost: z.coerce.number().int().nonnegative('Biaya poin tidak boleh negatif'),
});
type RoomForm = {
  name: string;
  capacity: number;
  pointCost: number;
};

const bookingSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});
type BookingForm = z.infer<typeof bookingSchema>;

interface Room {
  id: string;
  name: string;
  capacity: number;
  status: string;
  pointCost: number;
}

interface Booking {
  id: string;
  title?: string;
  roomId?: string;
  startAt: string;
  endAt: string;
  status: string;
}

export default function PlaceDetailPage() {
  const params = useParams<{ id: string }>();
  const facilityId = params?.id;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [placeName, setPlaceName] = useState('');
  const [placeData, setPlaceData] = useState<{
    address?: string | undefined;
    status?: string | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roomsRef = useRef<Room[]>([]);

  const {
    register: regRoom,
    handleSubmit: handleRoom,
    reset: resetRoom,
    formState: { errors: roomErr },
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: { capacity: 10, pointCost: 0 },
  });

  const {
    register: regBook,
    handleSubmit: handleBook,
    reset: resetBook,
    setValue: setBookValue,
    formState: { errors: bookErr },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  async function loadData() {
    if (!facilityId) return;
    setLoading(true);
    try {
      const [facRes, roomsRes, bookRes] = await Promise.all([
        fetch('/api/v1/spatial/facilities').then((r) => r.json()),
        fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`).then((r) => r.json()),
        fetch('/api/v1/spatial/bookings').then((r) => r.json()),
      ]);
      const facs = (facRes || []) as Array<{
        id: string;
        name?: string;
        address?: string;
        status?: string;
      }>;
      const fac = facs.find((f) => f.id === facilityId);
      if (fac) {
        setPlaceName(fac.name || facilityId);
        setPlaceData({ address: fac.address, status: fac.status });
      }
      setRooms(roomsRes || []);
      roomsRef.current = roomsRes || [];
      const currentRooms = roomsRef.current || [];
      const bks = (bookRes || []) as Booking[];
      setBookings(bks.filter((b) => !b.roomId || currentRooms.some((r) => r.id === b.roomId)));
    } catch {
      setError('Gagal memuat detail venue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [facilityId]);

  async function onCreateRoom(data: RoomForm) {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, name: data.name, capacity: data.capacity, pointCost: data.pointCost }),
    });
    if (res.ok) {
      resetRoom();
      setRoomDialogOpen(false);
      await loadData();
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error?.message || 'Gagal membuat ruangan');
    }
    setSubmitting(false);
  }

  async function onCreateBooking(data: BookingForm) {
    setSubmitting(true);
    setError(null);
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const res = await fetch('/api/v1/spatial/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: data.roomId,
        startsAt: new Date(data.startsAt).toISOString(),
        endsAt: new Date(data.endsAt).toISOString(),
        title: data.title,
        idempotencyKey,
      }),
    });
    if (res.ok) {
      resetBook();
      setBookingDialogOpen(false);
      await loadData();
    } else if (res.status === 409) {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Jadwal bentrok: waktu tumpang tindih dengan pemesanan yang ada');
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Gagal membuat pemesanan');
    }
    setSubmitting(false);
  }

  function openBookingForRoom(roomId?: string) {
    if (roomId) setBookValue('roomId', roomId);
    setBookingDialogOpen(true);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/app/venues"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Venue
        </Link>
      </div>

      {/* Place header */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-xl" />
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{placeName || 'Venue'}</h1>
              {placeData?.status && <StatusBadge status={placeData.status} />}
            </div>
            {placeData?.address && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {placeData.address}
              </p>
            )}
            <p className="mt-2 border-t border-border/40 pt-2 text-xs text-muted-foreground/70">
              Venue ini terhubung dengan Event, Organisasi, dan Aktivitas Partisipasi Komunitas.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: BookOpen,
            label: 'Ruangan',
            val: rooms.length,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            icon: CalendarDays,
            label: 'Pemesanan',
            val: bookings.length,
            color: 'from-blue-500 to-indigo-600',
          },
          {
            icon: Users,
            label: 'Ruangan Aktif',
            val: rooms.filter((r) => r.status === 'active').length,
            color: 'from-violet-500 to-purple-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border/60 p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Spaces / Rooms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Ruangan di Venue Ini</h2>
          <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-8 border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-xs text-white"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Tambah Ruangan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Ruangan Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRoom(onCreateRoom)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>
                    Nama Ruangan <span className="text-destructive">*</span>
                  </Label>
                  <Input {...regRoom('name')} placeholder="Ruang Rapat A" />
                  {roomErr.name && (
                    <p className="text-xs text-destructive">{roomErr.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Kapasitas (Orang)</Label>
                    <Input type="number" {...regRoom('capacity')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Biaya Sewa (Poin)</Label>
                    <Input type="number" {...regRoom('pointCost')} placeholder="0" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setRoomDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                  >
                    {submitting ? 'Membuat…' : 'Tambah Ruangan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
          {rooms.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-30" />
              <p className="text-sm">Belum ada ruangan. Tambahkan satu untuk memulai pemesanan.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {rooms.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{r.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">Kapasitas: {r.capacity} orang</span>
                      {r.pointCost > 0 && (
                        <span className="ml-2.5 rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          ✨ {r.pointCost.toLocaleString('id-ID')} Poin
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => openBookingForRoom(r.id)}
                    >
                      Pesan Ruangan Ini
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bookings Calendar */}
      <div className="space-y-3">
        <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-xl border border-border/60 p-6 shadow-sm sm:flex-row">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Penjadwalan & Pemesanan Venue</h3>
            <p className="text-xs text-muted-foreground">
              Lihat kalender pemesanan lengkap, kelola bentrok jadwal, dan pesan ruangan di venue ini.
            </p>
          </div>
          <Link href={`/app/bookings?facilityId=${facilityId}`} className="shrink-0">
            <Button size="sm" className="bg-gradient-brand border-0 text-white shadow-sm">
              Buka Kalender →
            </Button>
          </Link>
        </div>
      </div>

      {/* Cross-link */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span>
          Venue ini terhubung melalui partisipasi ke Event dan Organisasi.
        </span>
        <Link href="/app/events" className="ml-3 shrink-0 font-medium text-primary hover:underline">
          Lihat Event Terhubung →
        </Link>
      </div>
    </div>
  );
}
