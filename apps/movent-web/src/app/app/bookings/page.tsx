'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookingCalendar } from '@/components/booking-calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarRange, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Booking = {
  id: string;
  title?: string;
  roomId?: string;
  facilityId?: string;
  startAt: string;
  endAt: string;
  status: string;
};

type Facility = {
  id: string;
  name: string;
  status: string;
};

type Room = {
  id: string;
  name: string;
  capacity: number;
  status: string;
};

const bookingSchema = z.object({
  facilityId: z.string().uuid('Facility required'),
  roomId: z.string().uuid('Space required'),
  title: z.string().min(1, 'Title is required').max(255),
  startsAt: z.string().min(1, 'Start time required'),
  endsAt: z.string().min(1, 'End time required'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedFacilityId = watch('facilityId');

  const loadData = async () => {
    try {
      const [bks, facs] = await Promise.all([
        fetch('/api/v1/spatial/bookings').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/v1/spatial/facilities').then((r) => (r.ok ? r.json() : [])),
      ]);
      setBookings(bks || []);
      setFacilities(facs || []);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch rooms when facility changes
  useEffect(() => {
    if (selectedFacilityId) {
      fetch(`/api/v1/spatial/facilities/${selectedFacilityId}/rooms`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setRooms)
        .catch(() => setRooms([]));
    } else {
      setRooms([]);
    }
  }, [selectedFacilityId]);

  const onSubmitBooking = async (values: BookingFormValues) => {
    setBookingError(null);
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = {
      roomId: values.roomId,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      title: values.title,
      notes: values.notes,
      idempotencyKey,
    };
    try {
      const res = await fetch('/api/v1/spatial/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        reset();
        setBookingOpen(false);
        await loadData();
      } else if (res.status === 409) {
        const e = await res.json().catch(() => ({}));
        setBookingError(e.error || 'Conflict detected. Room already reserved.');
      } else {
        const e = await res.json().catch(() => ({}));
        setBookingError(e.error?.message || 'Failed to submit booking.');
      }
    } catch {
      setBookingError('Failed to communicate with scheduler.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <CalendarRange className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Reservations</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Spatio-temporal scheduler and space allocations across venues
            </p>
          </div>
        </div>

        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-brand border-0 text-white shadow-sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Reserve Space
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reserve a Space / Room</DialogTitle>
            </DialogHeader>
            {bookingError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {bookingError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="facilityId">Venue</Label>
                <select
                  id="facilityId"
                  {...register('facilityId')}
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Venue</option>
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  ))}
                </select>
                {errors.facilityId && (
                  <p className="text-xs text-destructive">{errors.facilityId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roomId">Space / Room</Label>
                <select
                  id="roomId"
                  {...register('roomId')}
                  disabled={!selectedFacilityId}
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Space</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Cap: {r.capacity})
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="text-xs text-destructive">{errors.roomId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Reservation Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Meeting, Workshop, Session..."
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startsAt">Start Time</Label>
                  <Input id="startsAt" type="datetime-local" {...register('startsAt')} />
                  {errors.startsAt && (
                    <p className="text-xs text-destructive">{errors.startsAt.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endsAt">End Time</Label>
                  <Input id="endsAt" type="datetime-local" {...register('endsAt')} />
                  {errors.endsAt && (
                    <p className="text-xs text-destructive">{errors.endsAt.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" {...register('notes')} placeholder="Extra instructions..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBookingOpen(false);
                    setBookingError(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-brand border-0 text-white"
                >
                  {isSubmitting ? 'Submitting…' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Calendar Scheduler */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Interactive Booking Grid
        </h2>
        <div className="bg-card rounded-xl border border-border/60 p-4 shadow-sm">
          {loading ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : (
            <BookingCalendar
              bookings={bookings}
              onSelectSlot={(info) => {
                const startIso = new Date(info.start).toISOString().slice(0, 16);
                const endIso = new Date(info.end).toISOString().slice(0, 16);
                setValue('startsAt', startIso);
                setValue('endsAt', endIso);
                setBookingOpen(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
