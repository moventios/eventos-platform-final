'use client';

import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, KeyRound, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
};

export default function PublicEventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    
    fetch('/api/v1/commerce/events')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Event[]) => {
        const found = data.find((e) => e.id === eventId);
        if (found) {
          setEvent(found);
        } else {
          setError('Event not found.');
        }
      })
      .catch(() => {
        setError('Could not load event data.');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 flex-1">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/events"
          className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Events Directory
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
      ) : event ? (
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-slate-950/40 border border-slate-850 p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">{event.name}</h1>
                  <StatusBadge status={event.status} />
                </div>
                {event.startsAt && (
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-teal-500" />
                    {new Date(event.startsAt).toLocaleString(undefined, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 shrink-0">
                <Calendar className="h-6 w-6 text-teal-400" />
              </div>
            </div>

            <hr className="border-slate-850" />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About the Event</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {event.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Marketing/Conversion CTA Card */}
          <div className="bg-gradient-to-r from-teal-950/40 to-emerald-950/30 border border-teal-500/20 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                <KeyRound className="h-5 w-5 text-teal-400" />
                Participation Credential Required
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To attend this event, claim access passes, or check in at the gate, you must sign in with your sovereign community workspace credentials.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                  Sign In to Attend
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
