/**
 * Sort controls for post ordering — split from the old SubredditFilter.
 * Uses ShadCN Tabs for sort method (Hot/New/Top/Rising/Spicy) and
 * ShadCN Select for time range (only shown when sort = Top).
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, setSortBy, setTimeRange, sortByViral } from '../../redux/actions/posts';
import { Flame, Clock, Trophy, TrendingUp, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: Trophy },
  { value: 'rising', label: 'Rising', icon: TrendingUp },
  { value: 'viral', label: 'Spicy', icon: Zap },
];

const timeRangeOptions = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

const SortBar = () => {
  const dispatch = useDispatch();
  const { selected: selectedSubreddit } = useSelector((state) => state.subreddits);
  const { sortBy, timeRange } = useSelector((state) => state.posts);

  const handleSortChange = useCallback(
    (newSortBy) => {
      if (newSortBy === 'viral') {
        dispatch(sortByViral());
      } else {
        dispatch(setSortBy(newSortBy));
        dispatch(fetchPosts(selectedSubreddit, newSortBy, timeRange));
      }
    },
    [dispatch, selectedSubreddit, timeRange]
  );

  const handleTimeRangeChange = useCallback(
    (newTimeRange) => {
      dispatch(setTimeRange(newTimeRange));
      dispatch(fetchPosts(selectedSubreddit, sortBy, newTimeRange));
    },
    [dispatch, selectedSubreddit, sortBy]
  );

  return (
    <div
      data-testid="sort-bar"
      className="flex items-center gap-3 flex-wrap"
    >
      <Tabs
        data-testid="sort-tabs"
        value={sortBy}
        onValueChange={handleSortChange}
        className="w-auto"
        aria-label="Sort posts by"
      >
        <TabsList className="h-9 bg-secondary/60 backdrop-blur-sm">
          {sortOptions.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              aria-label={label}
              className={cn(
                'gap-1 text-xs sm:text-sm px-2 sm:px-3',
                value === 'viral' && 'data-[state=active]:text-primary',
              )}
            >
              <Icon
                className={cn(
                  'size-3.5',
                  sortBy === value && value === 'viral' && 'text-primary',
                )}
                aria-hidden="true"
              />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {sortBy === 'top' && (
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger
            className="h-8 text-xs bg-secondary/60 border-border/50"
            aria-label="Time range"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default React.memo(SortBar);
