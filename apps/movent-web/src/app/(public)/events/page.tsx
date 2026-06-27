'use client';

import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue, row }) => (
      <div>
        <Link
          href={`/events/${row.original.id}`}
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          {getValue<string>()}
        </Link>
        {row.original.description && (
          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
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
      if (!v) return <span className="text-xs text-slate-500">—</span>;
      const d = new Date(v);
      return (
        <div className="text-sm text-slate-300">
          <div className="font-medium">{d.toLocaleDateString()}</div>
          <div className="text-xs text-slate-400">
            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/events/${row.original.id}`}
        className="text-xs font-semibold text-teal-400 hover:underline"
      >
        View Details →
      </Link>
    ),
  },
];

function PublicEventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('search') || '').toLowerCase();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Could not load events.');
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Ecosystem Events</h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse public gatherings, project kickoffs, and community activations.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search public events..."
          defaultValue={q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 text-sm bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
        />
      </div>

      {/* Featured Events */}
      {!loading && filteredEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Featured Events
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {filteredEvents.slice(0, 3).map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="bg-slate-950/40 border border-slate-850 hover:border-slate-700/80 p-5 rounded-2xl flex items-start gap-4 transition-all duration-150"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                  <Calendar className="h-4.5 w-4.5 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{e.name}</div>
                  <div className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {e.description || 'No description provided.'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Error & loading states */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl bg-slate-800/40" />
          <Skeleton className="h-12 w-full rounded-xl bg-slate-800/40" />
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Data table */}
      {!loading && (
        <div className="bg-slate-950/40 overflow-hidden rounded-2xl border border-slate-850">
          <DataTable data={filteredEvents} columns={columns} />
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="py-16 text-center text-slate-400 bg-slate-950/20 rounded-2xl border border-slate-850">
          <Calendar className="mx-auto mb-4 h-10 w-10 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">No events found</p>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function PublicEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl bg-slate-800/40" />
          <Skeleton className="h-64 w-full rounded-xl bg-slate-800/40" />
        </div>
      }
    >
      <PublicEventsContent />
    </Suspense>
  );
}
