"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BookingCalendar } from "@/components/booking-calendar";
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

interface Facility {
	id: string;
	tenantId: string;
	name: string;
	description?: string;
	address?: string;
	geoLat?: string;
	geoLng?: string;
	status: string;
	createdAt: string;
}

interface Booking {
	id: string;
	title?: string;
	roomId?: string;
	facilityId?: string;
	startAt: string;
	endAt: string;
	status: string;
}

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const columns: ColumnDef<Facility>[] = [
	{ accessorKey: "name", header: "Name" },
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
	},
	{
		accessorKey: "address",
		header: "Address",
		cell: ({ getValue }) =>
			getValue<string>() ?? <span className="text-muted-foreground">—</span>,
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<a
				href={`/facilities/${row.original.id}`}
				className="text-xs text-primary hover:underline"
			>
				View
			</a>
		),
	},
];

function FacilitiesContent() {
	// Public discovery view - Places as nodes in the Moventios network
	const searchParams = useSearchParams();
	const router = useRouter();
	const q = (searchParams.get("search") || "").toLowerCase();

	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const filteredFacilities = q
		? facilities.filter(
				(f) =>
					(f.name || "").toLowerCase().includes(q) ||
					(f.address || "").toLowerCase().includes(q) ||
					(f.description || "").toLowerCase().includes(q),
			)
		: facilities;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	// Booking form support (P4)
	const bookingSchema = z.object({
		roomId: z.string().min(1, "Room required"),
		title: z.string().optional(),
		startsAt: z.string().min(1, "Start required"),
		endsAt: z.string().min(1, "End required"),
	});
	type BookingFormValues = z.infer<typeof bookingSchema>;
	const [bookingOpen, setBookingOpen] = useState(false);
	const [bookingError, setBookingError] = useState<string | null>(null);
	const {
		register: regB,
		handleSubmit: handleB,
		reset: resetB,
		setValue: setBValue,
		formState: { errors: bErrors, isSubmitting: bSubmitting },
	} = useForm<BookingFormValues>({
		resolver: zodResolver(bookingSchema),
	});

	useEffect(() => {
		setLoading(true);
		setError(null);
		Promise.all([
			fetch("/api/v1/spatial/facilities").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/v1/spatial/bookings").then((r) => (r.ok ? r.json() : [])),
		])
			.then(([facs, bks]) => {
				setFacilities(facs || []);
				setBookings(bks || []);
			})
			.catch(() => {
				setFacilities([]);
				setBookings([]);
				setError("Could not load places.");
			})
			.finally(() => setLoading(false));
	}, []);

	// minimal search input on list (reuses Input, updates URL for discovery)
	const handleSearchChange = (val: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (val) params.set("search", val);
		else params.delete("search");
		router.replace(`?${params.toString()}`, { scroll: false });
	};

	async function onSubmit(values: FormValues) {
		setSubmitting(true);
		const res = await fetch("/api/v1/spatial/facilities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});
		if (res.ok) {
			const created = await res.json();
			const optimistic: Facility = {
				id: created.facilityId,
				tenantId: "",
				name: values.name,
				status: "draft",
				createdAt: new Date().toISOString(),
				...(values.description ? { description: values.description } : {}),
				...(values.address ? { address: values.address } : {}),
			};
			setFacilities((prev) => [...prev, optimistic]);
			reset();
			setOpen(false);
		}
		setSubmitting(false);
	}

	async function onSubmitBooking(values: BookingFormValues) {
		setBookingError(null);
		const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		const payload = {
			roomId: values.roomId,
			startsAt: new Date(values.startsAt).toISOString(),
			endsAt: new Date(values.endsAt).toISOString(),
			title: values.title,
			idempotencyKey,
		};
		const res = await fetch("/api/v1/spatial/bookings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		if (res.ok) {
			const created = await res.json().catch(() => ({}));
			resetB();
			setBookingOpen(false);
			// refresh bookings (server now normalizes startAt/endAt)
			fetch("/api/v1/spatial/bookings")
				.then((r) => r.json())
				.then(setBookings)
				.catch(() => {});
		} else if (res.status === 409) {
			const e = await res.json().catch(() => ({}));
			setBookingError(
				e.error || "Booking conflict detected. Choose different time.",
			);
		} else {
			const e = await res.json().catch(() => ({}));
			setBookingError(e.error?.message || "Failed to book");
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Places</h1>
				<p className="text-muted-foreground mt-1 max-w-2xl">
					<strong>What is this?</strong> Places in the Network where
					Participation and Collaboration happen.
					<br />
					<strong>Who is connected?</strong> Organizations, Events, and People
					through Activity.
					<br />
					<strong>What next?</strong> Browse the Network. Activate a Place via
					Participation.
				</p>
			</div>

			{/* Search input on list page for direct discovery (reuse Input) */}
			<div className="max-w-sm mb-4">
				<Input
					placeholder="Search places in the network..."
					defaultValue={q}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="text-sm"
				/>
			</div>

			{/* Featured Places - reuse data for rich directory */}
			{!loading && filteredFacilities.length > 0 && (
				<div>
					<h3 className="text-sm font-medium mb-2">Featured Places</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{filteredFacilities.slice(0, 3).map((f) => (
							<Link
								key={f.id}
								href={`/facilities/${f.id}`}
								className="p-4 border rounded hover:bg-accent"
							>
								<div className="font-medium">{f.name}</div>
								<div className="text-xs text-muted-foreground">
									{f.address || "No address"}
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<div />
				<div className="flex gap-2">
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="mr-1.5 h-4 w-4" />
								New Place
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>New Place</DialogTitle>
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
									<Label htmlFor="address">Address</Label>
									<Input id="address" {...register("address")} />
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={submitting}>
										{submitting ? "Creating…" : "Create"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					<Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="secondary">
								Activate (Book)
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Activate Participation at this Place</DialogTitle>
							</DialogHeader>
							{bookingError && (
								<div className="text-sm text-destructive mb-2">
									{bookingError}
								</div>
							)}
							<form onSubmit={handleB(onSubmitBooking)} className="space-y-3">
								<div>
									<Label>Space (Place)</Label>
									<Input {...regB("roomId")} placeholder="uuid of room" />
									{bErrors.roomId && (
										<p className="text-xs text-destructive">
											{bErrors.roomId.message}
										</p>
									)}
								</div>
								<div>
									<Label>Title (optional)</Label>
									<Input {...regB("title")} />
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label>Start</Label>
										<Input type="datetime-local" {...regB("startsAt")} />
									</div>
									<div>
										<Label>End</Label>
										<Input type="datetime-local" {...regB("endsAt")} />
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setBookingOpen(false);
											setBookingError(null);
										}}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={bSubmitting}>
										Submit Booking
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{loading && <Skeleton className="h-10 w-full mb-2" />}
			{error && <div className="text-sm text-destructive mb-2">{error}</div>}
			<DataTable data={filteredFacilities} columns={columns} />
			{!loading && filteredFacilities.length === 0 && (
				<p className="text-sm text-muted-foreground mt-2">No places match. Broaden search or create one.</p>
			)}

			<div className="space-y-3">
				<h2 className="text-base font-medium">Bookings</h2>
				<div className="rounded-md border p-4">
					<BookingCalendar
						bookings={bookings}
						onSelectSlot={(info) => {
							// Prefill from calendar selection so list-page interaction initiates a usable booking
							const startIso = new Date(info.start).toISOString().slice(0, 16);
							const endIso = new Date(info.end).toISOString().slice(0, 16);
							setBValue("startsAt", startIso);
							setBValue("endsAt", endIso);
							setBookingOpen(true);
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default function FacilitiesPage() {
	return (
		<Suspense
			fallback={
				<div className="p-6 text-sm text-muted-foreground">
					Loading places...
				</div>
			}
		>
			<FacilitiesContent />
		</Suspense>
	);
}
