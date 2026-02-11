/**
 * Mobile-only bottom navigation bar — thumb-zone friendly.
 * Uses ShadCN Button ghost variant with direct Lucide imports.
 * Hidden on desktop via md:hidden. Provides Home, Search, Theme cycle, Scroll to top.
 */

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Home, Search, Palette, ChevronUp } from 'lucide-react';
import { clearCurrentPost, fetchPosts } from '../../redux/actions/posts';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { clearComments } from '../../redux/actions/comments';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const dispatch = useDispatch();
  const { currentPost } = useSelector((state) => state.posts);
  const { selected: selectedSubreddit } = useSelector((state) => state.subreddits);

  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('lfc-theme') || 'red'
  );

  const handleHomeClick = useCallback(() => {
    if (currentPost) {
      dispatch(clearCurrentPost());
      dispatch(clearComments());
    }
    if (selectedSubreddit !== 'LiverpoolFC') {
      dispatch(setSelectedSubreddit('LiverpoolFC'));
      dispatch(fetchPosts('LiverpoolFC'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, currentPost, selectedSubreddit]);

  const handleSearchClick = useCallback(() => {
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleThemeClick = useCallback(() => {
    const themes = ['red', 'white', 'black'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % 3];

    setCurrentTheme(nextTheme);
    localStorage.setItem('lfc-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }, [currentTheme]);

  const handleScrollToTopClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navItems = [
    { label: 'Home', icon: Home, onClick: handleHomeClick, testId: 'nav-home', ariaLabel: 'Go to home' },
    { label: 'Search', icon: Search, onClick: handleSearchClick, testId: 'nav-search', ariaLabel: 'Focus search' },
    { label: 'Theme', icon: Palette, onClick: handleThemeClick, testId: null, ariaLabel: `Switch theme (current: ${currentTheme})` },
    { label: 'Top', icon: ChevronUp, onClick: handleScrollToTopClick, testId: null, ariaLabel: 'Scroll to top' },
  ];

  return (
    <nav
      data-testid="bottom-nav"
      className={cn(
        'fixed bottom-0 inset-x-0 z-50',
        'md:hidden',
        'border-t border-border/40',
        'bg-background/90 backdrop-blur-md',
        'supports-[backdrop-filter]:bg-background/70',
        'safe-bottom',
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(({ label, icon: Icon, onClick, testId, ariaLabel }) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            onClick={onClick}
            aria-label={ariaLabel}
            data-testid={testId}
            className={cn(
              'flex flex-col items-center gap-0.5 h-auto py-1.5 px-3',
              'text-muted-foreground hover:text-foreground',
              'active:scale-95 transition-all',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default React.memo(BottomNav);
