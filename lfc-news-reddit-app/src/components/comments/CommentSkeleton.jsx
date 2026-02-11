import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * CommentSkeleton — Loading placeholder that mirrors the shape of
 * threaded comments. Shows 4 skeleton comments with varying widths
 * to simulate a realistic thread structure.
 */
const CommentSkeleton = ({ count = 4 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div data-testid="comments-skeleton" className="space-y-4">
      {skeletons.map((index) => (
        <div
          key={index}
          data-testid="comment-skeleton"
          className={cn(
            'space-y-2',
            index % 2 === 1 && 'ml-6 md:ml-8 border-l-[3px] border-muted pl-3',
          )}
        >
          {/* Header: avatar + author + score */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>

          {/* Body lines */}
          <div className="pl-8 space-y-1.5">
            <Skeleton className={cn('h-3', index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-4/5' : 'w-3/5')} />
            <Skeleton className={cn('h-3', index % 2 === 0 ? 'w-3/4' : 'w-2/3')} />
            {index < 2 && <Skeleton className="h-3 w-1/2" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export { CommentSkeleton };
export default CommentSkeleton;
