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
          href={`/app/events/${row.original.id}`}
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
        href={`/app/events/${row.original.id}`}
        className="text-xs font-medium text-primary hover:underline"
      >
        View & Connect →
      </Link>
    ),
  },
];

import { ResourcePageLayout } from '@/components/layout/resource-page';

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

  const createForm = (
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
  );

  return (
    <ResourcePageLayout
      title="Events"
      description="Relationships, Participation & Opportunities in the Network"
      icon={<Calendar className="h-5 w-5 text-white" />}
      iconGradient="from-blue-500 to-indigo-600"
      searchPlaceholder="Search events in the network..."
      searchQuery={q}
      onSearchChange={handleSearchChange}
      data={filteredEvents}
      loading={loading}
      error={error}
      emptyMessage="No events match. Try broadening your search or propose one."
      createButtonText="Propose Event"
      createButtonIcon={<Plus className="mr-1.5 h-3.5 w-3.5" />}
      isCreateOpen={open}
      onCreateOpenChange={setOpen}
      createDialogTitle="Propose New Event"
      createDialogContent={createForm}
      featuredItems={filteredEvents.slice(0, 3)}
      featuredTitle="Featured Events"
      renderFeaturedItem={(e) => (
        <Link
          key={e.id}
          href={`/app/events/${e.id}`}
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
      )}
      columns={columns}
    />
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
