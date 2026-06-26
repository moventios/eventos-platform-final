import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { fetchWithRequestContext } from '@/lib/server-api';

async function fetchJSON<T>(path: string): Promise<T[]> {
  try {
    const res = await fetchWithRequestContext(path);
    if (!res.ok) {
      console.error(`[Dashboard] ${path} returned ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error(`[Dashboard] ${path} fetch failed`, error);
    return [];
  }
}

export default async function DashboardPage() {
  const [events, facilities, approvals, bookings] = await Promise.all([
    fetchJSON('/api/v1/commerce/events'),
    fetchJSON('/api/v1/spatial/facilities'),
    fetchJSON<{ status: string }>('/api/v1/workflow/approvals'),
    fetchJSON<{ id: string; title?: string; name?: string; status: string; created_at?: string }>(
      '/api/v1/spatial/bookings',
    ),
  ]);

  const pending = approvals.filter((a) => a.status === 'pending');
  const recentBookings = bookings.slice(-5).reverse();

  const stats = [
    { label: 'Total Events', value: events.length },
    { label: 'Total Facilities', value: facilities.length },
    { label: 'Pending Approvals', value: pending.length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No bookings found.</p>
          ) : (
            <ul className="divide-y">
              {recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <span className="truncate font-medium">{b.title ?? b.name ?? b.id}</span>
                  <div className="ml-4 flex items-center gap-3 shrink-0">
                    {b.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    )}
                    <StatusBadge status={b.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
