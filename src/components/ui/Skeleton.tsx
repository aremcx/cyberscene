import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-700/50';

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return <div className={cn(baseStyles, variants[variant], className)} />;
}

export function ArticleCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 space-y-4">
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
