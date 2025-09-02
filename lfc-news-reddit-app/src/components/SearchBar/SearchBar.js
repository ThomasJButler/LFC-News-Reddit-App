import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchPosts, fetchPosts, setSearchTerm } from '../../redux/actions/posts';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const dispatch = useDispatch();
  const { selectedSubreddit } = useSelector(state => state.subreddits);
  const { searchTerm: currentSearchTerm } = useSelector(state => state.posts);
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
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search posts..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      <button type="submit" className={styles.searchButton} aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;