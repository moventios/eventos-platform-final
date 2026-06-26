'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const name = watch('name');

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    const res = await fetch('/api/v1/iam/tenants', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string | { formErrors?: string[] } } | null;
      const message =
        typeof payload?.error === 'string'
          ? payload.error
          : payload?.error && 'formErrors' in payload.error
            ? payload.error.formErrors?.join(', ')
            : 'Failed to create organization';
      setApiError(message ?? 'Failed to create organization');
      return;
    }

    await res.json();
    router.push('/');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set up your organization</CardTitle>
          <CardDescription>
            Create a tenant workspace to start using Eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiError && (
            <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Organization name</Label>
              <Input
                id="name"
                {...register('name')}
                onBlur={() => {
                  const currentSlug = watch('slug');
                  if (!currentSlug && name) {
                    setValue('slug', slugify(name), { shouldValidate: true });
                  }
                }}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" {...register('slug')} placeholder="my-organization" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="ownerEmail">Owner email</Label>
              <Input id="ownerEmail" type="email" {...register('ownerEmail')} />
              {errors.ownerEmail && (
                <p className="text-xs text-destructive">{errors.ownerEmail.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="ownerDisplayName">Display name (optional)</Label>
              <Input id="ownerDisplayName" {...register('ownerDisplayName')} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}