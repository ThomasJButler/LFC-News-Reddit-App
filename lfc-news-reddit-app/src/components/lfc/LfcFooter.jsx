/**
 * LfcFooter — desktop-only footer with YNWA, anti-clickbait tagline,
 * and developer attribution. The final touch of personality at the
 * bottom of every page. Hidden on mobile to save screen real estate
 * where BottomNav already lives.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bird, Code, Coffee, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { antiClickbaitMessages } from '../../utils/lfcData';
import { cn } from '@/lib/utils';

const LfcFooter = () => {
  const [taglineIndex, setTaglineIndex] = useState(
    () => Math.floor(Math.random() * antiClickbaitMessages.length)
  );
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(null);

  const timeoutRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setTaglineIndex(prev => (prev + 1) % antiClickbaitMessages.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <footer className="hidden md:block mt-8 mb-4" role="contentinfo">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <Separator className="mb-6 opacity-30" />

        <div className="flex flex-col items-center text-center space-y-3">
          {/* YNWA */}
          <div className="flex items-center gap-2">
            <Bird className="size-4 text-primary" aria-hidden="true" />
            <p className={cn(
              'text-sm font-bold tracking-wide text-primary',
              'uppercase',
            )}>
              You&apos;ll Never Walk Alone
            </p>
            <Bird className="size-4 text-primary" aria-hidden="true" />
          </div>

          {/* Rotating anti-clickbait tagline */}
          <p
            className={cn(
              'text-xs text-muted-foreground/70 italic',
              'transition-all duration-300 ease-in-out',
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-1'
            )}
          >
            {antiClickbaitMessages[taglineIndex]}
          </p>

          {/* Attribution */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <span>Made with</span>
            <Heart className="size-3 text-primary/60 fill-primary/60" aria-hidden="true" />
            <span>by</span>
            <a
              href="https://github.com/thomasjbutler"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors"
              aria-label="Developed by Thomas Butler (opens in new tab)"
            >
              <Code className="size-3" aria-hidden="true" />
              <span className="font-medium">Thomas Butler</span>
            </a>
            <span className="text-border">&middot;</span>
            <a
              href="https://buymeacoffee.com/ojrwoqkgmv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground/70 transition-colors"
              aria-label="Buy me a coffee (opens in new tab)"
            >
              <Coffee className="size-3" aria-hidden="true" />
              <span className="font-medium">Buy Me a Coffee</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(LfcFooter);
