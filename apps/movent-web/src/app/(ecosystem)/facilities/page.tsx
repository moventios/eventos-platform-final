"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Plus, Search } from "lucide-react";
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
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ getValue, row }) => (
			<div>
				<Link
					href={`/facilities/${row.original.id}`}
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
		accessorKey: "address",
		header: "Address",
		cell: ({ getValue }) => {
			const v = getValue<string>();
			return v ? (
				<div className="flex items-center gap-1.5 text-sm">
					<MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
					<span className="max-w-[200px] truncate">{v}</span>
				</div>
			) : (
				<span className="text-muted-foreground text-xs">—</span>
			);
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<Link
				href={`/facilities/${row.original.id}`}
				className="text-xs text-primary hover:underline font-medium"
			>
				View →
			</Link>
		),
	},
];

function FacilitiesContent() {
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
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

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
	} = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema) });

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
			resetB();
			setBookingOpen(false);
			fetch("/api/v1/spatial/bookings")
				.then((r) => r.json())
				.then(setBookings)
				.catch(() => {});
		} else if (res.status === 409) {
			const e = await res.json().catch(() => ({}));
			setBookingError(e.error || "Booking conflict detected. Choose different time.");
		} else {
			const e = await res.json().catch(() => ({}));
			setBookingError(e.error?.message || "Failed to book");
		}
	}

	return (
		<div className="p-6 space-y-6">
			{/* Page header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
						<MapPin className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-foreground">Places</h1>
						<p className="text-xs text-muted-foreground mt-0.5">
							Spaces where Participation & Collaboration happen in the Network
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:opacity-90 text-white border-0 shadow-sm">
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								New Place
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Add New Place</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
								<div className="space-y-1.5">
									<Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
									<Input id="name" {...register("name")} placeholder="Place name" />
									{errors.name && (
										<p className="text-xs text-destructive">{errors.name.message}</p>
									)}
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="description">Description</Label>
									<Input id="description" {...register("description")} />
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="address">Address</Label>
									<Input id="address" {...register("address")} placeholder="Full address" />
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={submitting} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
										{submitting ? "Creating…" : "Create Place"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					<Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline">
								Activate (Book)
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Activate Participation at this Place</DialogTitle>
							</DialogHeader>
							{bookingError && (
								<div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
									{bookingError}
								</div>
							)}
							<form onSubmit={handleB(onSubmitBooking)} className="space-y-4">
								<div className="space-y-1.5">
									<Label>Space / Room ID</Label>
									<Input {...regB("roomId")} placeholder="UUID of room" />
									{bErrors.roomId && (
										<p className="text-xs text-destructive">{bErrors.roomId.message}</p>
									)}
								</div>
								<div className="space-y-1.5">
									<Label>Title (optional)</Label>
									<Input {...regB("title")} />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<Label>Start</Label>
										<Input type="datetime-local" {...regB("startsAt")} />
									</div>
									<div className="space-y-1.5">
										<Label>End</Label>
										<Input type="datetime-local" {...regB("endsAt")} />
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => { setBookingOpen(false); setBookingError(null); }}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={bSubmitting}>
										{bSubmitting ? "Booking…" : "Submit Booking"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
				<Input
					placeholder="Search places in the network..."
					defaultValue={q}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="pl-9 text-sm"
				/>
			</div>

			{/* Featured Places */}
			{!loading && filteredFacilities.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
						Featured Places
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{filteredFacilities.slice(0, 3).map((f) => (
							<Link
								key={f.id}
								href={`/facilities/${f.id}`}
								className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 card-hover shadow-sm"
							>
								<div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
									<MapPin className="h-4 w-4 text-white" />
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-sm truncate">{f.name}</div>
									<div className="text-xs text-muted-foreground mt-0.5 truncate">
										{f.address || "No address"}
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

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
				<DataTable data={filteredFacilities} columns={columns} />
			</div>

			{!loading && filteredFacilities.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<MapPin className="h-8 w-8 mx-auto mb-3 opacity-30" />
					<p className="text-sm">No places match. Broaden search or create one.</p>
				</div>
			)}

			{/* Bookings calendar */}
			<div className="space-y-3">
				<h2 className="text-base font-semibold">Bookings Calendar</h2>
				<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
					<BookingCalendar
						bookings={bookings}
						onSelectSlot={(info) => {
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
				<div className="p-6 space-y-4">
					<Skeleton className="h-10 w-48 rounded-xl" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			}
		>
			<FacilitiesContent />
		</Suspense>
	);
}
