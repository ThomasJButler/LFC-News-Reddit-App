# LFC Reddit Viewer

A React app for browsing Liverpool FC content from Reddit without the clutter.

## What It Is

Pulls posts and comments from Liverpool FC subreddits (r/LiverpoolFC and r/liverpoolfcmedia) and displays them in a cleaner interface. No Reddit account needed, no API keys, just reads the public JSON feeds.

Includes search, sorting, threaded comments with media support, and a spiciness meter that ranks posts by score. Three colour themes based on LFC kits (red, white, green).

## Usage

- Browse posts from the combined feed or filter by subreddit
- Click a post to see full content and comments
- Search works across all selected subreddits
- Sort by hot/new/top/viral (viral is client-side sorting by score)
- Comments render inline media (images, videos, GIFs) automatically

## Tech Stack

- React 18 with hooks
- Redux + Thunk for state
- CSS Modules for styling
- react-markdown with GitHub Flavoured Markdown
- DOMPurify for sanitisation
- Create React App (not ejected)

## Installation

```bash
cd lfc-news-reddit-app
npm install
npm start
```

Runs on <http://localhost:3000>

## Project Structure

```text
src/
├── components/        11 React components (Header, PostList, PostItem, etc.)
├── redux/
│   ├── actions/      Action creators for posts, comments, subreddits
│   ├── reducers/     State slices matching action types
│   └── store.js      Redux store with thunk middleware
└── utils/
    ├── api.js        Reddit API with proxy fallback and rate limiting
    ├── cache.js      TTL-based cache with periodic cleanup
    ├── sanitize.js   URL/HTML sanitisation (whitelist approach)
    └── markdown.js   React-markdown configuration
```

## Version

Current: 1.0.4 (Mobile API fixes and viral sorting)

---

Built by [Tom Butler](https://github.com/thomasjbutler) because the Reddit mobile site is terrible.
