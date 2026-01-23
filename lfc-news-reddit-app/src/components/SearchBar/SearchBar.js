/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Search bar component with clear functionality and subreddit-aware searching.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchPosts, fetchPosts, setSearchTerm } from '../../redux/actions/posts';
import Icon from '../Icon/Icon';
import styles from './SearchBar.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const SearchBar = () => {
  const dispatch = useDispatch();
  const { selected: selectedSubreddit } = useSelector(state => state.subreddits);
  const { searchTerm: currentSearchTerm, loading } = useSelector(state => state.posts);
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
    <form className={styles.searchBar} onSubmit={handleSearch}>
      <label htmlFor="search-input" className="visually-hidden">
        Search posts
      </label>
      <input
        id="search-input"
        type="text"
        className={styles.searchInput}
        placeholder="Search posts..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoComplete="off"
      />
      {inputValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Icon name="X" size="md" ariaHidden={true} />
        </button>
      )}
      <button
        type="submit"
        className={styles.searchButton}
        aria-label={loading && inputValue ? "Searching..." : "Search"}
        disabled={loading && inputValue}
      >
        {loading && inputValue ? (
          <Icon name="Loader2" size="md" ariaHidden={true} className={styles.spinner} />
        ) : (
          <Icon name="Search" size="md" ariaHidden={true} />
        )}
      </button>
    </form>
  );
};

export default React.memo(SearchBar);