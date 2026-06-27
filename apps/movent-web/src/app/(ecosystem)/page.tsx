"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";

type Event = {
	id: string;
	name: string;
	description: string | null;
	status?: string;
};
type Facility = { id: string; name: string; address?: string; status?: string };

export default function EcosystemHome() {
	// Experience Architecture: Public ecosystem entrance.
	// Intent-first homepage. Reuses /api data for real featured/trending/activity.
	// Hero → Search → "I want to..." → Featured → Cross-linked discovery.

	const [events, setEvents] = useState<Event[]>([]);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setFetchError(null);
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
				setFetchError("Unable to load live network data (public discovery may be limited).");
			})
			.finally(() => setLoading(false));
	}, []);

	const featuredEvents = events.slice(0, 3);
	const featuredPlaces = facilities.slice(0, 3);
	// derive some activity from real data for relationship density
	const recentActivity = [
		...events
			.slice(0, 2)
			.map(
				(e, i) =>
					`${e.name} is live in the Network • ${i ? "recently" : "now"}`,
			),
		...facilities.slice(0, 1).map((f) => `${f.name} ready for gatherings`),
	];
	// cross-rel mention using both datasets (Events + Places)
	const crossMentions = events[0] && facilities[0] ? [`${events[0].name} near ${facilities[0].name}`] : [];

	return (
		<div className="space-y-12 p-6 max-w-6xl mx-auto">
			{/* Search - primary discovery interface for all nodes */}
			<div className="max-w-2xl mx-auto">
				<form action="/events" method="get">
					<input
						type="text"
						name="search"
						placeholder="Search events, places, people, organizations..."
						className="w-full px-6 py-4 text-lg border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<p className="text-center text-[10px] text-muted-foreground mt-1">
						Search discovers Events, Places, Organizations, and more across the
						ecosystem
					</p>
				</form>
			</div>

			{/* "What are you looking for?" */}
			<div>
				<h2 className="text-xl font-semibold mb-4 text-center">
					What are you looking for?
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Meet people</div>
						<div className="text-xs text-muted-foreground">
							Discover profiles and connect via events
						</div>
					</Link>
					<Link href="/facilities" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Join communities</div>
						<div className="text-xs text-muted-foreground">
							Find gatherings and groups at places
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Find opportunities</div>
						<div className="text-xs text-muted-foreground">
							Projects, jobs, sponsorships
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Discover events</div>
						<div className="text-xs text-muted-foreground">
							Events happening near you
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Find projects</div>
						<div className="text-xs text-muted-foreground">
							Collaborate on active work
						</div>
					</Link>
					<Link
						href="/facilities"
						className="p-4 border rounded hover:bg-accent"
					>
						<div className="font-medium">Find places</div>
						<div className="text-xs text-muted-foreground">
							Places for gatherings
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Learn something</div>
						<div className="text-xs text-muted-foreground">
							Knowledge shared at events
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Collaborate</div>
						<div className="text-xs text-muted-foreground">
							Build with others at events
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Hire</div>
						<div className="text-xs text-muted-foreground">
							Find talent and partners
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Volunteer</div>
						<div className="text-xs text-muted-foreground">
							Contribute to causes
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Sponsor</div>
						<div className="text-xs text-muted-foreground">
							Support events and projects
						</div>
					</Link>
				</div>
			</div>

			{/* Trending / Featured from real network data */}
			<div>
				<div className="flex gap-4 mb-4 text-sm font-medium">
					<span>Trending Events</span>
					<span className="text-muted-foreground">Places</span>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{loading ? (
						<>
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</>
					) : featuredEvents.length > 0 ? (
						featuredEvents.map((e) => (
							<Link
								key={e.id}
								href={`/events/${e.id}`}
								className="p-4 border rounded hover:bg-accent block text-sm"
							>
								<div className="font-medium">{e.name}</div>
								<div className="text-xs text-muted-foreground">
									{e.description || "Event in the network"}
								</div>
								<div className="text-[10px] text-primary mt-1">
									View &amp; connect →
								</div>
							</Link>
						))
					) : (
						<Card className="p-4 text-sm">
							{/* static fallback only when live fetch empty (public unauth or no data) */}
							Popular Event: AI Summit in Jakarta
						</Card>
					)}
					{loading ? (
						<Skeleton className="h-20 w-full" />
					) : featuredPlaces.length > 0 ? (
						featuredPlaces.map((f) => (
							<Link
								key={f.id}
								href={`/facilities/${f.id}`}
								className="p-4 border rounded hover:bg-accent block text-sm"
							>
								<div className="font-medium">{f.name}</div>
								<div className="text-xs text-muted-foreground">
									{f.address || "Place for gatherings"}
								</div>
								<div className="text-[10px] text-primary mt-1">
									View &amp; connect →
								</div>
							</Link>
						))
					) : (
						<Card className="p-4 text-sm">
							{/* static fallback only when live fetch empty (public unauth or no data) */}
							Trending Place: WeWork Sudirman
						</Card>
					)}
				</div>
				{fetchError && (
					<p className="text-xs text-muted-foreground mt-2">{fetchError} Use the discovery cards.</p>
				)}
			</div>

			{/* Activity Feed - derived from live network entities */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent className="text-sm space-y-2">
					{loading ? (
						<Skeleton className="h-4 w-3/4" />
					) : recentActivity.length > 0 ? (
						recentActivity.map((a, i) => <div key={`act-${i}`}>{a}</div>)
					) : (
						<>
							<div>Alice joined Tech Community • 2h ago</div>
							<div>StartupX hosted event at WeWork • 5h ago</div>
						</>
					)}
					{crossMentions.length > 0 && <div className="text-xs text-muted-foreground">{crossMentions[0]}</div>}
					<Link href="/events" className="text-primary text-xs">
						Discover more activity →
					</Link>
				</CardContent>
			</Card>

			{/* Sections */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Explore the Network</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">People</div>
						<div className="text-xs text-muted-foreground">
							Active profiles via events
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Organizations</div>
						<div className="text-xs text-muted-foreground">Driving impact</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Communities</div>
						<div className="text-xs text-muted-foreground">
							Shared purpose at places
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Projects</div>
						<div className="text-xs text-muted-foreground">
							Collaborative work
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Events</div>
						<div className="text-xs text-muted-foreground">Happening now</div>
					</Link>
					<Link
						href="/facilities"
						className="p-4 border rounded hover:bg-accent"
					>
						<div className="font-medium">Places</div>
						<div className="text-xs text-muted-foreground">
							Places for gatherings
						</div>
					</Link>
					<Link
						href="/facilities"
						className="p-4 border rounded hover:bg-accent"
					>
						<div className="font-medium">Resources</div>
						<div className="text-xs text-muted-foreground">
							Tools shared at places
						</div>
					</Link>
					<Link href="/events" className="p-4 border rounded hover:bg-accent">
						<div className="font-medium">Knowledge</div>
						<div className="text-xs text-muted-foreground">
							Insights from events
						</div>
					</Link>
				</div>
			</div>

			{/* Network Graph */}
			<Card>
				<CardHeader>
					<CardTitle>Network Graph</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						See how entities connect: People to Organizations, Events to Places,
						Projects to Opportunities.
					</p>
					<Link href="/events" className="text-primary text-sm">
						Explore connections via Events →
					</Link>
				</CardContent>
			</Card>

			{/* Join */}
			<div className="text-center py-8 border-t">
				<h2 className="text-2xl font-semibold mb-2">
					Become part of the network
				</h2>
				<p className="text-muted-foreground mb-4">
					Create your profile and start discovering real opportunities and
					relationships.
				</p>
				<Link
					href="/onboarding"
					className="px-8 py-3 bg-primary text-primary-foreground rounded-md"
				>
					Join Moventios
				</Link>
			</div>
		</div>
	);
}
