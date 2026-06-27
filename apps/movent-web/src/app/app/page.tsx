'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Ticket,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
};

type Facility = {
  id: string;
  name: string;
  address?: string;
  status: string;
};

type Booking = {
  id: string;
  title?: string;
  roomId?: string;
  startAt: string;
  endAt: string;
  status: string;
};

type Approval = {
  id: string;
  requestContext: {
    command_type: string;
    actor_id: string;
    aggregate_id: string;
    aggregate_type: string;
    payload?: Record<string, unknown>;
  };
  status: string;
  createdAt: string;
};

export default function EcosystemHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningApproval, setActioningApproval] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      const [evsRes, facsRes, bksRes, appRes] = await Promise.all([
        fetch('/api/v1/commerce/events').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/v1/spatial/facilities').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/v1/spatial/bookings').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/v1/workflow/approvals?status=pending').then((r) => (r.ok ? r.json() : [])),
      ]);
      setEvents(evsRes || []);
      setFacilities(facsRes || []);
      setBookings(bksRes || []);
      setApprovals(appRes || []);
    } catch {
      setError('Gagal sinkronisasi data operasional.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleResolve = async (approvalId: string, resolution: 'approved' | 'rejected') => {
    setActioningApproval(approvalId);
    try {
      const res = await fetch(`/api/v1/workflow/approvals/${approvalId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, resolution, note: 'Diselesaikan dari Dasbor Kontrol' }),
      });
      if (res.ok) {
        await loadDashboardData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Gagal memproses persetujuan');
      }
    } catch {
      alert('Gagal terhubung dengan layanan persetujuan.');
    } finally {
      setActioningApproval(null);
    }
  };

  const liveEvents = events.filter((e) => e.status === 'published' || e.status === 'live');
  const activeBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'active');

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Operational Alerts Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dasbor Kontrol</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Dasbor operasional waktu-nyata untuk mengelola alur kegiatan aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="font-mono text-xs uppercase text-muted-foreground">
            Koneksi Operasional Aktif
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Snapshot Indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Event Aktif',
            val: liveEvents.length,
            icon: Calendar,
            color: 'from-blue-500 to-indigo-600',
          },
          {
            label: 'Ruangan Dipesan',
            val: activeBookings.length,
            icon: Building2,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            label: 'Persetujuan Tertunda',
            val: approvals.length,
            icon: Shield,
            color: 'from-amber-500 to-orange-600',
            alert: approvals.length > 0,
          },
          {
            label: 'Total Venue',
            val: facilities.length,
            icon: Ticket,
            color: 'from-violet-500 to-purple-600',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-card rounded-xl border p-4 shadow-sm transition-all duration-200 ${
              kpi.alert
                ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
                : 'border-border/60 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
              <div
                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-sm`}
              >
                <kpi.icon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {loading ? <Skeleton className="h-8 w-12" /> : kpi.val}
            </div>
          </div>
        ))}
      </div>

      {/* Active Operational Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1 & 2: Approvals Queue and Spatial Occupancy */}
        <div className="space-y-6 lg:col-span-2">
          {/* Approvals Queue */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-amber-500" />
                <h2 className="text-base font-semibold">Antrean Persetujuan Tertunda</h2>
              </div>
              <Link href="/app/approvals" className="text-xs font-medium text-primary hover:underline">
                Lihat Antrean →
              </Link>
            </div>

            <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
              {loading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : approvals.length === 0 ? (
                <div className="space-y-2 p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 opacity-50" />
                  <p className="text-sm">
                    Antrean tata kelola bersih. Semua perubahan data telah divalidasi.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {approvals.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/10"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-600">
                            {app.requestContext.command_type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(app.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          Target:{' '}
                          <span className="font-mono">
                            {app.requestContext.aggregate_type} ({app.requestContext.aggregate_id})
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 border-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                          disabled={actioningApproval !== null}
                          onClick={() => handleResolve(app.id, 'approved')}
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          disabled={actioningApproval !== null}
                          onClick={() => handleResolve(app.id, 'rejected')}
                        >
                          Tolak
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Spatial Booking Feeds */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-base font-semibold">Alokasi Ruangan Aktif</h2>
              </div>
              <Link href="/app/bookings" className="text-xs font-medium text-primary hover:underline">
                Buka Kalender →
              </Link>
            </div>

            <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
              {loading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">Tidak ada ruangan yang digunakan saat ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {activeBookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/10"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {b.title || 'Alokasi Ruangan'}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(b.startAt).toLocaleString('id-ID', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}{' '}
                            -{' '}
                            {new Date(b.endAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} WIB
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Column 3: Live Events Activity */}
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4.5 w-4.5 text-emerald-500" />
                <h2 className="text-base font-semibold">Pusat Event Aktif</h2>
              </div>
              <Link href="/app/events" className="text-xs font-medium text-primary hover:underline">
                Semua Event →
              </Link>
            </div>

            <div className="bg-card space-y-4 rounded-xl border border-border/60 p-4 shadow-sm">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : liveEvents.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <p className="text-sm">Tidak ada event aktif hari ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {e.name}
                        </span>
                        <StatusBadge status={e.status} />
                      </div>
                      {e.startsAt && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          📅 {new Date(e.startsAt).toLocaleString('id-ID')} WIB
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          Tiket Terverifikasi
                        </span>
                        <Link
                          href={`/app/passes?eventId=${e.id}`}
                          className="text-[10px] font-medium text-primary hover:underline"
                        >
                          Kelola Tiket →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Platform Onboarding CTA */}
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center shadow-sm">
            <h3 className="text-sm font-bold text-foreground">Administrasi Operasional</h3>
            <p className="text-xs text-muted-foreground">
              Atur parameter organisasi, peran anggota, dan integrasi sistem di ruang kerja Administrasi.
            </p>
            <Link
              href="/app/admin"
              className="bg-gradient-brand inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white shadow transition-all hover:opacity-90"
            >
              Buka Administrasi
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
