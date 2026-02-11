/**
 * Search bar with clear functionality and subreddit-aware searching.
 * Uses ShadCN Input + Button with direct Lucide imports.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchPosts, fetchPosts, setSearchTerm } from '../../redux/actions/posts';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SearchBar = () => {
  const dispatch = useDispatch();
  const { selected: selectedSubreddit } = useSelector((state) => state.subreddits);
  const { searchTerm: currentSearchTerm, loading } = useSelector((state) => state.posts);
  const [inputValue, setInputValue] = useState(currentSearchTerm);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();

    if (trimmedValue) {
      dispatch(searchPosts(trimmedValue, selectedSubreddit));
    } else {
      dispatch(setSearchTerm(''));
      dispatch(fetchPosts(selectedSubreddit));
    }
  };

  const handleClear = () => {
    setInputValue('');
    dispatch(setSearchTerm(''));
    dispatch(fetchPosts(selectedSubreddit));
  };

  return (
    <form
      data-testid="search-bar"
      className="flex items-center gap-1.5 w-full max-w-md"
      onSubmit={handleSearch}
    >
      <div className="relative flex-1">
        <Input
          data-testid="search-input"
          type="text"
          placeholder="Search posts..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          className={cn(
            'pr-8 h-9 bg-secondary/50 border-border/50',
            'placeholder:text-muted-foreground/60',
            'focus-visible:bg-background focus-visible:border-ring',
          )}
          aria-label="Search posts"
        />
        {inputValue && (
          <Button
            data-testid="search-clear"
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <Button
        type="submit"
        variant="default"
        size="icon"
        aria-label={loading && inputValue ? 'Searching...' : 'Search'}
        disabled={loading && !!inputValue}
        className="shrink-0"
      >
        {loading && inputValue ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
      </Button>
    </form>
  );
};

export default React.memo(SearchBar);
