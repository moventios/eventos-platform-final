import { cn } from '@/lib/utils';

type StatusVariant = {
  dot: string;
  bg: string;
  text: string;
};

const statusVariants: Record<string, StatusVariant> = {
  draft:           { dot: 'bg-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-600 dark:text-slate-400' },
  published:       { dot: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-400' },
  live:            { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  active:          { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  concluded:       { dot: 'bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  canceled:        { dot: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-400' },
  pending:         { dot: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  approved:        { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  rejected:        { dot: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-400' },
  expired:         { dot: 'bg-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-500 dark:text-slate-500' },
  issued:          { dot: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-400' },
  checked_in:      { dot: 'bg-teal-500',    bg: 'bg-teal-50 dark:bg-teal-900/30',   text: 'text-teal-700 dark:text-teal-400' },
  revoked:         { dot: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-400' },
  maintenance:     { dot: 'bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  decommissioned:  { dot: 'bg-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-500 dark:text-slate-500' },
  human:           { dot: 'bg-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  system:          { dot: 'bg-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-900/30',   text: 'text-cyan-700 dark:text-cyan-400' },
};

const fallback: StatusVariant = {
  dot: 'bg-slate-400',
  bg: 'bg-slate-100 dark:bg-slate-800',
  text: 'text-slate-600 dark:text-slate-400',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status] ?? fallback;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-colors',
        variant.bg,
        variant.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', variant.dot)} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
