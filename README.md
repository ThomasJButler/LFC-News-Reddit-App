# LFC Reddit Viewer

**Developed by [Thomas Butler](https://thomasjbutler.me)**

A modern React application for browsing Liverpool FC-related content from Reddit. View posts, comments, and discussions from multiple Liverpool FC subreddits in a clean, responsive interface with a dark theme featuring Liverpool FC colors.

## Features

- 🔴 **Liverpool FC Themed** - Dark theme with official LFC red (#C8102E) accents
- 📱 **Responsive Design** - Mobile-first approach with tablet and desktop optimizations
- 🔍 **Smart Search** - Search across all Liverpool FC subreddits
- 🏷️ **Subreddit Filtering** - Switch between r/LiverpoolFC, r/liverpoolfcmedia, r/liverpoolgifs, or view all
- 💬 **Nested Comments** - Collapsible comment threads with full Reddit markdown support
- ⚡ **Performance Optimized** - Built-in caching and rate limiting
- 🎨 **Modern UI** - CSS modules with smooth animations and hover effects
- 📊 **Post Sorting** - Sort by hot, new, top, or rising posts

## Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **State Management**: Redux with Redux Thunk for async actions
- **Styling**: CSS Modules with CSS Variables for theming
- **API**: Reddit's public JSON endpoints (no API key required)
- **Markdown**: react-markdown with GitHub Flavored Markdown support
- **Testing**: Jest and React Testing Library setup
- **Build Tool**: Create React App with ejectable configuration

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LFC-News-Reddit-App.git
   cd LFC-News-Reddit-App
   ```

2. **Install dependencies**
   ```bash
   cd lfc-news-reddit-app
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### Data Flow
1. **Reddit API Integration** - Fetches data from Reddit's public JSON endpoints
2. **Rate Limiting** - Built-in 10 requests/minute limit with intelligent queuing
3. **Caching System** - 5-minute TTL cache to reduce API calls and improve performance
4. **Redux State Management** - Centralized state with actions, reducers, and thunk middleware
5. **Component Updates** - React hooks automatically re-render components when data changes

### Subreddits Included
- **r/LiverpoolFC** - Main Liverpool FC subreddit
- **r/liverpoolfcmedia** - Liverpool FC media content
- **r/liverpoolgifs** - Liverpool FC GIFs and highlights

### No API Key Required
The app uses Reddit's public JSON endpoints (e.g., `https://www.reddit.com/r/LiverpoolFC.json`) which are freely accessible without authentication.

## Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder with optimized bundles.

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App to customize build configuration.

## Project Structure

```
src/
├── components/          # React components with CSS modules
│   ├── Header/         # App header with search
│   ├── PostList/       # List of Reddit posts
│   ├── PostItem/       # Individual post component
│   ├── PostDetail/     # Modal with post details and comments
│   ├── CommentList/    # Nested comment threads
│   ├── SearchBar/      # Search functionality
│   ├── SubredditFilter/# Subreddit selection
│   ├── LoadingSpinner/ # Loading animation
│   └── ErrorMessage/   # Error handling component
├── redux/              # Redux state management
│   ├── actions/        # Action creators and types
│   ├── reducers/       # State reducers
│   └── store.js        # Redux store configuration
├── utils/              # Utility functions
│   ├── api.js          # Reddit API integration
│   ├── cache.js        # Caching system
│   └── markdown.js     # Markdown rendering utilities
├── styles/             # Global styles and CSS variables
└── App.js              # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for Liverpool FC fans worldwide. **You'll Never Walk Alone!**
