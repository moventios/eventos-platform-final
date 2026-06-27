"use client";

import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createSupabaseBrowserClient } from "@movent/infrastructure/supabase";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock, Shield, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
	{ key: "pending", label: "Pending", color: "amber" },
	{ key: "approved", label: "Approved", color: "emerald" },
	{ key: "rejected", label: "Rejected", color: "red" },
	{ key: "expired", label: "Expired", color: "slate" },
	{ key: "all", label: "All", color: "blue" },
] as const;

function isExpiringSoon(expiresAt: string) {
	const diff = new Date(expiresAt).getTime() - Date.now();
	return diff > 0 && diff < 1000 * 60 * 60 * 24; // < 24h
}

export default function ApprovalsPage() {
	const [approvals, setApprovals] = useState<Approval[]>([]);
	const [statusFilter, setStatusFilter] = useState<string>("pending");
	const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
	const [rejectionNote, setRejectionNote] = useState<string>("");
	const [loading, setLoading] = useState(true);

	const fetchApprovals = useCallback(() => {
		setLoading(true);
		fetch(`/api/v1/workflow/approvals?status=${statusFilter}`)
			.then((r) => r.json())
			.then(setApprovals)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [statusFilter]);

	useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

	useEffect(() => {
		const supabase = createSupabaseBrowserClient();
		const channel = supabase
			.channel("approvals-all-changes")
			.on("postgres_changes", { event: "*", schema: "public", table: "approvals" }, () => {
				fetchApprovals();
			})
			.subscribe();
		return () => { supabase.removeChannel(channel); };
	}, [fetchApprovals]);

	async function resolve(id: string, resolution: "approved" | "rejected", note?: string) {
		setApprovals((prev) => prev.filter((a) => a.id !== id));
		if (selectedApproval?.id === id) setSelectedApproval(null);
		await fetch(`/api/v1/workflow/approvals/${id}/resolve`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ approvalId: id, resolution, note: note || undefined }),
		});
	}

	const columns: ColumnDef<Approval>[] = [
		{
			header: "Command Type",
			accessorFn: (row) => row.requestContext.command_type,
			cell: ({ getValue }) => (
				<span className="font-mono text-xs bg-muted/80 rounded px-1.5 py-0.5">
					{getValue<string>()}
				</span>
			),
		},
		{
			header: "Aggregate Type",
			accessorFn: (row) => row.requestContext.aggregate_type,
			cell: ({ getValue }) => (
				<span className="text-sm text-muted-foreground">{getValue<string>()}</span>
			),
		},
		{
			header: "Actor",
			cell: ({ row }) => <StatusBadge status={row.original.actorType} />,
		},
		{
			header: "Status",
			cell: ({ row }) => <StatusBadge status={row.original.status} />,
		},
		{
			header: "Expires",
			accessorFn: (row) => row.expiresAt,
			cell: ({ row }) => {
				const d = new Date(row.original.expiresAt);
				const soon = isExpiringSoon(row.original.expiresAt);
				return (
					<div className="flex items-center gap-1.5">
						{soon && <Clock className="h-3 w-3 text-amber-500 shrink-0" />}
						<span className={`text-xs ${soon ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
							{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
						</span>
					</div>
				);
			},
		},
		{
			header: "Actions",
			cell: ({ row }) => {
				const isPending = row.original.status === "pending";
				return (
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							className="text-xs h-7"
							onClick={() => { setSelectedApproval(row.original); setRejectionNote(""); }}
						>
							Details
						</Button>
						{isPending && (
							<>
								<Button
									size="sm"
									className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
									onClick={() => resolve(row.original.id, "approved")}
								>
									<CheckCircle2 className="h-3 w-3 mr-1" />
									Approve
								</Button>
								<Button
									size="sm"
									variant="destructive"
									className="text-xs h-7"
									onClick={() => resolve(row.original.id, "rejected")}
								>
									<XCircle className="h-3 w-3 mr-1" />
									Reject
								</Button>
							</>
						)}
					</div>
				);
			},
		},
	];

	const pendingCount = approvals.filter((a) => a.status === "pending").length;

	return (
		<div className="p-6 space-y-6">
			{/* Page header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
						<Shield className="h-5 w-5 text-white" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-bold text-foreground">Approvals</h1>
							{statusFilter === "pending" && pendingCount > 0 && (
								<span className="rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 leading-none">
									{pendingCount}
								</span>
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-0.5">
							Trust and verification keeping the Network connected (Workspace — authenticated)
						</p>
					</div>
				</div>
			</div>

			{/* Filter pills */}
			<div className="flex flex-wrap gap-2">
				{filterConfig.map(({ key, label }) => {
					const active = statusFilter === key;
					const count = key === "all" ? approvals.length
						: key === statusFilter ? approvals.filter((a) => a.status === key).length : undefined;
					return (
						<button
							key={key}
							onClick={() => setStatusFilter(key)}
							className={`
								inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 border
								${active
									? key === "pending" ? "bg-amber-500 text-white border-amber-500 shadow-sm"
										: key === "approved" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
										: key === "rejected" ? "bg-red-600 text-white border-red-600 shadow-sm"
										: key === "expired" ? "bg-slate-500 text-white border-slate-500 shadow-sm"
										: "bg-primary text-primary-foreground border-primary shadow-sm"
									: "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
								}
							`}
						>
							{label}
							{count !== undefined && count > 0 && (
								<span className={`rounded-full px-1 py-0.5 text-[9px] font-bold leading-none ${active ? "bg-white/20" : "bg-muted"}`}>
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
				<div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
					<DataTable data={approvals} columns={columns} />
				</div>
			)}

			{!loading && approvals.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<Shield className="h-8 w-8 mx-auto mb-3 opacity-30" />
					<p className="text-sm">
						{statusFilter === "pending"
							? "No pending approvals. The network is in good shape!"
							: `No ${statusFilter} approvals found.`}
					</p>
				</div>
			)}

			{/* Details Dialog */}
			<Dialog
				open={selectedApproval !== null}
				onOpenChange={(open) => { if (!open) setSelectedApproval(null); }}
			>
				{selectedApproval && (
					<DialogContent className="max-w-xl">
						<DialogHeader>
							<DialogTitle>Approval Request Detail</DialogTitle>
							<DialogDescription>
								Detailed context and actions history for this approval
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-4">
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Command Type
									</span>
									<span className="font-mono text-xs bg-muted/80 rounded px-1.5 py-0.5">
										{selectedApproval.requestContext.command_type}
									</span>
								</div>
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Actor Type
									</span>
									<StatusBadge status={selectedApproval.actorType} />
								</div>
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Aggregate Type
									</span>
									<span>{selectedApproval.requestContext.aggregate_type}</span>
								</div>
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Status
									</span>
									<StatusBadge status={selectedApproval.status} />
								</div>
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Expires At
									</span>
									<span className={isExpiringSoon(selectedApproval.expiresAt) ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
										{new Date(selectedApproval.expiresAt).toLocaleString()}
									</span>
								</div>
								<div>
									<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
										Created At
									</span>
									<span>{new Date(selectedApproval.createdAt).toLocaleString()}</span>
								</div>
							</div>

							<div>
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
									Request Payload
								</span>
								<pre className="p-3 bg-muted/60 rounded-lg text-xs overflow-auto max-h-40 font-mono border border-border/40">
									{JSON.stringify(selectedApproval.requestContext, null, 2)}
								</pre>
							</div>

							{selectedApproval.status !== "pending" && (
								<div className="p-3 bg-muted/40 border border-border/40 rounded-lg space-y-2">
									<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
										Resolution Info
									</h4>
									{selectedApproval.resolvedAt && (
										<p className="text-sm">
											<strong>Resolved At:</strong>{" "}
											{new Date(selectedApproval.resolvedAt).toLocaleString()}
										</p>
									)}
									{selectedApproval.resolutionNote && (
										<p className="text-sm">
											<strong>Note:</strong> {selectedApproval.resolutionNote}
										</p>
									)}
								</div>
							)}

							{selectedApproval.status === "pending" && (
								<div className="space-y-4 pt-2 border-t border-border/60">
									<div className="space-y-1.5">
										<Label htmlFor="note">Resolution Note (Required for Reject)</Label>
										<Input
											id="note"
											placeholder="Enter a reason or feedback..."
											value={rejectionNote}
											onChange={(e) => setRejectionNote(e.target.value)}
										/>
									</div>
									<div className="flex justify-end gap-2">
										<Button variant="outline" onClick={() => setSelectedApproval(null)}>
											Close
										</Button>
										<Button
											variant="destructive"
											onClick={() => resolve(selectedApproval.id, "rejected", rejectionNote || "Rejected to preserve network trust")}
										>
											<XCircle className="h-4 w-4 mr-1.5" />
											Reject
										</Button>
										<Button
											className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
											onClick={() => resolve(selectedApproval.id, "approved", rejectionNote)}
										>
											<CheckCircle2 className="h-4 w-4 mr-1.5" />
											Approve
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
