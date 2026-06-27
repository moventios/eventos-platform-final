"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowRight,
	BookOpen,
	Calendar,
	FolderKanban,
	Handshake,
	MapPin,
	Search,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Event = {
	id: string;
	name: string;
	description: string | null;
	status?: string;
};
type Facility = { id: string; name: string; address?: string; status?: string };

const intentCards = [
	{ href: "/events", label: "Meet people", desc: "Profiles via events", icon: Users, color: "from-blue-500 to-indigo-600" },
	{ href: "/facilities", label: "Find places", desc: "Spaces for gatherings", icon: MapPin, color: "from-emerald-500 to-teal-600" },
	{ href: "/events", label: "Discover events", desc: "Happening near you", icon: Calendar, color: "from-violet-500 to-purple-600" },
	{ href: "/events", label: "Find projects", desc: "Collaborate on work", icon: FolderKanban, color: "from-orange-500 to-rose-600" },
	{ href: "/events", label: "Opportunities", desc: "Jobs, sponsorships", icon: Zap, color: "from-amber-500 to-orange-600" },
	{ href: "/events", label: "Learn", desc: "Knowledge at events", icon: BookOpen, color: "from-teal-500 to-cyan-600" },
	{ href: "/facilities", label: "Join communities", desc: "Groups at places", icon: Handshake, color: "from-pink-500 to-rose-600" },
	{ href: "/events", label: "Collaborate", desc: "Build with others", icon: Users, color: "from-indigo-500 to-blue-600" },
];

const exploreNodes = [
	{ href: "/events", label: "People", desc: "Active profiles via events", icon: Users },
	{ href: "/events", label: "Organizations", desc: "Driving ecosystem impact", icon: Zap },
	{ href: "/events", label: "Communities", desc: "Shared purpose at places", icon: Handshake },
	{ href: "/events", label: "Projects", desc: "Collaborative work", icon: FolderKanban },
	{ href: "/events", label: "Events", desc: "Happening now", icon: Calendar },
	{ href: "/facilities", label: "Places", desc: "Spaces for gatherings", icon: MapPin },
];

