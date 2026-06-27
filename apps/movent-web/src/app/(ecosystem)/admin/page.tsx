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

  const tabs = [
    { id: 'identity', label: 'Tenant Profile', icon: Settings },
    { id: 'members', label: 'Team Members', icon: Users, badge: 'Mock' },
    { id: 'security', label: 'Access & Roles', icon: ShieldAlert, badge: 'Mock' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, badge: 'Soon' },
    { id: 'integrations', label: 'API & Webhooks', icon: Radio, badge: 'Soon' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, badge: 'Soon' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-xl font-bold text-foreground">Administration</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Platform control center, workspace parameters, and tenant administration
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
                    <h2 className="text-sm font-semibold text-foreground">Organization Details</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Manage core properties of the active Tenant workspace
                    </p>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantId">Workspace ID</Label>
                      <Input
                        id="tenantId"
                        value={tenant.id}
                        readOnly
                        className="bg-muted font-mono text-xs text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantName">Organization Name</Label>
                      <Input id="tenantName" value={tenant.name} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tenantSlug">Workspace Slug</Label>
                      <Input
                        id="tenantSlug"
                        value={tenant.slug}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button disabled size="sm">
                        Update Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Workspace Members</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Simulated workspace profile memberships (Backend pending integration)
                      </p>
                    </div>
                    <Button size="sm" disabled>
                      Invite Member
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-border/60">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/40 hover:bg-muted/10">
                          <td className="px-4 py-3 font-semibold">Workspace Owner</td>
                          <td className="px-4 py-3 font-mono">owner@moventios.com</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              owner
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-emerald-600">Active</td>
                        </tr>
                        <tr className="hover:bg-muted/10">
                          <td className="px-4 py-3 font-semibold">AI Assistant</td>
                          <td className="px-4 py-3 font-mono">copilot@moventios.internal</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                              agent
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-emerald-600">Active</td>
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
                      Access Control & Role Matrix
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Verify workspace permission rules mapped from the Platform Constitution
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-2 rounded-lg border border-border/50 bg-muted/40 p-4">
                      <span className="block font-bold text-foreground">
                        Active Guardrails in Force:
                      </span>
                      <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                        <li>
                          <strong>L-05 (Tenant Isolation):</strong> RLS handles row validation for
                          all requests.
                        </li>
                        <li>
                          <strong>L-06 (AI Writes Intercepted):</strong> AI requests require
                          standalone pending approvals.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {['billing', 'integrations', 'audit'].includes(activeTab) && (
                <div className="space-y-3 py-12 text-center text-muted-foreground">
                  <Database className="mx-auto h-8 w-8 animate-pulse opacity-30" />
                  <h3 className="text-sm font-bold text-foreground">Coming Soon</h3>
                  <p className="mx-auto max-w-xs text-xs">
                    This module is part of the Phase 2/3 roadmap. Endpoint contracts are scheduled
                    in upcoming backend milestones.
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
