'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/status-badge';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

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
  const [passes, setPasses] = useState<AccessPass[]>([]);
  const [open, setOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
  });

  const tierSchema = z.object({
    name: z.string().min(1),
    price: z.string().min(1),
    capacity: z.coerce.number().int().positive(),
  });
  type TierForm = z.infer<typeof tierSchema>;
  const { register: regTier, handleSubmit: handleTier, reset: resetTier } = useForm<TierForm>({
    resolver: zodResolver(tierSchema),
    defaultValues: { price: '0.0000', capacity: 100 },
  });

  async function load() {
    if (!eventId) return;
    const [evs, ps] = await Promise.all([
      fetch('/api/v1/commerce/events').then(r => r.json()),
      fetch(`/api/v1/commerce/access-passes?eventId=${eventId}`).then(r => r.json()),
    ]);
    const ev = (evs || []).find((e: any) => e.id === eventId);
    if (ev) setEventName(ev.name || eventId);
    setPasses(ps || []);
  }

  useEffect(() => { load(); }, [eventId]);

  async function onIssue(data: IssueForm) {
    setSubmitting(true); setError(null);
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
      // AI path returned approval
      setError('Access pass issuance queued for approval (L-06).');
      setOpen(false);
    } else {
      const e = await res.json().catch(() => ({}));
      setError(e.error || 'Issue failed (capacity?)');
    }
    setSubmitting(false);
  }

  async function onCreateTier(data: TierForm) {
    setSubmitting(true); setError(null);
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
      // no list of tiers shown, but creation succeeded (enables later issue)
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
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'customerId', header: 'Customer' },
    { accessorKey: 'status', header: 'Status', cell: ({getValue}) => <StatusBadge status={getValue<string>()} /> },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const p = row.original;
        if (p.status === 'issued' || p.status === 'pending') {
          return <Button size="sm" onClick={() => doCheckIn(p.id)}>Check In</Button>;
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-6 p-1">
      <div>
        <a href="/events" className="text-sm text-muted-foreground hover:underline">← Back to Events</a>
        <h1 className="text-2xl font-semibold mt-1">Event: {eventName || eventId}</h1>
      </div>

      {error && <div className="rounded bg-destructive/10 border border-destructive/40 p-2 text-sm text-destructive">{error}</div>}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Access Passes</h2>
        <div className="flex gap-2">
          <Dialog open={tierOpen} onOpenChange={setTierOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Create Pass Tier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Pass Tier (Ticket Type)</DialogTitle></DialogHeader>
              <form onSubmit={handleTier(onCreateTier)} className="space-y-3">
                <div><Label>Name</Label><Input {...regTier('name')} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Price</Label><Input {...regTier('price')} /></div>
                  <div><Label>Capacity</Label><Input type="number" {...regTier('capacity')} /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setTierOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>Create Tier</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Issue Access Pass</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Issue Access Pass</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onIssue)} className="space-y-3">
                <div>
                  <Label>Pass Tier ID (uuid)</Label>
                  <Input {...register('passTierId')} />
                  {errors.passTierId && <p className="text-xs text-destructive">{errors.passTierId.message}</p>}
                </div>
                <div>
                  <Label>Customer ID (uuid)</Label>
                  <Input {...register('customerId')} />
                  {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>Issue</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable data={passes} columns={columns} />

      <p className="text-xs text-muted-foreground">Check-in updates status via handler + outbox. For pass tier creation use the CreateTicketType API or admin flow.</p>
    </div>
  );
}
