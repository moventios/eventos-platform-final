import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ResourcePageLayoutProps<T> {
  title: string;
  description: string;
  icon: ReactNode;
  iconGradient: string;

  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;

  data: T[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;

  createButtonText: string;
  createButtonIcon?: ReactNode;
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  createDialogTitle: string;
  createDialogContent: ReactNode;

  featuredItems?: T[];
  renderFeaturedItem?: (item: T) => ReactNode;
  featuredTitle?: string;

  columns: ColumnDef<T>[];

  headerActions?: ReactNode;
  children?: ReactNode;
}

export function ResourcePageLayout<T>({
  title,
  description,
  icon,
  iconGradient,
  searchPlaceholder = 'Search...',
  searchQuery,
  onSearchChange,
  data,
  loading,
  error,
  emptyMessage,
  createButtonText,
  createButtonIcon,
  isCreateOpen,
  onCreateOpenChange,
  createDialogTitle,
  createDialogContent,
  featuredItems,
  renderFeaturedItem,
  featuredTitle = 'Featured',
  columns,
  headerActions,
  children,
}: ResourcePageLayoutProps<T>) {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-sm`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {headerActions}
          <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className={`border-0 bg-gradient-to-br ${iconGradient} text-white shadow-sm hover:opacity-90`}>
                {createButtonIcon}
                {createButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{createDialogTitle}</DialogTitle>
              </DialogHeader>
              {createDialogContent}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          defaultValue={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Featured Items */}
      {!loading && featuredItems && featuredItems.length > 0 && renderFeaturedItem && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {featuredTitle}
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {featuredItems.map(renderFeaturedItem)}
          </div>
        </div>
      )}

      {/* Error & loading states */}
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Data table */}
      <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <DataTable data={data} columns={columns} />
      </div>

      {!loading && data.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <div className="mx-auto mb-3 h-8 w-8 opacity-30 flex justify-center items-center">
            {icon}
          </div>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}

      {/* Optional Below Content */}
      {children}
    </div>
  );
}
