"use client";

import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Event = {
	id: string;
	tenantId: string;
	name: string;
	description: string | null;
	startsAt: string | null;
	endsAt: string | null;
	timezone: string;
	status: string;
	createdAt: string;
};

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	startsAt: z.string().optional(),
	endsAt: z.string().optional(),
	timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: ColumnDef<Event>[] = [
	{ accessorKey: "name", header: "Name" },
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
	},
	{
		accessorKey: "startsAt",
		header: "Starts At",
		cell: ({ getValue }) => {
			const v = getValue<string | null>();
			return v ? new Date(v).toLocaleString() : "—";
		},
	},
	{
		header: "In the Network",
		cell: () => (
			<span className="text-[10px] text-muted-foreground">
				Connects: Identity • Place • Organization • Participation
			</span>
		),
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<a
				href={`/events/${row.original.id}`}
				className="text-xs text-primary hover:underline"
			>
				View & Connect
			</a>
		),
	},
];

function EventsContent() {
	// Public events as collaboration nodes in the network
	const searchParams = useSearchParams();
	const router = useRouter();
	const q = (searchParams.get("search") || "").toLowerCase();

	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const filteredEvents = q
		? events.filter(
				(e) =>
					(e.name || "").toLowerCase().includes(q) ||
					(e.description || "").toLowerCase().includes(q),
			)
		: events;

	const fetchEvents = () => {
		setLoading(true);
		setError(null);
		fetch("/api/v1/commerce/events")
			.then((r) => (r.ok ? r.json() : []))
			.then((data) => setEvents(data || []))
			.catch(() => {
				setEvents([]);
				setError("Could not load events (try searching or signing in for full access).");
			})
			.finally(() => setLoading(false));
	};

	// minimal search input on list (updates URL param for universal discovery)
	const handleSearchChange = (val: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (val) params.set("search", val);
		else params.delete("search");
		router.replace(`?${params.toString()}`, { scroll: false });
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { timezone: "Asia/Jakarta" },
	});

	const onSubmit = async (data: FormValues) => {
		const res = await fetch("/api/v1/commerce/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			setError("Create failed (may require workspace tenant).");
			return;
		}
		reset();
		setOpen(false);
		fetchEvents();
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Events</h1>
				<p className="text-muted-foreground mt-1 max-w-2xl">
					<strong>What is this?</strong> Events that create
					Relationships, Participation, and Opportunities in the Network.
					<br />
					<strong>Who is connected?</strong> Organizations, Places, Identity,
					and Governance.
					<br />
					<strong>What next?</strong> Discover. Participate via Credentials or
					Activation.
				</p>
			</div>
			{/* Search input on list page for direct discovery (syncs ?search; reuse Input) */}
			<div className="max-w-sm mb-4">
				<Input
					placeholder="Search events in the network..."
					defaultValue={q}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="text-sm"
				/>
			</div>

			{/* Featured Events - reuse data for rich directory */}
			{!loading && filteredEvents.length > 0 && (
				<div>
					<h3 className="text-sm font-medium mb-2">Featured Events</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{filteredEvents.slice(0, 3).map((e) => (
							<Link
								key={e.id}
								href={`/events/${e.id}`}
								className="p-4 border rounded hover:bg-accent"
							>
								<div className="font-medium">{e.name}</div>
								<div className="text-xs text-muted-foreground">
									{e.description || "No description"}
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<div />
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm">Propose Event</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Event</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-1">
								<Label htmlFor="name">Name *</Label>
								<Input id="name" {...register("name")} />
								{errors.name && (
									<p className="text-xs text-destructive">
										{errors.name.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label htmlFor="description">Description</Label>
								<Input id="description" {...register("description")} />
							</div>
							<div className="space-y-1">
								<Label htmlFor="startsAt">Starts At</Label>
								<Input
									id="startsAt"
									type="datetime-local"
									{...register("startsAt")}
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="endsAt">Ends At</Label>
								<Input
									id="endsAt"
									type="datetime-local"
									{...register("endsAt")}
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="timezone">Timezone</Label>
								<Input id="timezone" {...register("timezone")} />
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									Create
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			{loading && <Skeleton className="h-10 w-full mb-2" />}
			{error && <div className="text-sm text-destructive mb-2">{error}</div>}
			<DataTable data={filteredEvents} columns={columns} />
			{!loading && filteredEvents.length === 0 && (
				<p className="text-sm text-muted-foreground mt-2">No events match. Try broadening your search or propose one.</p>
			)}
		</div>
	);
}

export default function EventsPage() {
	return (
		<Suspense
			fallback={
				<div className="p-6 text-sm text-muted-foreground">
					Loading events...
				</div>
			}
		>
			<EventsContent />
		</Suspense>
	);
}
