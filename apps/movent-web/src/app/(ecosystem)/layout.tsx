"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import { Calendar, Compass, MapPin, Moon, Shield, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const publicNavItems = [
	{ href: "/", label: "Network", icon: Compass },
	{ href: "/facilities", label: "Places", icon: MapPin },
	{ href: "/events", label: "Events", icon: Calendar },
];

const workspaceNavItems = [
	{ href: "/approvals", label: "Workspace", icon: Shield },
];

export default function EcosystemLayout({
	children,
}: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [pendingCount, setPendingCount] = useState<number>(0);

	useEffect(() => {
		// only fetch count on workspace pages to avoid public 401 noise
		if (!pathname.startsWith("/approvals")) {
			setPendingCount(0);
			return;
		}
		fetch("/api/v1/workflow/approvals")
			.then((r) => r.json())
			.then((data: unknown[]) => setPendingCount(data.length))
			.catch(() => setPendingCount(0));
	}, [pathname]);

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<aside className="w-56 shrink-0 border-r bg-background flex flex-col">
				<div className="px-4 py-5 font-semibold text-lg tracking-tight">
					Moventios
				</div>

				{/* Discover */}
				<div className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
					Discover
				</div>
				<nav className="flex-1 px-2 space-y-0.5">
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						People
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Organizations
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Communities
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Projects
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Events
					</Link>
					<Link
						href="/facilities"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Places
					</Link>
					<Link
						href="/facilities"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Resources
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Knowledge
					</Link>
				</nav>

				<div className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
					Activity
				</div>
				<nav className="flex-1 px-2 space-y-0.5">
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Activity Feed
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Messages
					</Link>
					<Link
						href="/events"
						className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground"
					>
						Notifications
					</Link>
				</nav>

				<div className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
					Workspace
				</div>
				<nav className="flex-1 px-2 space-y-0.5">
					{workspaceNavItems.map(({ href, label, icon: Icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
									active
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								)}
							>
								<Icon className="h-4 w-4 shrink-0" />
								<span className="flex-1">{label}</span>
								{pendingCount > 0 && label === "Workspace" && (
									<span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
										{pendingCount}
									</span>
								)}
							</Link>
						);
					})}
				</nav>
			</aside>

			{/* Main */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="border-b px-6 py-4 text-sm flex items-center justify-between">
					<div>
						<span className="font-medium">
							{[...publicNavItems, ...workspaceNavItems].find(
								(n) => n.href === pathname,
							)?.label ?? "Moventios"}
						</span>
						<span className="ml-3 text-xs text-muted-foreground hidden md:inline">
							Public ecosystem • Discover and participate
						</span>
					</div>
					<DarkModeToggle />
				</header>
				<main className="flex-1 overflow-y-auto p-6">
					<ErrorBoundary>{children}</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}

function DarkModeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		const shouldBeDark = saved === "dark" || (!saved && prefersDark);
		setIsDark(shouldBeDark);
		document.documentElement.classList.toggle("dark", shouldBeDark);
	}, []);

	const toggle = () => {
		const newDark = !isDark;
		setIsDark(newDark);
		document.documentElement.classList.toggle("dark", newDark);
		localStorage.setItem("theme", newDark ? "dark" : "light");
	};

	return (
		<button
			onClick={toggle}
			className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition"
			aria-label="Toggle dark mode"
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
