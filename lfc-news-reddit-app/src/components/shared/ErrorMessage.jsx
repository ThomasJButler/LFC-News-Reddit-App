/**
 * Error display with LFC personality — feels like a VAR review moment.
 * ShadCN Card + Button, Tailwind styling, retry with shake animation.
 */

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div
      data-testid="error-message"
      role="alert"
      className="flex items-center justify-center min-h-[300px] px-4"
    >
      <Card className={cn(
        'max-w-md w-full border-destructive/30',
        'bg-card/80 backdrop-blur-sm',
        'shadow-lg shadow-destructive/5',
      )}>
        <CardContent className="flex flex-col items-center text-center pt-8 pb-6 px-6">
          {/* Error icon with pulse ring */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
            <div className={cn(
              'relative flex items-center justify-center',
              'w-14 h-14 rounded-full',
              'bg-destructive/10 ring-1 ring-destructive/30',
            )}>
              <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-foreground mb-2 tracking-tight">
            Oops! Something went wrong
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px] mb-6">
            {message || 'Failed to load content. Please try again.'}
          </p>

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size="default"
              className={cn(
                'gap-2 font-semibold',
                'shadow-md shadow-primary/20',
                'hover:shadow-lg hover:shadow-primary/30',
                'active:scale-[0.97] transition-all',
              )}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(ErrorMessage);
