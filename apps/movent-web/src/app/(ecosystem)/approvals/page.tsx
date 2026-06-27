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
		payload?: Record<string, any>;
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

export default function ApprovalsPage() {
	const [approvals, setApprovals] = useState<Approval[]>([]);
	const [statusFilter, setStatusFilter] = useState<string>("pending");
	const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
		null,
	);
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

	// Load approvals on filter change
	useEffect(() => {
		fetchApprovals();
	}, [fetchApprovals]);

	// Real-time subscription to approvals table
	useEffect(() => {
		const supabase = createSupabaseBrowserClient();
		const channel = supabase
			.channel("approvals-all-changes")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "approvals" },
				() => {
					fetchApprovals();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchApprovals]);

	async function resolve(
		id: string,
		resolution: "approved" | "rejected",
		note?: string,
	) {
		// Optimistic UI update
		setApprovals((prev) => prev.filter((a) => a.id !== id));
		if (selectedApproval?.id === id) {
			setSelectedApproval(null);
		}

		await fetch(`/api/v1/workflow/approvals/${id}/resolve`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				approvalId: id,
				resolution,
				note: note || undefined,
			}),
		});
	}

	const columns: ColumnDef<Approval>[] = [
		{
			header: "Command Type",
			accessorFn: (row) => row.requestContext.command_type,
		},
		{
			header: "Aggregate Type",
			accessorFn: (row) => row.requestContext.aggregate_type,
		},
		{
			header: "Actor Type",
			cell: ({ row }) => <StatusBadge status={row.original.actorType} />,
		},
		{
			header: "Status",
			cell: ({ row }) => <StatusBadge status={row.original.status} />,
		},
		{
			header: "Expires At",
			accessorFn: (row) => new Date(row.expiresAt).toLocaleString(),
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
							onClick={() => {
								setSelectedApproval(row.original);
								setRejectionNote("");
							}}
						>
							View Details
						</Button>
						{isPending && (
							<>
								<Button
									size="sm"
									onClick={() => resolve(row.original.id, "approved")}
								>
									Approve
								</Button>
								<Button
									size="sm"
									variant="destructive"
									onClick={() => resolve(row.original.id, "rejected")}
								>
									Reject
								</Button>
							</>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="p-6">
			<div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-xl font-semibold">Approvals</h1>
					<p className="text-sm text-muted-foreground">
						Trust and verification that keep the Network connected and reliable (Workspace — authenticated)
					</p>
				</div>
				<div className="flex gap-2">
					{["pending", "approved", "rejected", "expired", "all"].map(
						(filter) => (
							<Button
								key={filter}
								size="sm"
								variant={statusFilter === filter ? "default" : "outline"}
								className="capitalize"
								onClick={() => setStatusFilter(filter)}
							>
								{filter}
							</Button>
						),
					)}
				</div>
			</div>

			<div className="mb-6 text-sm text-muted-foreground max-w-2xl">
				<strong>What is this?</strong> Approvals maintain trust across
				Relationships in the ecosystem.
				<br />
				<strong>Who is connected?</strong> Requests from Events, Places,
				Organizations, and Participants.
				<br />
				<strong>What next?</strong> Review pending, approve or resolve to enable
				Participation and Opportunities.
			</div>

			{loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<DataTable data={approvals} columns={columns} />
			)}

			{/* Details & Interactive Resolution Dialog */}
			<Dialog
				open={selectedApproval !== null}
				onOpenChange={(open) => {
					if (!open) setSelectedApproval(null);
				}}
			>
				{selectedApproval && (
					<DialogContent className="max-w-xl">
						<DialogHeader>
							<DialogTitle>Approval Request Detail</DialogTitle>
							<DialogDescription>
								Detailed request context and actions history for this approval
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-4 border-b pb-4">
								<div>
									<span className="font-semibold block text-muted-foreground">
										Command Type
									</span>
									<span>{selectedApproval.requestContext.command_type}</span>
								</div>
								<div>
									<span className="font-semibold block text-muted-foreground">
										Actor Type
									</span>
									<StatusBadge status={selectedApproval.actorType} />
								</div>
								<div>
									<span className="font-semibold block text-muted-foreground">
										Aggregate Type
									</span>
									<span>{selectedApproval.requestContext.aggregate_type}</span>
								</div>
								<div>
									<span className="font-semibold block text-muted-foreground">
										Status
									</span>
									<StatusBadge status={selectedApproval.status} />
								</div>
								<div>
									<span className="font-semibold block text-muted-foreground">
										Expires At
									</span>
									<span>
										{new Date(selectedApproval.expiresAt).toLocaleString()}
									</span>
								</div>
								<div>
									<span className="font-semibold block text-muted-foreground">
										Created At
									</span>
									<span>
										{new Date(selectedApproval.createdAt).toLocaleString()}
									</span>
								</div>
							</div>

							{/* Request Payload JSON Context */}
							<div>
								<span className="font-semibold block text-muted-foreground mb-1">
									Request Payload / Context
								</span>
								<pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-40 font-mono">
									{JSON.stringify(selectedApproval.requestContext, null, 2)}
								</pre>
							</div>

							{/* Resolution details if already processed */}
							{selectedApproval.status !== "pending" && (
								<div className="p-3 bg-muted/50 border rounded space-y-2">
									<h4 className="font-semibold text-muted-foreground">
										Resolution Info
									</h4>
									{selectedApproval.resolvedAt && (
										<p>
											<strong>Resolved At:</strong>{" "}
											{new Date(selectedApproval.resolvedAt).toLocaleString()}
										</p>
									)}
									{selectedApproval.resolutionNote && (
										<p>
											<strong>Resolution Note:</strong>{" "}
											{selectedApproval.resolutionNote}
										</p>
									)}
								</div>
							)}

							{/* Actions for pending approvals inside the modal */}
							{selectedApproval.status === "pending" && (
								<div className="space-y-4 pt-2 border-t">
									<div className="space-y-2">
										<Label htmlFor="note">
											Resolution Note (Required for Reject)
										</Label>
										<Input
											id="note"
											placeholder="Enter a reason or feedback..."
											value={rejectionNote}
											onChange={(e) => setRejectionNote(e.target.value)}
										/>
									</div>
									<div className="flex justify-end gap-2">
										<Button
											variant="outline"
											onClick={() => setSelectedApproval(null)}
										>
											Close
										</Button>
										<Button
											variant="destructive"
											onClick={() => {
												resolve(
													selectedApproval.id,
													"rejected",
													rejectionNote || "Rejected to preserve network trust",
												);
											}}
										>
											Reject Request
										</Button>
										<Button
											onClick={() => {
												resolve(selectedApproval.id, "approved", rejectionNote);
											}}
										>
											Approve Request
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