export default function EcosystemHome() {
	const [events, setEvents] = useState<Event[]>([]);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			fetch("/api/v1/commerce/events").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/v1/spatial/facilities").then((r) => (r.ok ? r.json() : [])),
		])
			.then(([evs, facs]) => {
				setEvents(evs || []);
				setFacilities(facs || []);
			})
			.catch(() => {
				setEvents([]);
				setFacilities([]);
			})
			.finally(() => setLoading(false));
	}, []);

	const featuredEvents = events.slice(0, 3);
	const featuredPlaces = facilities.slice(0, 3);

	const recentActivity = [
		...events.slice(0, 2).map((e, i) => ({
			text: `${e.name} is live in the Network`,
			sub: i ? "recently" : "just now",
		})),
		...facilities.slice(0, 1).map((f) => ({
			text: `${f.name} ready for gatherings`,
			sub: "today",
		})),
	];

	return (
		<div className="min-h-full">
			{/* Hero */}
			<div className="bg-gradient-hero border-b border-border/40 px-6 py-12">
				<div className="max-w-3xl mx-auto text-center space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-medium">
						<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
						Public Ecosystem Network
					</div>
					<h1 className="text-4xl font-bold tracking-tight text-foreground">
						Discover Places, Events,
						<span className="block text-gradient">Organizations & Opportunities</span>
					</h1>
					<p className="text-muted-foreground max-w-xl mx-auto text-base">
						The public Relationship, Activation & Collaboration Network on Movent infrastructure.
					</p>

					{/* Search */}
					<div className="relative max-w-xl mx-auto">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<form action="/events" method="get">
							<input
								type="text"
								name="search"
								placeholder="Search events, places, people, organizations..."
								className="w-full pl-11 pr-6 py-3.5 text-sm border border-border rounded-xl bg-card/80 backdrop-blur-sm
									focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
									shadow-sm placeholder:text-muted-foreground/60"
							/>
						</form>
						<p className="text-center text-[10px] text-muted-foreground/60 mt-1.5">
							Discover Events, Places, Organizations, and more across the ecosystem
						</p>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
				{/* Intent cards — What are you looking for? */}
				<section>
					<h2 className="text-lg font-semibold mb-5 text-foreground">
						What are you looking for?
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{intentCards.map((card) => (
							<Link
								key={card.label}
								href={card.href}
								className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 card-hover shadow-sm"
							>
								<div className={`mb-2.5 h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
									<card.icon className="h-4 w-4 text-white" />
								</div>
								<div className="font-semibold text-sm text-foreground">{card.label}</div>
								<div className="text-xs text-muted-foreground mt-0.5">{card.desc}</div>
							</Link>
						))}
					</div>
				</section>

				{/* Trending / Featured */}
				<section>
					<div className="flex items-center justify-between mb-5">
						<h2 className="text-lg font-semibold text-foreground">Trending in the Network</h2>
						<Link href="/events" className="text-xs text-primary hover:underline flex items-center gap-1">
							View all <ArrowRight className="h-3 w-3" />
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{loading ? (
							<>
								<Skeleton className="h-28 w-full rounded-xl" />
								<Skeleton className="h-28 w-full rounded-xl" />
								<Skeleton className="h-28 w-full rounded-xl" />
							</>
						) : featuredEvents.length > 0 ? (
							featuredEvents.map((e) => (
								<Link
									key={e.id}
									href={`/events/${e.id}`}
									className="group rounded-xl border border-border/60 bg-card p-4 card-hover shadow-sm"
								>
									<div className="flex items-start gap-3">
										<div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
											<Calendar className="h-5 w-5 text-white" />
										</div>
										<div className="min-w-0">
											<div className="font-semibold text-sm text-foreground truncate">{e.name}</div>
											<div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
												{e.description || "Event in the network"}
											</div>
											<div className="text-[10px] text-primary mt-1.5 font-medium">
												View & connect →
											</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<>
								<FallbackCard icon={Calendar} title="AI Summit Jakarta" desc="Technology & Innovation" color="from-blue-500 to-indigo-600" />
								<FallbackCard icon={Users} title="Startup Community" desc="Networking Event" color="from-violet-500 to-purple-600" />
								<FallbackCard icon={MapPin} title="WeWork Sudirman" desc="Co-working Space" color="from-emerald-500 to-teal-600" />
							</>
						)}
					</div>
				</section>

				{/* Featured Places */}
				{(loading || featuredPlaces.length > 0) && (
					<section>
						<div className="flex items-center justify-between mb-5">
							<h2 className="text-lg font-semibold text-foreground">Featured Places</h2>
							<Link href="/facilities" className="text-xs text-primary hover:underline flex items-center gap-1">
								View all <ArrowRight className="h-3 w-3" />
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{loading ? (
								<>
									<Skeleton className="h-24 w-full rounded-xl" />
									<Skeleton className="h-24 w-full rounded-xl" />
									<Skeleton className="h-24 w-full rounded-xl" />
								</>
							) : (
								featuredPlaces.map((f) => (
									<Link
										key={f.id}
										href={`/facilities/${f.id}`}
										className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 card-hover shadow-sm"
									>
										<div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
											<MapPin className="h-5 w-5 text-white" />
										</div>
										<div className="min-w-0">
											<div className="font-semibold text-sm text-foreground truncate">{f.name}</div>
											<div className="text-xs text-muted-foreground mt-0.5 truncate">
												{f.address || "Place for gatherings"}
											</div>
										</div>
									</Link>
								))
							)}
						</div>
					</section>
				)}

				{/* Activity Feed */}
				{recentActivity.length > 0 && (
					<section>
						<h2 className="text-lg font-semibold mb-5">Recent Activity</h2>
						<div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
							{recentActivity.map((a, i) => (
								<div
									key={`act-${i}`}
									className={`flex items-start gap-3 px-5 py-3.5 text-sm ${
										i < recentActivity.length - 1 ? "border-b border-border/40" : ""
									}`}
								>
									<div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
									<div className="flex-1">{a.text}</div>
									<span className="text-xs text-muted-foreground shrink-0">{a.sub}</span>
								</div>
							))}
							<div className="px-5 py-3 bg-muted/30">
								<Link href="/events" className="text-xs text-primary font-medium hover:underline">
									Discover more activity →
								</Link>
							</div>
						</div>
					</section>
				)}

				{/* Explore the Network */}
				<section>
					<h2 className="text-lg font-semibold mb-5">Explore the Network</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
						{exploreNodes.map((node) => (
							<Link
								key={node.label}
								href={node.href}
								className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 text-center card-hover shadow-sm"
							>
								<div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
									<node.icon className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="font-semibold text-xs text-foreground">{node.label}</div>
								<div className="text-[10px] text-muted-foreground leading-tight">{node.desc}</div>
							</Link>
						))}
					</div>
				</section>

				{/* CTA */}
				<section className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-10 text-center">
					<h2 className="text-2xl font-bold mb-2 text-foreground">
						Become part of the network
					</h2>
					<p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
						Create your profile and start discovering real opportunities and relationships.
					</p>
					<Link
						href="/onboarding"
						className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-brand text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
					>
						Join Moventios <ArrowRight className="h-4 w-4" />
					</Link>
				</section>
			</div>
		</div>
	);
}

function FallbackCard({
	icon: Icon,
	title,
	desc,
	color,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	desc: string;
	color: string;
}) {
	return (
		<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
					<Icon className="h-5 w-5 text-white" />
				</div>
				<div>
					<div className="font-semibold text-sm text-foreground">{title}</div>
					<div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
				</div>
			</div>
		</div>
	);
}
