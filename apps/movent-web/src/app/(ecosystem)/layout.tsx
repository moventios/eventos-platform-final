"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import {
	Bell,
	BookOpen,
	Calendar,
	Compass,
	FolderKanban,
	MapPin,
	MessageSquare,
	Moon,
	Radio,
	Shield,
	Sun,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const discoverNavItems = [
	{ href: "/events", label: "People", icon: Users },
	{ href: "/events", label: "Organizations", icon: Zap },
	{ href: "/events", label: "Communities", icon: Radio },
	{ href: "/events", label: "Projects", icon: FolderKanban },
	{ href: "/events", label: "Events", icon: Calendar },
	{ href: "/facilities", label: "Places", icon: MapPin },
	{ href: "/facilities", label: "Resources", icon: BookOpen },
	{ href: "/events", label: "Knowledge", icon: Compass },
];

const activityNavItems = [
	{ href: "/events", label: "Activity Feed", icon: Radio },
	{ href: "/events", label: "Messages", icon: MessageSquare },
	{ href: "/events", label: "Notifications", icon: Bell },
];

const workspaceNavItems = [
	{ href: "/approvals", label: "Approvals", icon: Shield },
];

export default function EcosystemLayout({
	children,
}: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [pendingCount, setPendingCount] = useState<number>(0);

	useEffect(() => {
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
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<aside className="w-56 shrink-0 border-r border-border/60 bg-card flex flex-col shadow-sm">
				{/* Brand */}
				<div className="px-5 py-5 border-b border-border/40">
					<Link href="/" className="flex items-center gap-2.5 group">
						<div className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-sm">
							<span className="text-white text-xs font-bold">M</span>
						</div>
						<span className="font-bold text-[15px] text-gradient">
							Moventios
						</span>
					</Link>
				</div>

				<div className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
					{/* Network home */}
					<NavLink href="/" label="Network" icon={Compass} pathname={pathname} exact />

					{/* Discover section */}
					<NavSection label="Discover">
						{discoverNavItems.map((item) => (
							<NavLink
								key={`${item.href}-${item.label}`}
								href={item.href}
								label={item.label}
								icon={item.icon}
								pathname={pathname}
							/>
						))}
					</NavSection>

					{/* Activity section */}
					<NavSection label="Activity">
						{activityNavItems.map((item) => (
							<NavLink
								key={`${item.href}-${item.label}`}
								href={item.href}
								label={item.label}
								icon={item.icon}
								pathname={pathname}
							/>
						))}
					</NavSection>

					{/* Workspace section */}
					<NavSection label="Workspace">
						{workspaceNavItems.map((item) => {
						const badgeCount = item.label === "Approvals" && pendingCount > 0 ? pendingCount : undefined;
						return (
							<NavLink
								key={item.href}
								href={item.href}
								label={item.label}
								icon={item.icon}
								pathname={pathname}
								{...(badgeCount !== undefined ? { badge: badgeCount } : {})}
								exact
							/>
						);
					})}
					</NavSection>
				</div>

				{/* Sidebar footer */}
				<div className="border-t border-border/40 px-4 py-3">
					<p className="text-[10px] text-muted-foreground/60">
						© 2024 Moventios
					</p>
				</div>
			</aside>

			{/* Main */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="border-b border-border/60 px-6 py-3.5 bg-card/60 backdrop-blur-sm flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div>
							<span className="font-semibold text-sm text-foreground">
								{[
									{ href: "/", label: "Network" },
									{ href: "/events", label: "Events" },
									{ href: "/facilities", label: "Places" },
									{ href: "/approvals", label: "Workspace" },
								].find((n) =>
									n.href === "/"
										? pathname === "/"
										: pathname.startsWith(n.href)
								)?.label ?? "Moventios"}
							</span>
							<span className="ml-2.5 text-xs text-muted-foreground hidden md:inline">
								Discover and participate
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<DarkModeToggle />
						<Link
							href="/login"
							className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
						>
							Sign in
						</Link>
					</div>
				</header>
				<main className="flex-1 overflow-y-auto animate-fade-in">
					<ErrorBoundary>{children}</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}

function NavSection({
	label,
	children,
}: { label: string; children: React.ReactNode }) {
	return (
		<div className="pt-2">
			<div className="px-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
				{label}
			</div>
			<div className="space-y-0.5">{children}</div>
		</div>
	);
}

function NavLink({
	href,
	label,
	icon: Icon,
	pathname,
	badge,
	exact = false,
}: {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	pathname: string;
	badge?: number | undefined;
	exact?: boolean | undefined;
}) {
	const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
				active
					? "bg-primary/10 text-primary shadow-sm"
					: "text-muted-foreground hover:text-foreground hover:bg-accent",
			)}
		>
			<Icon
				className={cn(
					"h-3.5 w-3.5 shrink-0 transition-colors",
					active ? "text-primary" : "text-muted-foreground/70",
				)}
			/>
			<span className="flex-1 truncate">{label}</span>
			{badge !== undefined && (
				<span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none">
					{badge}
				</span>
			)}
		</Link>
	);
}

function DarkModeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("theme");
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
			className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-150"
			aria-label="Toggle dark mode"
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
