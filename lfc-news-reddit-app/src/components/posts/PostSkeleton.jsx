import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PostSkeleton = ({ count = 5 }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading posts"
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} data-testid="skeleton" className="overflow-hidden">
          <CardContent className="flex gap-4 py-4">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>

              {/* Title skeleton */}
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Preview skeleton */}
              <Skeleton className="h-3 w-5/6" />

              {/* Footer skeleton */}
              <div className="flex items-center gap-4 pt-1">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>

            {/* Thumbnail skeleton */}
            {index % 2 === 0 && (
              <Skeleton className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-lg" />
            )}
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Loading posts, please wait...</span>
    </div>
  );
};

export default PostSkeleton;
