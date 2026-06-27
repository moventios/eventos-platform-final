"use client";

import { BookingCalendar } from "@/components/booking-calendar";
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
import {
	ArrowLeft,
	BookOpen,
	CalendarDays,
	MapPin,
	Plus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const roomSchema = z.object({
	name: z.string().min(1, "Name required"),
	capacity: z.coerce.number().int().positive(),
});
type RoomForm = z.infer<typeof roomSchema>;

const bookingSchema = z.object({
	roomId: z.string().min(1),
	title: z.string().optional(),
	startsAt: z.string().min(1),
	endsAt: z.string().min(1),
});
type BookingForm = z.infer<typeof bookingSchema>;

interface Room {
	id: string;
	name: string;
	capacity: number;
	status: string;
}

interface Booking {
	id: string;
	title?: string;
	roomId?: string;
	startAt: string;
	endAt: string;
	status: string;
}

export default function PlaceDetailPage() {
	const params = useParams<{ id: string }>();
	const facilityId = params?.id;
	const [rooms, setRooms] = useState<Room[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [placeName, setPlaceName] = useState("");
	const [placeData, setPlaceData] = useState<{ address?: string | undefined; status?: string | undefined } | null>(null);
	const [loading, setLoading] = useState(true);
	const [roomDialogOpen, setRoomDialogOpen] = useState(false);
	const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const roomsRef = useRef<Room[]>([]);

	const { register: regRoom, handleSubmit: handleRoom, reset: resetRoom, formState: { errors: roomErr } } = useForm<RoomForm>({
		resolver: zodResolver(roomSchema),
		defaultValues: { capacity: 10 },
	});

	const { register: regBook, handleSubmit: handleBook, reset: resetBook, setValue: setBookValue, formState: { errors: bookErr } } = useForm<BookingForm>({
		resolver: zodResolver(bookingSchema),
	});

	async function loadData() {
		if (!facilityId) return;
		setLoading(true);
		try {
			const [facRes, roomsRes, bookRes] = await Promise.all([
				fetch("/api/v1/spatial/facilities").then((r) => r.json()),
				fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`).then((r) => r.json()),
				fetch("/api/v1/spatial/bookings").then((r) => r.json()),
			]);
			const facs = (facRes || []) as Array<{ id: string; name?: string; address?: string; status?: string }>;
			const fac = facs.find((f) => f.id === facilityId);
			if (fac) {
				setPlaceName(fac.name || facilityId);
				setPlaceData({ address: fac.address, status: fac.status });
			}
			setRooms(roomsRes || []);
			roomsRef.current = roomsRes || [];
			const currentRooms = roomsRef.current || [];
			const bks = (bookRes || []) as Booking[];
			setBookings(bks.filter((b) => !b.roomId || currentRooms.some((r) => r.id === b.roomId)));
		} catch {
			setError("Unable to load place details.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { loadData(); }, [facilityId]);

	async function onCreateRoom(data: RoomForm) {
		setSubmitting(true);
		setError(null);
		const res = await fetch(`/api/v1/spatial/facilities/${facilityId}/rooms`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ facilityId, name: data.name, capacity: data.capacity }),
		});
		if (res.ok) { resetRoom(); setRoomDialogOpen(false); await loadData(); }
		else {
			const e = await res.json().catch(() => ({}));
			setError(e.error?.message || "Failed to create room");
		}
		setSubmitting(false);
	}

	async function onCreateBooking(data: BookingForm) {
		setSubmitting(true);
		setError(null);
		const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const res = await fetch("/api/v1/spatial/bookings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				roomId: data.roomId,
				startsAt: new Date(data.startsAt).toISOString(),
				endsAt: new Date(data.endsAt).toISOString(),
				title: data.title,
				idempotencyKey,
			}),
		});
		if (res.ok) { resetBook(); setBookingDialogOpen(false); await loadData(); }
		else if (res.status === 409) {
			const e = await res.json().catch(() => ({}));
			setError(e.error || "Booking conflict: time range overlaps with existing booking");
		} else {
			const e = await res.json().catch(() => ({}));
			setError(e.error || "Failed to create booking");
		}
		setSubmitting(false);
	}

	function openBookingForRoom(roomId?: string) {
		if (roomId) setBookValue("roomId", roomId);
		setBookingDialogOpen(true);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Breadcrumb */}
			<div>
				<Link href="/facilities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
					<ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
					Back to Places
				</Link>
			</div>

			{/* Place header */}
			{loading ? (
				<div className="space-y-3">
					<Skeleton className="h-8 w-64 rounded-xl" />
					<Skeleton className="h-4 w-80 rounded-xl" />
				</div>
			) : (
				<div className="flex items-start gap-4">
					<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
						<MapPin className="h-6 w-6 text-white" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="text-2xl font-bold text-foreground">{placeName || "Place"}</h1>
							{placeData?.status && <StatusBadge status={placeData.status} />}
						</div>
						{placeData?.address && (
							<p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
								<MapPin className="h-3.5 w-3.5 shrink-0" />
								{placeData.address}
							</p>
						)}
						<p className="text-xs text-muted-foreground/70 mt-2 border-t border-border/40 pt-2">
							This Place is a node in the Network — connected to Events, Organizations, and Participation Activity.
						</p>
					</div>
				</div>
			)}

			{error && (
				<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{ icon: BookOpen, label: "Spaces", val: rooms.length, color: "from-emerald-500 to-teal-600" },
					{ icon: CalendarDays, label: "Bookings", val: bookings.length, color: "from-blue-500 to-indigo-600" },
					{ icon: Users, label: "Active rooms", val: rooms.filter(r => r.status === "active").length, color: "from-violet-500 to-purple-600" },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
						<div className="flex items-center gap-2.5 mb-2">
							<div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
								<stat.icon className="h-3.5 w-3.5 text-white" />
							</div>
							<span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
						</div>
						<p className="text-2xl font-bold text-foreground">{stat.val}</p>
					</div>
				))}
			</div>

			{/* Spaces / Rooms */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-foreground">Spaces at this Place</h2>
					<Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="h-8 text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
								<Plus className="h-3.5 w-3.5 mr-1" />
								Add Space
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Space</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleRoom(onCreateRoom)} className="space-y-4">
								<div className="space-y-1.5">
									<Label>Name <span className="text-destructive">*</span></Label>
									<Input {...regRoom("name")} placeholder="Conference Room A" />
									{roomErr.name && <p className="text-xs text-destructive">{roomErr.name.message}</p>}
								</div>
								<div className="space-y-1.5">
									<Label>Capacity</Label>
									<Input type="number" {...regRoom("capacity")} />
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button type="button" variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
									<Button type="submit" disabled={submitting} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
										{submitting ? "Creating…" : "Create Space"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
					{rooms.length === 0 ? (
						<div className="py-10 text-center text-muted-foreground">
							<BookOpen className="h-8 w-8 mx-auto mb-3 opacity-30" />
							<p className="text-sm">No spaces yet. Add one to enable bookings.</p>
						</div>
					) : (
						<ul className="divide-y divide-border/40">
							{rooms.map((r) => (
								<li key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
											<BookOpen className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<span className="font-medium text-sm">{r.name}</span>
											<span className="ml-2 text-xs text-muted-foreground">cap. {r.capacity}</span>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<StatusBadge status={r.status} />
										<Button
											size="sm"
											variant="outline"
											className="h-7 text-xs"
											onClick={() => openBookingForRoom(r.id)}
										>
											Book this space
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Bookings Calendar */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-foreground">Participation & Bookings</h2>
					<Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="outline" className="h-8 text-xs">
								<Plus className="h-3.5 w-3.5 mr-1" />
								New Booking
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Activate Participation (Booking)</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleBook(onCreateBooking)} className="space-y-4">
								<div className="space-y-1.5">
									<Label>Space / Room ID</Label>
									<Input {...regBook("roomId")} placeholder="uuid of room" className="font-mono text-xs" />
									{bookErr.roomId && <p className="text-xs text-destructive">{bookErr.roomId.message}</p>}
								</div>
								<div className="space-y-1.5">
									<Label>Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
									<Input {...regBook("title")} />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<Label>Starts At</Label>
										<Input type="datetime-local" {...regBook("startsAt")} />
									</div>
									<div className="space-y-1.5">
										<Label>Ends At</Label>
										<Input type="datetime-local" {...regBook("endsAt")} />
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<Button type="button" variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
									<Button type="submit" disabled={submitting}>
										{submitting ? "Booking…" : "Submit Booking"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
					<BookingCalendar
						bookings={bookings}
						onSelectSlot={(info) => {
							if (rooms[0]) setBookValue("roomId", rooms[0].id);
							const s = info.start.slice(0, 16);
							const e = info.end.slice(0, 16);
							setBookValue("startsAt", s);
							setBookValue("endsAt", e);
							setBookingDialogOpen(true);
						}}
					/>
				</div>
			</div>

			{/* Cross-link */}
			<div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
				<span>This Place connects via Participation to Events and Organizations in the Network.</span>
				<Link href="/events" className="text-primary hover:underline font-medium shrink-0 ml-3">
					See connected Events →
				</Link>
			</div>
		</div>
	);
}
