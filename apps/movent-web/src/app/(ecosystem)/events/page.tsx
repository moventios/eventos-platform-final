'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Event = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  status: string;
  createdAt: string;
};

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue, row }) => (
      <div>
        <Link
          href={`/events/${row.original.id}`}
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
    accessorKey: 'startsAt',
    header: 'Starts At',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      if (!v) return <span className="text-xs text-muted-foreground">—</span>;
      const d = new Date(v);
      return (
        <div className="text-sm">
          <div className="font-medium">{d.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    },
  },
  {
    header: 'Network',
    cell: () => (
      <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
        Identity · Place · Org · Participation
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/events/${row.original.id}`}
        className="text-xs font-medium text-primary hover:underline"
      >
        View & Connect →
      </Link>
    ),
  },
];

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('search') || '').toLowerCase();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const filteredEvents = q
    ? events.filter(
        (e) =>
          (e.name || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q),
      )
    : events;

  const fetchEvents = () => {
    setLoading(true);
    setError(null);
    fetch('/api/v1/commerce/events')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEvents(data || []))
      .catch(() => {
        setEvents([]);
        setError('Could not load events (try searching or signing in for full access).');
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
    fetchEvents();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'Asia/Jakarta' },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/v1/commerce/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError('Create failed (may require workspace tenant).');
      return;
    }
    reset();
    setOpen(false);
    fetchEvents();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Events</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Relationships, Participation & Opportunities in the Network
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-brand border-0 text-white shadow-sm hover:opacity-90"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Propose Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Propose New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register('name')} placeholder="Event name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startsAt">Starts At</Label>
                  <Input id="startsAt" type="datetime-local" {...register('startsAt')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endsAt">Ends At</Label>
                  <Input id="endsAt" type="datetime-local" {...register('endsAt')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" {...register('timezone')} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-brand border-0 text-white"
                >
                  {isSubmitting ? 'Creating…' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events in the network..."
          defaultValue={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Featured Events */}
      {!loading && filteredEvents.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Featured Events
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {filteredEvents.slice(0, 3).map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="bg-card card-hover group rounded-xl border border-border/60 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{e.name}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {e.description || 'No description'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Error & loading states */}
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Data table */}
      <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <DataTable data={filteredEvents} columns={columns} />
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-3 h-8 w-8 opacity-30" />
          <p className="text-sm">No events match. Try broadening your search or propose one.</p>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
