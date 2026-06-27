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
import { ArrowLeft, Calendar, CheckCircle2, Plus, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const issueSchema = z.object({
  passTierId: z.string().uuid('Must be uuid'),
  customerId: z.string().uuid('Must be uuid'),
  metadata: z.string().optional(),
});
type IssueForm = z.infer<typeof issueSchema>;

interface AccessPass {
  id: string;
  passTierId: string;
  eventId: string;
  customerId: string;
  status: string;
  holdsUntil?: string;
  issuedAt?: string;
  checkedInAt?: string;
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const [eventName, setEventName] = useState('');
  const [eventData, setEventData] = useState<{
    description?: string | undefined;
    status?: string | undefined;
    startsAt?: string | undefined;
  } | null>(null);
  const [passes, setPasses] = useState<AccessPass[]>([]);
  const [open, setOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueForm>({ resolver: zodResolver(issueSchema) });

  const tierSchema = z.object({
    name: z.string().min(1),
    price: z.string().min(1),
    capacity: z.coerce.number().int().positive(),
  });
  type TierForm = z.infer<typeof tierSchema>;
  const {
    register: regTier,
    handleSubmit: handleTier,
    reset: resetTier,
  } = useForm<TierForm>({
    resolver: zodResolver(tierSchema),
    defaultValues: { price: '0.0000', capacity: 100 },
  });

  async function load() {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const [evsRes, psRes] = await Promise.all([
        fetch('/api/v1/commerce/events'),
        fetch(`/api/v1/commerce/access-passes?eventId=${eventId}`),
      ]);
      const evs = evsRes.ok ? await evsRes.json() : [];
      const ps = psRes.ok ? await psRes.json() : [];
      const ev = (evs || []).find(
        (e: {
          id: string;
          name?: string;
          description?: string;
          status?: string;
          startsAt?: string;
        }) => e.id === eventId,
      );
      if (ev) {
        setEventName(ev.name || eventId);
        setEventData({ description: ev.description, status: ev.status, startsAt: ev.startsAt });
      }
      setPasses(ps || []);
    } catch {
      setError('Unable to load live event data (participation may require sign-in).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [eventId]);

  async function onIssue(data: IssueForm) {
    setSubmitting(true);
    setError(null);
    const idempotencyKey = `issue-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const res = await fetch('/api/v1/commerce/access-passes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passTierId: data.passTierId,
        eventId,
        customerId: data.customerId,
        idempotencyKey,
      }),
    });
    if (res.ok) {
      reset();
      setOpen(false);
      await load();
    } else if (res.status === 202) {
      setError('Access pass issuance queued for approval (L-06).');
      setOpen(false);
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Issue failed (capacity?)');
    }
    setSubmitting(false);
  }

  async function onCreateTier(data: TierForm) {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/v1/commerce/events/${eventId}/pass-tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        name: data.name,
        price: data.price,
        capacity: data.capacity,
      }),
    });
    if (res.ok) {
      resetTier();
      setTierOpen(false);
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Failed to create pass tier');
    }
    setSubmitting(false);
  }

  async function doCheckIn(passId: string) {
    setError(null);
    const res = await fetch(`/api/v1/commerce/access-passes/${passId}/check-in`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessPassId: passId }),
    });
    if (res.ok) {
      await load();
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Check-in failed');
    }
  }

  const columns: ColumnDef<AccessPass>[] = [
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ getValue }) => (
        <span className="block max-w-[160px] truncate rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      accessorKey: 'issuedAt',
      header: 'Issued At',
      cell: ({ getValue }) => {
        const v = getValue<string | undefined>();
        return v ? (
          <span className="text-xs text-muted-foreground">{new Date(v).toLocaleString()}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      header: 'Action',
      cell: ({ row }) => {
        const p = row.original;
        if (p.status === 'issued' || p.status === 'pending') {
          return (
            <Button
              size="sm"
              className="h-7 border-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              onClick={() => doCheckIn(p.id)}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Check In
            </Button>
          );
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/app/events"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Events
        </Link>
      </div>

      {/* Event header */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-xl" />
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{eventName || 'Event'}</h1>
              {eventData?.status && <StatusBadge status={eventData.status} />}
            </div>
            {eventData?.description && (
              <p className="mt-1 text-sm text-muted-foreground">{eventData.description}</p>
            )}
            {eventData?.startsAt && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                📅 {new Date(eventData.startsAt).toLocaleString()}
              </p>
            )}
            <p className="mt-2 border-t border-border/40 pt-2 text-xs text-muted-foreground/70">
              This Event activates Relationships in the Network — connected to Organizations,
              Places, and Participation Credentials.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Network connections */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Users,
            label: 'Participants',
            val: passes.length,
            color: 'from-violet-500 to-purple-600',
          },
          {
            icon: Ticket,
            label: 'Credentials',
            val: passes.filter((p) => p.status === 'issued').length,
            color: 'from-blue-500 to-indigo-600',
          },
          {
            icon: CheckCircle2,
            label: 'Checked In',
            val: passes.filter((p) => p.status === 'checked_in').length,
            color: 'from-emerald-500 to-teal-600',
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

      {/* Participation Credentials section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Participation Credentials</h2>
          <div className="flex gap-2">
            <Dialog open={tierOpen} onOpenChange={setTierOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Create Tier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Participation Tier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTier(onCreateTier)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input {...regTier('name')} placeholder="General Admission" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Price</Label>
                      <Input {...regTier('price')} placeholder="0.0000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Capacity</Label>
                      <Input type="number" {...regTier('capacity')} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setTierOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      Create Tier
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-brand h-8 border-0 text-xs text-white">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Issue Pass
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Issue Participation Credential</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onIssue)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>
                      Pass Tier ID <span className="text-xs text-muted-foreground">(uuid)</span>
                    </Label>
                    <Input
                      {...register('passTierId')}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono text-xs"
                    />
                    {errors.passTierId && (
                      <p className="text-xs text-destructive">{errors.passTierId.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Customer ID <span className="text-xs text-muted-foreground">(uuid)</span>
                    </Label>
                    <Input
                      {...register('customerId')}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono text-xs"
                    />
                    {errors.customerId && (
                      <p className="text-xs text-destructive">{errors.customerId.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-brand border-0 text-white"
                    >
                      {submitting ? 'Issuing…' : 'Issue Pass'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-xl border border-border/60 p-6 shadow-sm sm:flex-row">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Operational Ticket Gate</h3>
            <p className="text-xs text-muted-foreground">
              Validate guest credentials, search issued passes, and register check-ins at the gate.
            </p>
          </div>
          <Link href={`/app/passes?eventId=${eventId}`} className="shrink-0">
            <Button size="sm" className="bg-gradient-brand border-0 text-white shadow-sm">
              Open Gate & Scan Passes →
            </Button>
          </Link>
        </div>
      </div>

      {/* Cross-link */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span>
          This Event connects via Participation to Places and Organizations in the Network.
        </span>
        <Link href="/app/venues" className="ml-3 shrink-0 font-medium text-primary hover:underline">
          See connected Places →
        </Link>
      </div>
    </div>
  );
}
