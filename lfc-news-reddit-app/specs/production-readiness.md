# Production Readiness

## Overview

Ensure the app is ready for production deployment with comprehensive testing, performance optimization, and robust error handling.

## Current State

- Basic smoke tests only (3 tests in App.test.js)
- ErrorBoundary implemented
- API error handling with retries
- No E2E tests
- No performance monitoring

## Requirements

### Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | ~20% |
| Branches | 75% | ~15% |
| Functions | 80% | ~20% |
| Lines | 80% | ~20% |

### Unit Tests (Jest + React Testing Library)

#### Utilities (100% coverage target)
- `src/utils/api.js` - API fetch, error handling, retry logic
- `src/utils/cache.js` - Cache get/set/clear, TTL expiration
- `src/utils/formatTime.js` - Relative time formatting
- `src/utils/markdown.js` - Markdown config
- `src/utils/sanitize.js` - URL and HTML sanitization

#### Redux (90% coverage target)
- Actions: All action creators
- Reducers: All state transitions
- Async actions: Loading, success, error states

#### Components (80% coverage target)
Priority components:
- PostItem - Renders all post types
- PostDetail - Modal, media, markdown
- CommentList - Threading, collapse
- SearchBar - Input, submit, clear
- ThemeSwitcher - Theme selection, persistence
- Toast - All toast types, dismiss

### Integration Tests

- PostList + PostItem interaction
- PostDetail modal open/close with focus management
- Theme switching persists across refresh
- Search filters posts correctly
- SubredditFilter applies filters
- Comment collapse/expand

### E2E Tests (Playwright)

#### Happy Path
1. Load home page
2. See post list
3. Click post to open detail
4. Read post content
5. Scroll through comments
6. Close modal
7. Return to list

#### Theme Persistence
1. Change theme
2. Refresh page
3. Verify theme persisted

#### Mobile Navigation
1. Load on mobile viewport
2. Use bottom nav
3. Verify smooth transitions

#### Error Recovery
1. Simulate network error
2. See error message
3. Click retry
4. Content loads

### Build Optimization

#### Bundle Analysis
- Add `source-map-explorer` or `webpack-bundle-analyzer`
- Identify large dependencies
- Document any opportunities

#### Current Optimizations (verify working)
- Code splitting: PostDetail is lazy loaded
- Tree shaking: react-scripts handles
- Minification: Production build

#### Recommendations to Document
- Image optimization strategy
- Consider service worker for offline
- Asset caching headers

### Performance Metrics (Lighthouse)

| Metric | Target | Notes |
|--------|--------|-------|
| Performance | 90+ | Desktop |
| Accessibility | 95+ | Already strong foundation |
| Best Practices | 90+ | |
| SEO | 80+ | Limited for SPA |

#### Core Web Vitals Targets
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

#### Enable Web Vitals Reporting
`src/reportWebVitals.js` exists but may not be connected. Verify integration.

### Error Handling Audit

#### Current Error Boundaries
- [ ] App-level ErrorBoundary wraps everything
- [ ] PostDetail has try/catch for parsing
- [ ] API calls have error handling

#### Required Enhancements
- Fallback UI in ErrorBoundary is helpful
- User-friendly error messages
- Retry mechanisms where appropriate
- Offline detection and messaging

### Security Checklist

- [x] DOMPurify for user HTML content
- [x] URL sanitization for links
- [x] No API keys exposed (public Reddit API)
- [ ] Review CORS proxy security implications (document)
- [ ] CSP headers (if deploying to static host)

### Documentation

#### README Updates
- [ ] Setup instructions accurate
- [ ] Available scripts documented
- [ ] Deployment guide added
- [ ] Contributing guidelines

#### Code Documentation
- [x] JSDoc on major functions
- [ ] Component PropTypes complete
- [ ] Architecture overview

### npm Scripts to Add

```json
{
  "scripts": {
    "test:coverage": "npm test -- --coverage --watchAll=false",
    "test:ci": "npm test -- --ci --coverage --watchAll=false",
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "lighthouse": "lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html"
  }
}
```

### Pre-Deployment Checklist

- [ ] `npm run build` completes without errors
- [ ] `npm test -- --watchAll=false` passes
- [ ] Test coverage meets targets
- [ ] Lighthouse performance > 90
- [ ] All critical user flows tested E2E
- [ ] No console errors in production build
- [ ] README is up to date
- [ ] Environment variables documented (if any)

## Acceptance Criteria

- [ ] Test coverage > 80% on src/
- [ ] All utility functions have unit tests
- [ ] Redux actions/reducers have tests
- [ ] Key components have render tests
- [ ] E2E tests cover critical paths
- [ ] Build completes without warnings
- [ ] Lighthouse performance score > 90
- [ ] No console errors in production
- [ ] Error states gracefully handled
- [ ] Documentation is complete
