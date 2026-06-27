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

    Promise.all([
      fetch('/api/v1/spatial/facilities')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Venue[]) => {
          const found = data.find((v) => v.id === venueId);
          if (found) setVenue(found);
          else throw new Error('Venue not found');
        }),
      fetch(`/api/v1/spatial/facilities/${venueId}/rooms`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Room[]) => setRooms(data || [])),
    ])
      .catch(() => {
        setError('Could not load venue details.');
      })
      .finally(() => setLoading(false));
  }, [venueId]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/venues"
          className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Venues Directory
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-slate-800/40 rounded-xl" />
          <Skeleton className="h-4 w-full bg-slate-800/40 rounded-xl" />
          <Skeleton className="h-24 w-full bg-slate-800/40 rounded-xl" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : venue ? (
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-slate-950/40 border border-slate-850 p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{venue.name}</h1>
                  <StatusBadge status={venue.status} />
                </div>
                {venue.address && (
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-teal-500" />
                    {venue.address}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 shrink-0">
                <MapPin className="h-6 w-6 text-teal-400" />
              </div>
            </div>

            <hr className="border-slate-850" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About the Venue</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {venue.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Spaces / Rooms */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Available Spaces</h2>
            <div className="bg-slate-950/40 rounded-2xl border border-slate-850 overflow-hidden">
              {rooms.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  <p className="text-sm">No individual spaces registered at this venue.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-850">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                          <BookOpen className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">{room.name}</span>
                          <span className="ml-3 text-xs text-slate-500">Capacity: {room.capacity}</span>
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
          <div className="bg-gradient-to-r from-teal-950/40 to-emerald-950/30 border border-teal-500/20 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                <KeyRound className="h-5 w-5 text-teal-400" />
                Reserve Spaces at this Venue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To request space reservations, view scheduling timetables, or manage booking events, please sign in with your sovereign community workspace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                  Sign In to Book
                </Button>
              </Link>
              <Link href="/login?tab=register" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white">
                  Create Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
