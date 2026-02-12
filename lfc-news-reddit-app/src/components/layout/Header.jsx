/**
 * Application header — sticky with backdrop-blur, like Anfield under floodlights.
 * Contains branding, search bar, theme switcher, and rotating anti-clickbait taglines.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bird } from 'lucide-react';
import SearchBar from '../shared/SearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import { antiClickbaitMessages } from '../../utils/lfcData';
import { cn } from '@/lib/utils';

const Header = () => {
  const [taglineIndex, setTaglineIndex] = useState(
    () => Math.floor(Math.random() * antiClickbaitMessages.length)
  );
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setTaglineIndex(prev => (prev + 1) % antiClickbaitMessages.length);
        setIsVisible(true);
      }, 300);
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <header
      data-testid="header"
      className={cn(
        'sticky top-0 z-50',
        'border-b border-border/40',
        'bg-background/80 backdrop-blur-md',
        'supports-backdrop-filter:bg-background/60',
      )}
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          {/* Branding */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/lfclogo.svg"
              alt="Liverpool FC crest"
              className="size-7 sm:size-8"
            />
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">
                LFC Reddit Viewer
              </h1>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight hidden xs:block">
                Liverpool FC Community Posts
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right section: Theme + Tagline */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Tagline bar — subtle LFC identity */}
        <div className={cn(
          'flex items-center justify-between',
          'py-1.5 -mt-1',
          'border-t border-border/20',
          'text-[10px] sm:text-xs text-muted-foreground/70',
          'hidden sm:flex',
        )}>
          <span className="flex items-center gap-1.5">
            <Bird className="size-3 text-primary/60" aria-hidden="true" />
            <span className="italic">You&apos;ll Never Walk Alone</span>
          </span>
          <span
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'italic transition-all duration-300 ease-in-out',
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-0.5'
            )}
          >
            {antiClickbaitMessages[taglineIndex]}
          </span>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
