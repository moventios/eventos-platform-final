'use client';

import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { createSupabaseBrowserClient } from '@movent/infrastructure/supabase';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Clock, Shield, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Approval = {
  id: string;
  tenantId: string;
  assignedTo: string;
  requestContext: {
    command_type: string;
    actor_id: string;
    aggregate_id: string;
    aggregate_type: string;
    payload?: Record<string, unknown>;
  };
  status: string;
  actorType: string;
  expiresAt: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  resolutionNote?: string;
};

const filterConfig = [
  { key: 'pending', label: 'Menunggu', color: 'amber' },
  { key: 'approved', label: 'Disetujui', color: 'emerald' },
  { key: 'rejected', label: 'Ditolak', color: 'red' },
  { key: 'expired', label: 'Kedaluwarsa', color: 'slate' },
  { key: 'all', label: 'Semua', color: 'blue' },
] as const;

function isExpiringSoon(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 24; // < 24h
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/workflow/approvals?status=${statusFilter}`)
      .then((r) => r.json())
      .then(setApprovals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('approvals-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, () => {
        fetchApprovals();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchApprovals]);

  async function resolve(id: string, resolution: 'approved' | 'rejected', note?: string) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (selectedApproval?.id === id) setSelectedApproval(null);
    await fetch(`/api/v1/workflow/approvals/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId: id, resolution, note: note || undefined }),
    });
  }

  const columns: ColumnDef<Approval>[] = [
    {
      header: 'Tipe Perintah',
      accessorFn: (row) => row.requestContext.command_type,
      cell: ({ getValue }) => (
        <span className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-xs text-foreground">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: 'Tipe Agregat',
      accessorFn: (row) => row.requestContext.aggregate_type,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      header: 'Aktor',
      cell: ({ row }) => <StatusBadge status={row.original.actorType} />,
    },
    {
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: 'Batas Waktu',
      accessorFn: (row) => row.expiresAt,
      cell: ({ row }) => {
        const d = new Date(row.original.expiresAt);
        const soon = isExpiringSoon(row.original.expiresAt);
        return (
          <div className="flex items-center gap-1.5">
            {soon && <Clock className="h-3 w-3 shrink-0 text-amber-500" />}
            <span
              className={`text-xs ${soon ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
            >
              {d.toLocaleDateString('id-ID')}{' '}
              {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      cell: ({ row }) => {
        const isPending = row.original.status === 'pending';
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                setSelectedApproval(row.original);
                setRejectionNote('');
              }}
            >
              Detail
            </Button>
            {isPending && (
              <>
                <Button
                  size="sm"
                  className="h-7 border-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                  onClick={() => resolve(row.original.id, 'approved')}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Setujui
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() => resolve(row.original.id, 'rejected')}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Tolak
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Persetujuan</h1>
              {statusFilter === 'pending' && pendingCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tata kelola dan verifikasi data yang menjaga keamanan jaringan komunitas.
            </p>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filterConfig.map(({ key, label }) => {
          const active = statusFilter === key;
          const count =
            key === 'all'
              ? approvals.length
              : key === statusFilter
                ? approvals.filter((a) => a.status === key).length
                : undefined;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                active
                  ? key === 'pending'
                    ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                    : key === 'approved'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : key === 'rejected'
                        ? 'border-red-600 bg-red-600 text-white shadow-sm'
                        : key === 'expired'
                          ? 'border-slate-500 bg-slate-500 text-white shadow-sm'
                          : 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              } `}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span
                  className={`rounded-full px-1 py-0.5 text-[9px] font-bold leading-none ${active ? 'bg-white/20' : 'bg-muted'}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
          <DataTable data={approvals} columns={columns} />
        </div>
      )}

      {!loading && approvals.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Shield className="mx-auto mb-3 h-8 w-8 opacity-30" />
          <p className="text-sm">
            {statusFilter === 'pending'
              ? 'Tidak ada persetujuan yang tertunda. Semua perubahan data aman!'
              : `Tidak ditemukan persetujuan dengan status ${statusFilter}.`}
          </p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog
        open={selectedApproval !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedApproval(null);
        }}
      >
        {selectedApproval && (
          <DialogContent className="max-w-xl text-foreground">
            <DialogHeader>
              <DialogTitle>Detail Pengajuan Persetujuan</DialogTitle>
              <DialogDescription>
                Detail riwayat konteks dan aksi untuk persetujuan ini
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipe Perintah
                  </span>
                  <span className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-xs">
                    {selectedApproval.requestContext.command_type}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipe Aktor
                  </span>
                  <StatusBadge status={selectedApproval.actorType} />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipe Agregat
                  </span>
                  <span>{selectedApproval.requestContext.aggregate_type}</span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                  <StatusBadge status={selectedApproval.status} />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Kedaluwarsa Pada
                  </span>
                  <span
                    className={
                      isExpiringSoon(selectedApproval.expiresAt)
                        ? 'font-medium text-amber-600 dark:text-amber-400'
                        : ''
                    }
                  >
                    {new Date(selectedApproval.expiresAt).toLocaleString('id-ID')} WIB
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Diajukan Pada
                  </span>
                  <span>{new Date(selectedApproval.createdAt).toLocaleString('id-ID')} WIB</span>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Payload Permintaan
                </span>
                <pre className="max-h-40 overflow-auto rounded-lg border border-border/40 bg-muted/60 p-3 font-mono text-xs">
                  {JSON.stringify(selectedApproval.requestContext, null, 2)}
                </pre>
              </div>

              {selectedApproval.status !== 'pending' && (
                <div className="space-y-2 rounded-lg border border-border/40 bg-muted/40 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informasi Penyelesaian
                  </h4>
                  {selectedApproval.resolvedAt && (
                    <p className="text-sm">
                      <strong>Diselesaikan Pada:</strong>{' '}
                      {new Date(selectedApproval.resolvedAt).toLocaleString('id-ID')} WIB
                    </p>
                  )}
                  {selectedApproval.resolutionNote && (
                    <p className="text-sm">
                      <strong>Catatan:</strong> {selectedApproval.resolutionNote}
                    </p>
                  )}
                </div>
              )}

              {selectedApproval.status === 'pending' && (
                <div className="space-y-4 border-t border-border/60 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="note">Catatan Penyelesaian (Wajib jika menolak)</Label>
                    <Input
                      id="note"
                      placeholder="Masukkan alasan atau catatan..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                      Tutup
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        resolve(
                          selectedApproval.id,
                          'rejected',
                          rejectionNote || 'Ditolak untuk menjaga keamanan jaringan',
                        )
                      }
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Tolak
                    </Button>
                    <Button
                      className="border-0 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => resolve(selectedApproval.id, 'approved', rejectionNote)}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Setujui
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
