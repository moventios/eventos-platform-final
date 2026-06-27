import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Shield, Ticket, ArrowRight, Activity, Cpu, KeyRound } from 'lucide-react';

export const metadata = {
  title: 'Moventios — Event Operating System (Event OS)',
  description: 'The relationship, booking, and collaboration protocol for sovereign community networks. Manage physical assets, access credentials, and live event pipelines.',
};

export default function MarketingLandingPage() {
  return (
    <div className="bg-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        {/* Decorative Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-950/40 px-3.5 py-1 text-xs font-medium text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Sovereign Community Operating Protocol
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl font-sans">
              The Event Operating System for{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                Modern Networks
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto">
              Moventios is the operational layer for physical gathering spaces, live collaboration pipelines, and self-sovereign community credentials.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login?tab=register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base py-6 shadow-xl shadow-teal-600/10 rounded-xl">
                  Deploy Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white text-base py-6 rounded-xl">
                  Explore Directories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats / Connection Points */}
      <section className="border-y border-slate-850 bg-slate-950/60 py-10 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: '100% Sovereign', desc: 'Self-hosted and tenant-isolated data structures.' },
              { val: 'Access Protocol', desc: 'Secure verification via outbox pipelines.' },
              { val: 'Spatial Booking', desc: 'No-conflict room booking calendars.' },
              { val: 'AI Verification', desc: 'Mutations require administrative oversight.' },
            ].map((stat) => (
              <div key={stat.val} className="p-4 rounded-xl border border-slate-900 bg-slate-900/30">
                <div className="text-lg font-bold text-teal-400">{stat.val}</div>
                <div className="mt-1 text-xs text-slate-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-24 sm:py-32 relative bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Real-World Activations
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Unlike simple software-as-a-service platforms, Moventios links database schemas, physical venue mapping, and real-time outboxes into a single engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Event Lifecycles',
                desc: 'Create, schedule, and publish events to public search crawlers. Coordinate starts, timezones, and participant limits.',
              },
              {
                icon: Building2,
                title: 'Spatial Reservations',
                desc: 'Map rooms, occupancy loads, and facilities. Enable conflicts-free booking calendars for resources and gather spots.',
              },
              {
                icon: Ticket,
                title: 'Participation Credentials',
                desc: 'Issue digital tickets and entrance credentials. Scan and check-in attendees securely at the gate via RLS rules.',
              },
              {
                icon: Shield,
                title: 'Governance Gateways',
                desc: 'Every sensitive operation is staged in the workflow queue. Approve or reject AI mutations before they hit the ledger.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-colors">
                <div className="space-y-4">
                  <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Specs / Outbox / Event OS Visual Mock */}
      <section className="py-20 bg-slate-950/50 border-t border-slate-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-500">
                <Cpu className="h-4 w-4" />
                Technical Architecture
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Built on the Outbox & RLS Isolation Principles
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Moventios runs under a strict Layer-1 Constitution. Database records utilize PostgreSQL Row-Level Security (RLS) bound by tenant cookies. Internal states synchronize via an transactional Outbox pipeline, preventing data corruption and double bookings.
              </p>
              
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <KeyRound className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
                  <span><strong>Tenant Separation:</strong> No cross-tenant data leaks. RLS queries authenticate via user JWT.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Activity className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
                  <span><strong>Realtime Sync:</strong> Subscriptions link directly to Supabase CDC pipelines for immediate gate check-ins.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
              
              {/* Fake Terminal Dashboard Mock */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full" />
                </div>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  Live OS Event Pipeline
                </span>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-500 font-bold">[STAGED]</span>
                    <span>IssueAccessPass</span>
                  </div>
                  <span className="text-slate-500">Wait for Admin Approve</span>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                    <span className="text-emerald-500 font-bold">[COMMITTED]</span>
                    <span>ReserveVenueSpace</span>
                  </div>
                  <span className="text-slate-500">Room A reserved</span>
                </div>

                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-blue-500 font-bold">[OUTBOX]</span>
                    <span>AccessPassIssuedEvent</span>
                  </div>
                  <span className="text-slate-500">Synced to workers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Orchestrate Your Network Today
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Ready to deploy an Event OS? Register a tenant namespace and sync your physical spaces.
          </p>
          <div className="pt-4">
            <Link href="/login?tab=register">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl px-8 shadow-xl shadow-teal-600/10">
                Deploy Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
