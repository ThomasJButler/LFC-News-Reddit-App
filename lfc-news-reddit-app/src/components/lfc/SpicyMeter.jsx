import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SpicyMeter — visualizes Reddit post engagement with LFC-themed levels.
 * Thresholds map to iconic Liverpool moments and competitions.
 *
 * < 100: Reserves | 100-499: League Cup | 500-999: Premier League
 * 1000-4999: Champions League | 5000-9999: Istanbul 2005 | 10000+: YNWA
 */
const getSpiciness = (score) => {
  if (score >= 10000) return { level: 5, text: 'YNWA' };
  if (score >= 5000) return { level: 4, text: 'Istanbul 2005' };
  if (score >= 1000) return { level: 3, text: 'Champions League' };
  if (score >= 500) return { level: 2, text: 'Premier League' };
  if (score >= 100) return { level: 1, text: 'League Cup' };
  return { level: 1, text: 'Reserves' };
};

const SpicyMeter = ({ score }) => {
  const spiciness = getSpiciness(score);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'bg-secondary/50 backdrop-blur-sm border border-border/50',
        'text-xs font-medium tracking-wide'
      )}
      role="img"
      aria-label={`Spiciness: ${spiciness.text} (${spiciness.level} of 5 chilis)`}
      data-testid="spicy-meter"
    >
      <div className="flex items-center gap-px" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Flame
            key={i}
            size={14}
            className={cn(
              'transition-all duration-300',
              i < spiciness.level
                ? 'text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]'
                : 'text-muted-foreground/20'
            )}
            strokeWidth={i < spiciness.level ? 2.5 : 1.5}
          />
        ))}
      </div>
      <span className="text-primary font-bold uppercase tracking-wider">
        {spiciness.text}
      </span>
    </div>
  );
};

export default React.memo(SpicyMeter);
