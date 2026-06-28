'use client';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

type PointAccount = {
  id: string;
  profileId: string;
  profileEmail: string;
  profileName: string | null;
  balance: number;
};

export default function AdminPointsPage() {
  const [accounts, setAccounts] = useState<PointAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PointAccount | null>(null);
  const [amount, setAmount] = useState<number>(50);
  const [description, setDescription] = useState<string>('Bonus');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = () => {
    setLoading(true);
    fetch('/api/v1/commerce/points/admin')
      .then((r) => r.json())
      .then((data) => setAccounts(data || []))
      .catch(() => setError('Gagal memuat data akun koin.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenDialog = (account: PointAccount) => {
    setSelectedUser(account);
    setAmount(50);
    setDescription('Bonus Komunitas');
    setIsDialogOpen(true);
  };

  const handleGrantPoints = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/commerce/points/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedUser.profileId,
          amount: amount,
          type: 'grant',
          description,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      
      // Update local state to reflect new balance
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedUser.id
            ? { ...acc, balance: acc.balance + amount }
            : acc
        )
      );
      
      setIsDialogOpen(false);
    } catch (err) {
      alert('Gagal menambahkan koin. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<PointAccount>[] = [
    {
      accessorKey: 'profileName',
      header: 'Nama Pengguna',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.profileName || 'User'}</p>
          <p className="text-xs text-muted-foreground">{row.original.profileEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Saldo Koin',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
          🪙 {getValue<number>().toLocaleString('id-ID')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleOpenDialog(row.original)}
        >
          <Plus className="mr-2 h-3 w-3" /> Beri Koin
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Coins className="h-6 w-6 text-amber-500" />
          Manajemen Koin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau saldo koin pengguna dan berikan bonus koin (poin) sebagai kredit internal.
        </p>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <DataTable columns={columns} data={accounts} searchKey="profileName" />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Koin</DialogTitle>
            <DialogDescription>
              Tambahkan koin ke dompet pengguna <strong>{selectedUser?.profileName || selectedUser?.profileEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah Koin</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Keterangan / Alasan</Label>
              <Input
                type="text"
                placeholder="Misal: Bonus pendaftaran"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-500 text-white"
              onClick={handleGrantPoints}
              disabled={submitting}
            >
              {submitting ? 'Memproses...' : 'Kirim Koin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
