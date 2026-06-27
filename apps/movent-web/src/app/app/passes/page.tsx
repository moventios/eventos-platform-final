'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, Search, Filter } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

type AccessPass = {
  id: string;
  passTierId: string;
  eventId: string;
  customerId: string;
  status: string;
  idempotencyKey: string;
  holdsUntil: string | null;
  issuedAt: string | null;
  checkedInAt: string | null;
};

function PassesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventIdFilter = searchParams.get('eventId') || '';
  const [passes, setPasses] = useState<AccessPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchPasses = async () => {
    setLoading(true);
    setError(null);
    const url = eventIdFilter
      ? `/api/v1/commerce/access-passes?eventId=${eventIdFilter}`
      : '/api/v1/commerce/access-passes';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPasses(data || []);
      } else {
        setError('Gagal memuat tiket masuk.');
      }
    } catch {
      setError('Gagal sinkronisasi data pintu masuk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [eventIdFilter]);

  const handleCheckIn = async (passId: string) => {
    setActioningId(passId);
    try {
      const res = await fetch(`/api/v1/commerce/access-passes/${passId}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessPassId: passId }),
      });
      if (res.ok) {
        await fetchPasses();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Proses Check-In gagal.');
      }
    } catch {
      alert('Gagal terhubung dengan pintu masuk.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredPasses = passes.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: ColumnDef<AccessPass>[] = [
    {
      accessorKey: 'id',
      header: 'ID Tiket',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'customerId',
      header: 'ID Peserta',
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      accessorKey: 'issuedAt',
      header: 'Diterbitkan Pada',
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val ? (
          <span className="text-xs">{new Date(val).toLocaleString('id-ID')} WIB</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: 'checkedInAt',
      header: 'Waktu Masuk',
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val ? (
          <span className="text-xs font-medium text-emerald-600">
            ✓ {new Date(val).toLocaleTimeString('id-ID')} WIB
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const p = row.original;
        const canCheckIn = p.status === 'issued' || p.status === 'pending';
        return canCheckIn ? (
          <Button
            size="sm"
            className="h-7 border-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            disabled={actioningId !== null}
            onClick={() => handleCheckIn(p.id)}
          >
            Verifikasi Masuk
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Tiket Masuk</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pindai tiket pintu masuk, validasi kredensial, dan manajemen kehadiran real-time.
            </p>
          </div>
        </div>
        {eventIdFilter && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('eventId');
              router.replace(`?${params.toString()}`);
            }}
          >
            Hapus Filter Event
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan ID tiket atau UUID peserta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Label htmlFor="statusFilter" className="text-xs text-muted-foreground">
            Status:
          </Label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-border bg-background p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="issued">Diterbitkan</option>
            <option value="checked_in">Telah Hadir</option>
            <option value="consumed">Digunakan</option>
            <option value="revoked">Dibatalkan</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
          ⚠️ {error}
        </div>
      )}

      {/* Data Grid */}
      <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <DataTable data={filteredPasses} columns={columns} />
        )}
      </div>
    </div>
  );
}

export default function PassesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <PassesContent />
    </Suspense>
  );
}
