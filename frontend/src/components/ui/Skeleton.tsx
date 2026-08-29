interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`
        bg-surface-muted rounded-md animate-pulse
        ${className}
      `}
        />
    );
}

/** Preset skeleton shaped like a ProductCard, for use in grids while loading. */
export function ProductCardSkeleton() {
    return (
        <div className="bg-surface rounded-lg shadow-soft p-4 flex flex-col gap-3">
            <Skeleton className="w-full aspect-square" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
        </div>
    );
}