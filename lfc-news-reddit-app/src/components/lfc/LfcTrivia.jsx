/**
 * LfcTrivia — "Did you know?" cards interspersed in the post feed.
 * Shows random LFC historical facts. Inserted every 10 posts in PostList.
 * Uses ShadCN Card with a primary left border accent — feels like a
 * matchday programme sidebar fact.
 */

import React, { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { lfcTrivia } from '../../utils/lfcData';
import { cn } from '@/lib/utils';

const LfcTrivia = ({ seed = 0 }) => {
  // Deterministic-ish index based on seed so the same card position
  // shows the same fact on re-render (avoids flicker on state change)
  const fact = useMemo(
    () => lfcTrivia[seed % lfcTrivia.length],
    [seed]
  );

  return (
    <Card
      className={cn(
        'border-l-4 border-l-primary/70 border-y-border/30 border-r-border/30',
        'bg-card/60 backdrop-blur-sm',
        'hover:border-l-primary transition-colors duration-200',
      )}
    >
      <CardContent className="flex items-start gap-3 py-4 px-4">
        <div className={cn(
          'flex items-center justify-center shrink-0',
          'size-8 rounded-full',
          'bg-primary/10 ring-1 ring-primary/20',
        )}>
          <Lightbulb className="size-4 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70">
            Did you know?
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fact}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(LfcTrivia);
