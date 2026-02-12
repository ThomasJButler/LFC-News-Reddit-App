/**
 * Mobile-only bottom navigation bar — thumb-zone friendly.
 * Uses ShadCN Button ghost variant with direct Lucide imports.
 * Hidden on desktop via md:hidden. Provides Home, Search, Theme cycle, Scroll to top, About.
 */

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Home, Search, Palette, ChevronUp, Info, Coffee, Code, ExternalLink } from 'lucide-react';
import { clearCurrentPost, fetchPosts } from '../../redux/actions/posts';
import { setSelectedSubreddit } from '../../redux/actions/subreddits';
import { clearComments } from '../../redux/actions/comments';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const dispatch = useDispatch();
  const { currentPost } = useSelector((state) => state.posts);
  const { selected: selectedSubreddit } = useSelector((state) => state.subreddits);

  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('lfc-theme') || 'red'
  );
  const [aboutOpen, setAboutOpen] = useState(false);

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

  const handleAboutClick = useCallback(() => {
    setAboutOpen(true);
  }, []);

  const navItems = [
    { label: 'Home', icon: Home, onClick: handleHomeClick, testId: 'nav-home', ariaLabel: 'Go to home' },
    { label: 'Search', icon: Search, onClick: handleSearchClick, testId: 'nav-search', ariaLabel: 'Focus search' },
    { label: 'Theme', icon: Palette, onClick: handleThemeClick, testId: null, ariaLabel: `Switch theme (current: ${currentTheme})` },
    { label: 'Top', icon: ChevronUp, onClick: handleScrollToTopClick, testId: null, ariaLabel: 'Scroll to top' },
    { label: 'About', icon: Info, onClick: handleAboutClick, testId: 'nav-about', ariaLabel: 'About this app' },
  ];

  return (
    <>
      <nav
        data-testid="bottom-nav"
        className={cn(
          'fixed bottom-0 inset-x-0 z-50',
          'md:hidden',
          'border-t border-border/40',
          'bg-background/90 backdrop-blur-md',
          'supports-backdrop-filter:bg-background/70',
          'safe-bottom',
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map(({ label, icon: Icon, onClick, testId, ariaLabel }) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              onClick={onClick}
              aria-label={ariaLabel}
              data-testid={testId}
              className={cn(
                'flex flex-col items-center gap-0.5 h-auto py-1.5 px-2',
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

      {/* About Sheet */}
      <Sheet open={aboutOpen} onOpenChange={setAboutOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-4 max-h-[85vh]">
          <SheetTitle className="sr-only">About LFC Reddit Viewer</SheetTitle>

          <div className="flex flex-col items-center text-center space-y-5">
            {/* Logo + App name */}
            <div className="flex flex-col items-center gap-3">
              <img
                src="/lfclogo.svg"
                alt="Liverpool FC crest"
                className="size-16"
              />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  LFC Reddit Viewer
                </h2>
                <p className="text-sm text-muted-foreground">
                  Liverpool FC Community Posts
                </p>
              </div>
            </div>

            <Separator className="opacity-30" />

            {/* Why I Built This */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                Why I Built This
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-sm">
                Built for LFC fans who are tired of clickbait and ad-heavy football sites.
                This app gives you a clean, fast way to browse the r/LiverpoolFC community
                &mdash; just the posts, the comments, and the conversation. No ads, no tracking,
                no nonsense.
              </p>
            </div>

            <Separator className="opacity-30" />

            {/* Links */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a
                href="https://github.com/thomasjbutler"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3',
                  'bg-muted/50 hover:bg-muted transition-colors',
                  'text-sm font-medium text-foreground',
                )}
              >
                <Code className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1 text-left">
                  <span>GitHub</span>
                  <span className="block text-xs text-muted-foreground">@thomasjbutler</span>
                </div>
                <ExternalLink className="size-4 text-muted-foreground" />
              </a>

              <a
                href="https://buymeacoffee.com/ojrwoqkgmv"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3',
                  'bg-muted/50 hover:bg-muted transition-colors',
                  'text-sm font-medium text-foreground',
                )}
              >
                <Coffee className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1 text-left">
                  <span>Buy Me a Coffee</span>
                  <span className="block text-xs text-muted-foreground">Support this project</span>
                </div>
                <ExternalLink className="size-4 text-muted-foreground" />
              </a>
            </div>

            {/* YNWA */}
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70 pt-2">
              You&apos;ll Never Walk Alone
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default React.memo(BottomNav);
