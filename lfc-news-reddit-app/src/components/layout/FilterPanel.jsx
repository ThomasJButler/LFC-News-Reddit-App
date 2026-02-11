/**
 * Collapsible filter panel — split from the old SubredditFilter.
 * Uses ShadCN Collapsible for expand/collapse, ToggleGroup for flair multi-select,
 * and Button for quick filters and media type filters.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFlairFilter,
  clearFlairFilters,
  toggleFlairFilter,
  setMediaFilter,
  clearMediaFilters,
} from '../../redux/actions/posts';
import {
  Trophy,
  Users,
  Image,
  Video,
  Link,
  MessageSquare,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const quickFilters = [
  { type: 'matchday', label: 'Match Day', icon: Trophy },
  { type: 'transfers', label: 'Transfers', icon: Users },
];

const mediaFilters = [
  { type: 'images', label: 'Images', icon: Image },
  { type: 'videos', label: 'Videos', icon: Video },
  { type: 'articles', label: 'Articles', icon: Link },
  { type: 'discussions', label: 'Discussions', icon: MessageSquare },
];

const FilterPanel = () => {
  const dispatch = useDispatch();
  const { items: posts, activeFilter, activeFlairFilters, activeMediaFilter } = useSelector(
    (state) => state.posts
  );

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('lfc-filters-expanded');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('lfc-filters-expanded', String(isExpanded));
  }, [isExpanded]);

  // Count active filters for badge display when collapsed
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilter) count++;
    if (activeMediaFilter) count++;
    count += activeFlairFilters.length;
    return count;
  }, [activeFilter, activeMediaFilter, activeFlairFilters]);

  // Collect unique flairs from loaded posts
  const uniqueFlairs = useMemo(() => {
    const flairSet = new Set();
    posts.forEach((post) => {
      if (post.linkFlair && post.linkFlair.trim()) {
        flairSet.add(post.linkFlair.trim());
      }
    });
    return Array.from(flairSet).sort();
  }, [posts]);

  const handleQuickFilterChange = useCallback(
    (filterType) => {
      if (activeFilter === filterType) {
        dispatch(clearFlairFilters());
      } else {
        dispatch(setFlairFilter(filterType));
      }
    },
    [dispatch, activeFilter]
  );

  const handleMediaFilterChange = useCallback(
    (mediaType) => {
      if (activeMediaFilter === mediaType) {
        dispatch(clearMediaFilters());
      } else {
        dispatch(setMediaFilter(mediaType));
      }
    },
    [dispatch, activeMediaFilter]
  );

  const handleToggleFlairFilter = useCallback(
    (flairText) => {
      dispatch(toggleFlairFilter(flairText));
    },
    [dispatch]
  );

  return (
    <Collapsible
      data-testid="filter-panel"
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <CollapsibleTrigger
          data-testid="filter-expand"
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            'text-muted-foreground hover:text-foreground transition-colors',
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>Filters</span>
          {!isExpanded && activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 text-[10px] px-1.5">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="border-t border-border/30">
        <div className="p-3 space-y-3">
          {/* Quick Filters */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Content filters">
              {quickFilters.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  data-testid="filter-button"
                  variant={activeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilterChange(type)}
                  aria-pressed={activeFilter === type}
                  className={cn(
                    'gap-1.5 text-xs h-7',
                    activeFilter === type && 'shadow-md',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Media Type Filters */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Media
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Media type filters">
              {mediaFilters.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  data-testid="filter-button"
                  variant={activeMediaFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMediaFilterChange(type)}
                  aria-pressed={activeMediaFilter === type}
                  className={cn(
                    'gap-1.5 text-xs h-7',
                    activeMediaFilter === type && 'shadow-md',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Flair Filters */}
          {uniqueFlairs.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Flair
                </span>
                {activeFlairFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => dispatch(clearFlairFilters())}
                    aria-label="Clear all flair filters"
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                    Clear ({activeFlairFilters.length})
                  </Button>
                )}
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Flair filters"
              >
                {uniqueFlairs.map((flair) => (
                  <Button
                    key={flair}
                    data-testid="flair-pill"
                    variant={activeFlairFilters.includes(flair) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleFlairFilter(flair)}
                    aria-pressed={activeFlairFilters.includes(flair)}
                    className={cn(
                      'text-xs h-6 px-2.5 rounded-full',
                      activeFlairFilters.includes(flair) && 'shadow-md',
                    )}
                  >
                    {flair}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default React.memo(FilterPanel);
