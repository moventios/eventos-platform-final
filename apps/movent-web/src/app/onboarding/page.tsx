'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  ownerEmail: z.string().email('Enter a valid email'),
  ownerDisplayName: z.string().min(1).max(255).optional(),
});

type FormValues = z.infer<typeof schema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const name = watch('name');
  const slug = watch('slug');

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    const res = await fetch('/api/v1/iam/tenants', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as {
        error?: string | { formErrors?: string[] };
      } | null;
      const message =
        typeof payload?.error === 'string'
          ? payload.error
          : payload?.error && 'formErrors' in payload.error
            ? payload.error.formErrors?.join(', ')
            : 'Failed to create organization';
      setApiError(message ?? 'Failed to create organization');
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push('/app');
      router.refresh();
    }, 1500);
  };

  if (done) {
    return (
      <main className="bg-gradient-hero flex min-h-screen items-center justify-center p-6">
        <div className="animate-fade-in space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Organization created!</h2>
          <p className="text-sm text-muted-foreground">Taking you to the network…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-hero flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden flex-col justify-center px-12 py-10 lg:flex lg:w-2/5">
        <div className="max-w-xs">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-xl shadow-sm">
              <span className="font-bold text-white">M</span>
            </div>
            <span className="text-gradient text-xl font-bold">Moventios</span>
          </Link>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
            Set up your
            <br />
            <span className="text-gradient">Organization</span>
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Your organization is your workspace on Moventios. You'll be able to manage events,
            places, team members, and approvals.
          </p>
          <div className="space-y-3">
            {[
              'Create events & manage participation',
              'Register and manage places',
              'Invite team members',
              'Manage approvals & trust',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="animate-fade-in w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <div className="bg-gradient-brand mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
              <span className="font-bold text-white">M</span>
            </div>
            <p className="text-sm text-muted-foreground">Set up your organization</p>
          </div>

          <div className="bg-card/80 space-y-6 rounded-2xl border border-border/60 p-8 shadow-modal backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">New Organization</h1>
                <p className="text-xs text-muted-foreground">
                  Explore the public Network first, then create your workspace
                </p>
              </div>
            </div>

            {apiError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Organization name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Acme Corp"
                  onBlur={() => {
                    const currentSlug = slug;
                    if (!currentSlug && name) {
                      setValue('slug', slugify(name), { shouldValidate: true });
                    }
                  }}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  URL slug <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs text-muted-foreground">
                    moventios.com/
                  </span>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="acme-corp"
                    className="pl-[110px]"
                  />
                </div>
                {slug && (
                  <p className="text-xs text-muted-foreground">
                    Your workspace will be at:{' '}
                    <span className="font-medium text-foreground">moventios.com/{slug}</span>
                  </p>
                )}
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ownerEmail">
                  Owner email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  {...register('ownerEmail')}
                  placeholder="you@example.com"
                />
                {errors.ownerEmail && (
                  <p className="text-xs text-destructive">{errors.ownerEmail.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ownerDisplayName">
                  Display name <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="ownerDisplayName"
                  {...register('ownerDisplayName')}
                  placeholder="Your name"
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-brand w-full border-0 text-white shadow-sm hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Creating organization…'
                ) : (
                  <>
                    Create organization <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
