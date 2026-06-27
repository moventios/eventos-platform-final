'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { MapPin, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { BookingCalendar } from '@/components/booking-calendar';
import { DataTable } from '@/components/data-table';
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

interface Facility {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  address?: string;
  geoLat?: string;
  geoLng?: string;
  status: string;
  createdAt: string;
}

interface Booking {
  id: string;
  title?: string;
  roomId?: string;
  facilityId?: string;
  startAt: string;
  endAt: string;
  status: string;
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: ColumnDef<Facility>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue, row }) => (
      <div>
        <Link
          href={`/app/venues/${row.original.id}`}
          className="font-medium text-foreground transition-colors hover:text-primary"
        >
          {getValue<string>()}
        </Link>
        {row.original.description && (
          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return v ? (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="max-w-[200px] truncate">{v}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/app/venues/${row.original.id}`}
        className="text-xs font-medium text-primary hover:underline"
      >
        View →
      </Link>
    ),
  },
];

import { ResourcePageLayout } from '@/components/layout/resource-page';

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('search') || '').toLowerCase();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredFacilities = q
    ? facilities.filter(
        (f) =>
          (f.name || '').toLowerCase().includes(q) ||
          (f.address || '').toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q),
      )
    : facilities;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const bookingSchema = z.object({
    roomId: z.string().min(1, 'Room required'),
    title: z.string().optional(),
    startsAt: z.string().min(1, 'Start required'),
    endsAt: z.string().min(1, 'End required'),
  });
  type BookingFormValues = z.infer<typeof bookingSchema>;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const {
    register: regB,
    handleSubmit: handleB,
    reset: resetB,
    setValue: setBValue,
    formState: { errors: bErrors, isSubmitting: bSubmitting },
  } = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema) });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/v1/spatial/facilities').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/v1/spatial/bookings').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([facs, bks]) => {
        setFacilities(facs || []);
        setBookings(bks || []);
      })
      .catch(() => {
        setFacilities([]);
        setBookings([]);
        setError('Could not load places.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val);
    else params.delete('search');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await fetch('/api/v1/spatial/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const created = await res.json();
      const optimistic: Facility = {
        id: created.facilityId,
        tenantId: '',
        name: values.name,
        status: 'draft',
        createdAt: new Date().toISOString(),
        ...(values.description ? { description: values.description } : {}),
        ...(values.address ? { address: values.address } : {}),
      };
      setFacilities((prev) => [...prev, optimistic]);
      reset();
      setOpen(false);
    }
    setSubmitting(false);
  }

  async function onSubmitBooking(values: BookingFormValues) {
    setBookingError(null);
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = {
      roomId: values.roomId,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      title: values.title,
      idempotencyKey,
    };
    const res = await fetch('/api/v1/spatial/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      resetB();
      setBookingOpen(false);
      fetch('/api/v1/spatial/bookings')
        .then((r) => r.json())
        .then(setBookings)
        .catch(() => {});
    } else if (res.status === 409) {
      const e = await res.json().catch(() => ({}));
      setBookingError(e.error || 'Booking conflict detected. Choose different time.');
    } else {
      const e = await res.json().catch(() => ({}));
      setBookingError(e.error?.message || 'Failed to book');
    }
  }

  const createForm = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register('name')} placeholder="Place name" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} placeholder="Full address" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        >
          {submitting ? 'Creating…' : 'Create Place'}
        </Button>
      </div>
    </form>
  );

  const headerActions = (
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Activate (Book)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Participation at this Place</DialogTitle>
        </DialogHeader>
        {bookingError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {bookingError}
          </div>
        )}
        <form onSubmit={handleB(onSubmitBooking)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Space / Room ID</Label>
            <Input {...regB('roomId')} placeholder="UUID of room" />
            {bErrors.roomId && (
              <p className="text-xs text-destructive">{bErrors.roomId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Title (optional)</Label>
            <Input {...regB('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input type="datetime-local" {...regB('startsAt')} />
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Input type="datetime-local" {...regB('endsAt')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBookingOpen(false);
                setBookingError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={bSubmitting}>
              {bSubmitting ? 'Booking…' : 'Submit Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <ResourcePageLayout
      title="Places"
      description="Spaces where Participation & Collaboration happen in the Network"
      icon={<MapPin className="h-5 w-5 text-white" />}
      iconGradient="from-emerald-500 to-teal-600"
      searchPlaceholder="Search places in the network..."
      searchQuery={q}
      onSearchChange={handleSearchChange}
      data={filteredFacilities}
      loading={loading}
      error={error}
      emptyMessage="No places match. Broaden search or create one."
      createButtonText="New Place"
      createButtonIcon={<Plus className="mr-1.5 h-3.5 w-3.5" />}
      isCreateOpen={open}
      onCreateOpenChange={setOpen}
      createDialogTitle="Add New Place"
      createDialogContent={createForm}
      featuredItems={filteredFacilities.slice(0, 3)}
      featuredTitle="Featured Places"
      renderFeaturedItem={(f) => (
        <Link
          key={f.id}
          href={`/app/venues/${f.id}`}
          className="bg-card card-hover group flex items-center gap-3 rounded-xl border border-border/60 p-4 shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{f.name}</div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {f.address || 'No address'}
            </div>
          </div>
        </Link>
      )}
      columns={columns}
      headerActions={headerActions}
    >
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Bookings Calendar</h2>
        <div className="bg-card rounded-xl border border-border/60 p-4 shadow-sm">
          <BookingCalendar
            bookings={bookings}
            onSelectSlot={(info) => {
              const startIso = new Date(info.start).toISOString().slice(0, 16);
              const endIso = new Date(info.end).toISOString().slice(0, 16);
              setBValue('startsAt', startIso);
              setBValue('endsAt', endIso);
              setBookingOpen(true);
            }}
          />
        </div>
      </div>
    </ResourcePageLayout>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <FacilitiesContent />
    </Suspense>
  );
}
