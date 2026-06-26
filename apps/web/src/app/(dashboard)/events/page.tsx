'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  { accessorKey: 'name', header: 'Name' },
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
      return v ? new Date(v).toLocaleString() : '—';
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <a href={`/events/${row.original.id}`} className="text-xs text-primary hover:underline">View</a>
    ),
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);

  const fetchEvents = () =>
    fetch('/api/v1/commerce/events')
      .then((r) => r.json())
      .then(setEvents);

  useEffect(() => { fetchEvents(); }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'Asia/Jakarta' },
  });

  const onSubmit = async (data: FormValues) => {
    await fetch('/api/v1/commerce/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset();
    setOpen(false);
    fetchEvents();
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startsAt">Starts At</Label>
                <Input id="startsAt" type="datetime-local" {...register('startsAt')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endsAt">Ends At</Label>
                <Input id="endsAt" type="datetime-local" {...register('endsAt')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" {...register('timezone')} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={events} columns={columns} />
    </div>
  );
}
