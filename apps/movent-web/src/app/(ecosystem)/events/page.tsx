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
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ getValue, row }) => (
			<div>
				<Link
					href={`/events/${row.original.id}`}
					className="font-medium text-foreground hover:text-primary transition-colors"
				>
					{getValue<string>()}
				</Link>
				{row.original.description && (
					<p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
						{row.original.description}
					</p>
				)}
			</div>
		),
	},
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
			if (!v) return <span className="text-muted-foreground text-xs">—</span>;
			const d = new Date(v);
			return (
				<div className="text-sm">
					<div className="font-medium">{d.toLocaleDateString()}</div>
					<div className="text-xs text-muted-foreground">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
				</div>
			);
		},
	},
	{
		header: "Network",
		cell: () => (
			<span className="text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
				Identity · Place · Org · Participation
			</span>
		),
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<Link
				href={`/events/${row.original.id}`}
				className="text-xs text-primary hover:underline font-medium"
			>
				View & Connect →
			</Link>
		),
	},
];

function EventsContent() {
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

	const handleSearchChange = (val: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (val) params.set("search", val);
		else params.delete("search");
		router.replace(`?${params.toString()}`, { scroll: false });
	};

	useEffect(() => { fetchEvents(); }, []);

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
		<div className="p-6 space-y-6">
			{/* Page header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
						<Calendar className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-foreground">Events</h1>
						<p className="text-xs text-muted-foreground mt-0.5">
							Relationships, Participation & Opportunities in the Network
						</p>
					</div>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="bg-gradient-brand hover:opacity-90 text-white border-0 shadow-sm">
							<Plus className="mr-1.5 h-3.5 w-3.5" />
							Propose Event
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Propose New Event</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
								<Input id="name" {...register("name")} placeholder="Event name" />
								{errors.name && (
									<p className="text-xs text-destructive">{errors.name.message}</p>
								)}
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="description">Description</Label>
								<Input id="description" {...register("description")} placeholder="Brief description" />
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label htmlFor="startsAt">Starts At</Label>
									<Input id="startsAt" type="datetime-local" {...register("startsAt")} />
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="endsAt">Ends At</Label>
									<Input id="endsAt" type="datetime-local" {...register("endsAt")} />
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="timezone">Timezone</Label>
								<Input id="timezone" {...register("timezone")} />
							</div>
							<div className="flex justify-end gap-2 pt-2">
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting} className="bg-gradient-brand text-white border-0">
									{isSubmitting ? "Creating…" : "Create Event"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
				<Input
					placeholder="Search events in the network..."
					defaultValue={q}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="pl-9 text-sm"
				/>
			</div>

			{/* Featured Events */}
			{!loading && filteredEvents.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
						Featured Events
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{filteredEvents.slice(0, 3).map((e) => (
							<Link
								key={e.id}
								href={`/events/${e.id}`}
								className="group rounded-xl border border-border/60 bg-card p-4 card-hover shadow-sm"
							>
								<div className="flex items-start gap-3">
									<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
										<Calendar className="h-4 w-4 text-white" />
									</div>
									<div className="min-w-0">
										<div className="font-semibold text-sm truncate">{e.name}</div>
										<div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
											{e.description || "No description"}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* Error & loading states */}
			{loading && (
				<div className="space-y-2">
					<Skeleton className="h-10 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-xl" />
				</div>
			)}
			{error && (
				<div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
					{error}
				</div>
			)}

			{/* Data table */}
			<div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
				<DataTable data={filteredEvents} columns={columns} />
			</div>

			{!loading && filteredEvents.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<Calendar className="h-8 w-8 mx-auto mb-3 opacity-30" />
					<p className="text-sm">No events match. Try broadening your search or propose one.</p>
				</div>
			)}
		</div>
	);
}

export default function EventsPage() {
	return (
		<Suspense
			fallback={
				<div className="p-6 space-y-4">
					<Skeleton className="h-10 w-48 rounded-xl" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			}
		>
			<EventsContent />
		</Suspense>
	);
}
