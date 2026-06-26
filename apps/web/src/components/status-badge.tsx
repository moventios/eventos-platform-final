import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-blue-100 text-blue-700',
  live: 'bg-green-100 text-green-700',
  concluded: 'bg-purple-100 text-purple-700',
  canceled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
  active: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-teal-100 text-teal-700',
  revoked: 'bg-red-100 text-red-700',
  maintenance: 'bg-orange-100 text-orange-700',
  decommissioned: 'bg-gray-100 text-gray-500',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        statusColors[status] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
