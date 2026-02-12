/**
 * LfcLoadingMessages — rotating LFC-themed loading messages.
 * Displays below skeleton loaders during fetch. Rotates every 3s
 * with a crossfade animation. Makes the loading state feel alive.
 */

import React, { useState, useEffect, useRef } from 'react';
import { loadingMessages } from '../../utils/lfcData';
import { cn } from '@/lib/utils';

const LfcLoadingMessages = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * loadingMessages.length));
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(null);

  const timeoutRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Fade out, swap message, fade in
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setIndex(prev => (prev + 1) % loadingMessages.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-center py-4" role="status" aria-live="polite">
      <p
        className={cn(
          'text-sm font-medium text-primary/80 italic tracking-wide',
          'transition-all duration-300 ease-in-out',
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1'
        )}
      >
        {loadingMessages[index]}
      </p>
    </div>
  );
};

export default React.memo(LfcLoadingMessages);
