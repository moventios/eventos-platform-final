'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, ShieldAlert, CreditCard, Radio, FileText, Database } from 'lucide-react';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
};

export default function AdminPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('identity');

  // Points System States
  const [pointsData, setPointsData] = useState<{
    accounts: { id: string; profileId: string; balance: number; email: string; displayName: string | null }[];
    transactions: { id: string; profileId: string; amount: number; type: string; description: string | null; createdAt: string; email: string; displayName: string | null }[];
  } | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; displayName: string | null } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'grant' | 'adjust'>('grant');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [submittingPoints, setSubmittingPoints] = useState(false);
  const [pointsError, setPointsError] = useState('');

  useEffect(() => {
    fetch('/api/v1/iam/tenants')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (data && data.length > 0) {
          setTenant(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'points') {
      setLoadingPoints(true);
      fetch('/api/v1/commerce/points')
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) setPointsData(data);
        })
        .catch(() => {})
        .finally(() => setLoadingPoints(false));
    }
  }, [activeTab]);

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;
    setSubmittingPoints(true);
    setPointsError('');
    try {
      const res = await fetch('/api/v1/commerce/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedUser.id,
          amount: Number(adjustAmount),
          type: adjustType,
          description: adjustDescription || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah saldo poin.');
      }
      const reloadRes = await fetch('/api/v1/commerce/points');
      const reloadData = await reloadRes.json();
      setPointsData(reloadData);
      setAdjustModalOpen(false);
      setAdjustAmount('');
      setAdjustDescription('');
      setSelectedUser(null);
    } catch (err: any) {
      setPointsError(err.message || 'Gagal memproses aksi.');
    } finally {
      setSubmittingPoints(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Profil Organisasi', icon: Settings },
    { id: 'members', label: 'Anggota Tim', icon: Users, badge: 'Mock' },
    { id: 'security', label: 'Hak Akses & Peran', icon: ShieldAlert, badge: 'Mock' },
    { id: 'points', label: 'Manajemen Poin', icon: CreditCard },
    { id: 'billing', label: 'Tagihan & Paket', icon: CreditCard, badge: 'Soon' },
    { id: 'integrations', label: 'API & Webhook', icon: Radio, badge: 'Soon' },
    { id: 'audit', label: 'Log Audit', icon: FileText, badge: 'Soon' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-xl font-bold text-foreground">Administrasi</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pusat kendali platform, pengaturan ruang kerja, dan administrasi organisasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Tabs Sidebar */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                      tab.badge === 'Mock'
                        ? 'border border-blue-500/20 bg-blue-500/10 text-blue-500'
                        : 'border border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Pane Content */}
        <div className="bg-card min-h-[300px] rounded-xl border border-border/60 p-6 shadow-sm md:col-span-3">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {activeTab === 'identity' && tenant && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Detail Organisasi</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kelola informasi dasar dan ruang kerja organisasi Anda.
                    </p>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantId">ID Ruang Kerja</Label>
                      <Input
                        id="tenantId"
                        value={tenant.id}
                        readOnly
                        className="bg-muted font-mono text-xs text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantName">Nama Organisasi</Label>
                      <Input id="tenantName" value={tenant.name} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantSlug">Slug Ruang Kerja</Label>
                      <Input
                        id="tenantSlug"
                        value={tenant.slug}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button disabled size="sm">
                        Perbarui Profil
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Anggota Ruang Kerja</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Daftar anggota ruang kerja (Simulasi - Integrasi backend tertunda)
                      </p>
                    </div>
                    <Button size="sm" disabled>
                      Undang Anggota
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-border/60">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Nama
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Peran
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/40 hover:bg-muted/10">
                          <td className="px-4 py-3 font-semibold text-foreground">Pemilik Ruang Kerja</td>
                          <td className="px-4 py-3 font-mono text-foreground">owner@moventios.com</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              owner
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-emerald-600">Aktif</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-4 py-3 font-semibold text-foreground">Asisten AI</td>
                          <td className="px-4 py-3 font-mono text-foreground">copilot@moventios.internal</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                              agent
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-emerald-600">Aktif</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Kontrol Akses & Matriks Peran
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Verifikasi aturan izin akses ruang kerja yang bersumber dari Konstitusi Platform.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/40 p-4">
                      <span className="block font-bold text-foreground">
                        Aturan Keamanan yang Berlaku:
                      </span>
                      <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                        <li>
                          <strong>L-05 (Isolasi Organisasi):</strong> Row-Level Security (RLS) mengamankan data terisolasi untuk semua permintaan.
                        </li>
                        <li>
                          <strong>L-06 (Intersepsi Tulis AI):</strong> Setiap perubahan data oleh AI wajib melalui antrean persetujuan admin.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'points' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Manajemen Poin & Kredit Internal</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Pantau saldo, berikan kredit reward, atau lakukan penyesuaian saldo poin anggota secara langsung.
                      </p>
                    </div>
                  </div>

                  {loadingPoints ? (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Accounts Table */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Akun Pengguna</h3>
                        <div className="overflow-x-auto rounded-lg border border-border/60">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/30">
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Nama Anggota</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Email</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Saldo Saat Ini</th>
                                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Aksi Pengelolaan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pointsData?.accounts && pointsData.accounts.length > 0 ? (
                                pointsData.accounts.map((acc) => (
                                  <tr key={acc.id} className="border-b border-border/40 hover:bg-muted/10">
                                    <td className="px-4 py-3 font-medium text-foreground">{acc.displayName || 'Anggota Platform'}</td>
                                    <td className="px-4 py-3 font-mono text-muted-foreground">{acc.email}</td>
                                    <td className="px-4 py-3 font-bold text-teal-600 dark:text-teal-400">
                                      ✨ {acc.balance.toLocaleString('id-ID')} Poin
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedUser({ id: acc.profileId, email: acc.email, displayName: acc.displayName });
                                          setAdjustType('grant');
                                          setAdjustModalOpen(true);
                                        }}
                                        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-1 h-auto"
                                      >
                                        + Tambah
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedUser({ id: acc.profileId, email: acc.email, displayName: acc.displayName });
                                          setAdjustType('adjust');
                                          setAdjustModalOpen(true);
                                        }}
                                        className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2 py-1 h-auto"
                                      >
                                        - Kurangi
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Tidak ada data akun poin ditemukan.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Transactions History */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Riwayat Log Mutasi Poin</h3>
                        <div className="overflow-x-auto rounded-lg border border-border/60">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/30">
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Tanggal</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Pengguna</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Jenis Mutasi</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Nominal</th>
                                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pointsData?.transactions && pointsData.transactions.length > 0 ? (
                                pointsData.transactions.map((tx) => {
                                  const dateStr = new Date(tx.createdAt).toLocaleString('id-ID', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  });
                                  const isPositive = tx.amount >= 0;
                                  
                                  let typeLabel = '';
                                  switch(tx.type) {
                                    case 'grant': typeLabel = 'Penambahan'; break;
                                    case 'spend': typeLabel = 'Pembelian'; break;
                                    case 'adjust': typeLabel = 'Pengurangan'; break;
                                    case 'refund': typeLabel = 'Pengembalian'; break;
                                    default: typeLabel = tx.type;
                                  }

                                  return (
                                    <tr key={tx.id} className="border-b border-border/40 hover:bg-muted/10">
                                      <td className="px-4 py-3 text-muted-foreground font-mono">{dateStr}</td>
                                      <td className="px-4 py-3 text-foreground font-medium">
                                        <div>{tx.displayName || 'Anggota'}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{tx.email}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                          tx.type === 'grant' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                          tx.type === 'spend' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                          tx.type === 'adjust' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                          'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        }`}>
                                          {typeLabel}
                                        </span>
                                      </td>
                                      <td className={`px-4 py-3 font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
                                        {isPositive ? '+' : ''}{tx.amount.toLocaleString('id-ID')} Poin
                                      </td>
                                      <td className="px-4 py-3 text-muted-foreground">{tx.description || '-'}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Belum ada riwayat transaksi poin.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Adjustment Modal */}
              {adjustModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-foreground">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {adjustType === 'grant' ? 'Tambah Poin Keanggotaan' : 'Kurangi Poin Keanggotaan'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sesuaikan saldo poin untuk <strong>{selectedUser.displayName || selectedUser.email}</strong>.
                      </p>
                    </div>

                    <form onSubmit={handleAdjustPoints} className="space-y-4 text-xs">
                      {pointsError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-2.5 rounded text-xs font-medium">
                          {pointsError}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor="adjustAmount">Jumlah Poin</Label>
                        <Input
                          id="adjustAmount"
                          type="number"
                          min="1"
                          placeholder="Masukkan jumlah poin..."
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="adjustDescription">Catatan / Keterangan</Label>
                        <Input
                          id="adjustDescription"
                          type="text"
                          placeholder="Contoh: Reward event, Pengurangan saldo salah, dll..."
                          value={adjustDescription}
                          onChange={(e) => setAdjustDescription(e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setAdjustModalOpen(false);
                            setPointsError('');
                          }}
                          disabled={submittingPoints}
                          size="sm"
                          className="text-xs text-muted-foreground"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={submittingPoints}
                          size="sm"
                          className={`text-xs ${
                            adjustType === 'grant' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {submittingPoints ? 'Memproses...' : adjustType === 'grant' ? 'Tambah Poin' : 'Kurangi Poin'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {['billing', 'integrations', 'audit'].includes(activeTab) && (
                <div className="space-y-3 py-12 text-center text-muted-foreground">
                  <Database className="mx-auto h-8 w-8 animate-pulse opacity-30" />
                  <h3 className="text-sm font-bold text-foreground">Segera Hadir</h3>
                  <p className="mx-auto max-w-xs text-xs">
                    Modul ini adalah bagian dari peta jalan pengembangan tahap berikutnya.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
