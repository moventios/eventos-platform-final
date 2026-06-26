'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookingCalendar } from '@/components/booking-calendar';
import { StatusBadge } from '@/components/status-badge';

const roomSchema = z.object({
  name: z.string().min(1, 'Name required'),
  capacity: z.coerce.number().int().positive(),
});

type RoomForm = z.infer<typeof roomSchema>;

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
}

interface Booking {
  id: string;
  title?: string;
  roomId?: string;
  startAt: string;
  endAt: string;
  status: string;
}

export default function FacilityDetailPage() {
  const params = useParams<{ id: string }>();
  const facilityId = params?.id;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilityName, setFacilityName] = useState('');
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roomsRef = useRef<Room[]>([]);

  const { register: regRoom, handleSubmit: handleRoom, reset: resetRoom, formState: { errors: roomErr } } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: { capacity: 10 },
  });

  const { register: regBook, handleSubmit: handleBook, reset: resetBook, setValue: setBookValue, formState: { errors: bookErr } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  async function loadData() {
    if (!facilityId) return;
    try {
      const [facRes, roomsRes, bookRes] = await Promise.all([
        fetch('/api/v1/spatial/facilities').then(r => r.json()),
        fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`).then(r => r.json()),
        fetch('/api/v1/spatial/bookings').then(r => r.json()),
      ]);
      const fac = (facRes as any[]).find((f: any) => f.id === facilityId);
      if (fac) setFacilityName(fac.name || facilityId);
      setRooms(roomsRes || []);
      roomsRef.current = roomsRes || [];
      // bookings normalized by server API now
      const currentRooms = roomsRef.current || [];
      setBookings((bookRes || []).filter((b: any) => !b.roomId || currentRooms.some((r: any) => r.id === b.roomId) ));
    } catch {}
  }

  useEffect(() => { loadData(); }, [facilityId]);

  async function onCreateRoom(data: RoomForm) {
    setSubmitting(true); setError(null);
    const res = await fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, name: data.name, capacity: data.capacity }),
    });
    if (res.ok) {
      resetRoom();
      setRoomDialogOpen(false);
      await loadData();
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error?.message || 'Failed to create room');
    }
    setSubmitting(false);
  }

  async function onCreateBooking(data: BookingForm) {
    setSubmitting(true); setError(null);
    // generate simple idempotencyKey
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const payload = {
      roomId: data.roomId,
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
      title: data.title,
      idempotencyKey,
    };
    const res = await fetch('/api/v1/spatial/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetBook();
      setBookingDialogOpen(false);
      await loadData();
    } else if (res.status === 409) {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Booking conflict: time range overlaps with existing booking');
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Failed to create booking');
    }
    setSubmitting(false);
  }

  function openBookingForRoom(roomId?: string) {
    if (roomId) setBookValue('roomId', roomId);
    setBookingDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <a href="/facilities" className="text-sm text-muted-foreground hover:underline">← Back to Facilities</a>
        <h1 className="text-2xl font-semibold mt-1">{facilityName || 'Facility'} <span className="text-sm text-muted-foreground">({facilityId})</span></h1>
      </div>

      {error && <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Rooms</h2>
        <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Room</DialogTitle></DialogHeader>
            <form onSubmit={handleRoom(onCreateRoom)} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input {...regRoom('name')} />
                {roomErr.name && <p className="text-xs text-destructive">{roomErr.name.message}</p>}
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" {...regRoom('capacity')} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Create Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded border">
        {rooms.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No rooms yet. Add one above.</div>
        ) : (
          <ul className="divide-y">
            {rooms.map(r => (
              <li key={r.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-muted-foreground">cap {r.capacity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <Button size="sm" variant="outline" onClick={() => openBookingForRoom(r.id)}>Book this room</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Bookings for this facility</h2>
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">New Booking</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
            <form onSubmit={handleBook(onCreateBooking)} className="space-y-3">
              <div>
                <Label>Room ID (select from list or paste)</Label>
                <Input {...regBook('roomId')} placeholder="room uuid" />
                {bookErr.roomId && <p className="text-xs text-destructive">{bookErr.roomId.message}</p>}
              </div>
              <div>
                <Label>Title</Label>
                <Input {...regBook('title')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Starts At</Label>
                  <Input type="datetime-local" {...regBook('startsAt')} />
                </div>
                <div>
                  <Label>Ends At</Label>
                  <Input type="datetime-local" {...regBook('endsAt')} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Submit Booking</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border p-4">
        <BookingCalendar
          bookings={bookings}
          onSelectSlot={(info) => {
            if (rooms[0]) setBookValue('roomId', rooms[0].id);
            // prefill approximate; user can adjust
            const s = info.start.slice(0,16);
            const e = info.end.slice(0,16);
            setBookValue('startsAt', s);
            setBookValue('endsAt', e);
            setBookingDialogOpen(true);
          }}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Note: Select a room above to prefill, or enter roomId. Conflicts return 409 and are shown here.
      </div>
    </div>
  );
}
