'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@movent/infrastructure/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeRedirectPath } from '@/lib/safe-redirect-path';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Lock, Zap, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

const networkFeatures = [
	{ icon: Calendar, text: 'Discover events happening near you' },
	{ icon: MapPin, text: 'Find places for gatherings & collaboration' },
	{ icon: Users, text: 'Connect with people & organizations' },
	{ icon: Zap, text: 'Find opportunities & projects' },
];

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [magicSent, setMagicSent] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = sanitizeRedirectPath(searchParams.get('redirectTo'));
	const callbackFailed = searchParams.get('error') === 'auth_callback_failed';
	const supabase = createSupabaseBrowserClient();

	async function handlePasswordLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			setError(error.message);
		} else {
			router.push(redirectTo);
			router.refresh();
		}
		setLoading(false);
	}

	async function handleMagicLink(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const callbackUrl = new URL('/auth/callback', window.location.origin);
		if (redirectTo !== '/') callbackUrl.searchParams.set('next', redirectTo);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: callbackUrl.toString() },
		});
		if (error) {
			setError(error.message);
		} else {
			setMagicSent(true);
		}
		setLoading(false);
	}

	if (magicSent) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-gradient-hero p-6">
				<div className="w-full max-w-sm space-y-4 rounded-2xl border border-border/60 bg-card shadow-modal p-8 text-center animate-fade-in">
					<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
						<Mail className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-xl font-bold">Check your email</h1>
					<p className="text-sm text-muted-foreground">
						A magic link has been sent to{' '}
						<span className="font-semibold text-foreground">{email}</span>.
						<br />Click the link to sign in securely.
					</p>
					<Link href="/" className="block text-xs text-primary hover:underline">
						← Explore the network while you wait
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen">
			{/* Left: Brand panel */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-brand flex-col justify-between p-10 relative overflow-hidden">
				{/* Background orbs */}
				<div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/3 blur-3xl" />

				{/* Brand */}
				<div className="relative">
					<div className="flex items-center gap-3 mb-2">
						<div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
							<span className="text-white font-bold text-lg">M</span>
						</div>
						<span className="text-white font-bold text-xl">Moventios</span>
					</div>
					<p className="text-white/70 text-sm">
						The public Relationship, Activation & Collaboration Network
					</p>
				</div>

				{/* Features */}
				<div className="relative space-y-4">
					<p className="text-white/90 font-semibold text-lg">
						Join the ecosystem network
					</p>
					{networkFeatures.map((f) => (
						<div key={f.text} className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
								<f.icon className="h-4 w-4 text-white" />
							</div>
							<span className="text-white/80 text-sm">{f.text}</span>
						</div>
					))}
				</div>

				{/* Tagline */}
				<div className="relative">
					<p className="text-white/50 text-xs">
						Powered by Movent Infrastructure
					</p>
				</div>
			</div>

			{/* Right: Form */}
			<div className="flex-1 flex items-center justify-center p-6 bg-background">
				<div className="w-full max-w-sm space-y-6 animate-fade-in">
					{/* Mobile brand */}
					<div className="lg:hidden text-center">
						<div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center mx-auto mb-3">
							<span className="text-white font-bold">M</span>
						</div>
						<h1 className="text-xl font-bold">Moventios</h1>
					</div>

					<div>
						<h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
						<p className="text-muted-foreground text-sm mt-1">
							Sign in to your workspace
						</p>
					</div>

					{callbackFailed && (
						<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
							Sign-in could not be completed. Please try again.
						</div>
					)}

					{error && (
						<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
							{error}
						</div>
					)}

					<form onSubmit={handlePasswordLogin} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="pl-10"
									autoComplete="email"
									placeholder="you@example.com"
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="pl-10"
									autoComplete="current-password"
									placeholder="••••••••"
								/>
							</div>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-brand hover:opacity-90 text-white border-0 shadow-sm"
						>
							{loading ? 'Signing in…' : (
								<>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
							)}
						</Button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">or</span>
						</div>
					</div>

					<Button
						variant="outline"
						className="w-full"
						onClick={handleMagicLink}
						disabled={loading || !email}
					>
						<Mail className="mr-2 h-4 w-4" />
						Send magic link to {email || 'your email'}
					</Button>

					<p className="text-center text-xs text-muted-foreground">
						No account?{' '}
						<Link href="/" className="text-primary hover:underline font-medium">
							Explore the network first →
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}