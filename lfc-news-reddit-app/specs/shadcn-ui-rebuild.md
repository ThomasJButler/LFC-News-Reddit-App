# ShadCN UI Rebuild

## Why
The current UI uses CSS Modules with 19 separate `.module.css` files. ShadCN provides accessible, composable components built on Radix UI primitives + Tailwind CSS. This gives us better mobile UX, consistent design language, and accessibility out of the box.

## ShadCN Components to Copy

Copy from `ui/apps/v4/registry/new-york-v4/ui/` to `src/components/ui/`, converting TSX to JSX.

**TSX → JSX conversion rules:**
- Remove all TypeScript type annotations, interfaces, and type imports
- Remove `"use client"` directives
- Change file extension from `.tsx` to `.jsx`
- Keep `@/lib/utils` import paths (Vite alias handles resolution)
- Keep all Radix UI imports unchanged

**Components needed:**

| Source File | Target | Used For |
|-------------|--------|----------|
| `card.tsx` | `card.jsx` | Post cards |
| `button.tsx` | `button.jsx` | All interactive buttons |
| `badge.tsx` | `badge.jsx` | Post flairs, OP/MOD indicators |
| `sheet.tsx` | `sheet.jsx` | PostDetail slide-in panel |
| `tabs.tsx` | `tabs.jsx` | Sort options (Hot/New/Top/Rising) |
| `skeleton.tsx` | `skeleton.jsx` | Loading placeholder states |
| `scroll-area.tsx` | `scroll-area.jsx` | Scrollable comment lists |
| `separator.tsx` | `separator.jsx` | Visual dividers between sections |
| `toggle.tsx` | `toggle.jsx` | Individual filter toggles |
| `toggle-group.tsx` | `toggle-group.jsx` | Grouped filter selections |
| `tooltip.tsx` | `tooltip.jsx` | Hover information hints |
| `select.tsx` | `select.jsx` | Time range dropdown picker |
| `avatar.tsx` | `avatar.jsx` | Comment author avatars |
| `input.tsx` | `input.jsx` | Search input field |
| `collapsible.tsx` | `collapsible.jsx` | Comment collapse, filter panel toggle |

## Component Rebuild Plan

### New folder structure
```
src/components/
  ui/           # ShadCN primitives (copied from reference)
  layout/       # App-level layout components
    Header.jsx
    BottomNav.jsx
    ThemeSwitcher.jsx
    SortBar.jsx
    FilterPanel.jsx
  posts/        # Post-related components
    PostList.jsx
    PostItem.jsx
    PostDetail.jsx
    PostSkeleton.jsx
  comments/     # Comment-related components
    CommentList.jsx
    Comment.jsx
    CommentSkeleton.jsx
  shared/       # Reusable shared components
    SearchBar.jsx
    ErrorMessage.jsx
    ErrorBoundary.jsx
    VideoPlayer.jsx
    Avatar.jsx
    CodeBlock.jsx
  lfc/          # LFC personality components
    SpicyMeter.jsx
    LfcLoadingMessages.jsx
    LfcTrivia.jsx
    LfcFooter.jsx
```

### Component-by-Component Rebuild

**PostItem** (`src/components/posts/PostItem.jsx`):
- Use ShadCN `Card` + `CardContent`
- Use `Badge` for post flairs with color variants
- Replace CSS Module classes with Tailwind utilities
- Replace `window.innerWidth` resize listener with Tailwind responsive prefixes (`md:`, `lg:`)
- Use `line-clamp-2` / `line-clamp-3` instead of JS `previewLength` calculation
- Use `group` / `group-hover:` for hover states
- Import Lucide icons directly (ArrowUp, MessageCircle, Flame, etc.)

**PostDetail** (`src/components/posts/PostDetail.jsx`):
- Replace custom modal overlay with ShadCN `Sheet` (slides from right)
- Radix handles: focus trap, Escape key, overlay click-to-close
- Use `SheetContent side="right"` with `className="w-full sm:max-w-2xl"`
- Use `ScrollArea` for scrollable content
- Use `Separator` between content sections
- Keep: markdown rendering, gallery navigation, video player, reading progress

**PostList** (`src/components/posts/PostList.jsx`):
- Remove `react-window` import and `VirtualizedRow` (was disabled anyway — `VIRTUALIZATION_THRESHOLD=999`)
- Keep "Load More" pagination pattern with `Button`
- Keep pull-to-refresh touch handling
- Keep `useMemo` filter logic (flair filters, media filters, search)
- Empty state: use LFC-themed messages

**SubredditFilter** → Split into two components:
- **SortBar** (`src/components/layout/SortBar.jsx`): Use ShadCN `Tabs` for sort options (Hot/New/Top/Rising/Spicy). Use `Select` for time range picker (appears when sort=Top).
- **FilterPanel** (`src/components/layout/FilterPanel.jsx`): Use `Collapsible` for expandable filter section. Use `ToggleGroup` for flair filters. Use `Badge` for active filter display.

**CommentList** → Split into two components:
- **CommentList** (`src/components/comments/CommentList.jsx`): Container with `ScrollArea`. Uses `Separator` between top-level comments.
- **Comment** (`src/components/comments/Comment.jsx`): Individual comment with `Collapsible` for collapse/expand. `Avatar` for author. `Badge` for OP/MOD indicators. Thread line colors via Tailwind border utilities.

**Header** (`src/components/layout/Header.jsx`):
- Sticky: `sticky top-0 z-50 border-b bg-background/95 backdrop-blur`
- Contains: logo/title, tagline ("No ads. No trackers. No Murdoch."), SearchBar, ThemeSwitcher
- Responsive: tagline hidden on mobile (`hidden sm:block`)

**ThemeSwitcher** (`src/components/layout/ThemeSwitcher.jsx`):
- Use `ToggleGroup type="single"` with 3 color swatch items
- Red swatch: `bg-[#C8102E]`
- White swatch: `bg-[#f5f0e8] border`
- Black swatch: `bg-black border`
- Persist selection in localStorage
- Apply via `document.documentElement.setAttribute('data-theme', theme)`

**SearchBar** (`src/components/shared/SearchBar.jsx`):
- Use ShadCN `Input` for the search field
- Use `Button` for clear/search actions
- Lucide icons: `Search`, `X`, `Loader2`

**Toast System**:
- DELETE: `src/components/Toast/` (all files — Toast.js, ToastContainer.js, ToastProvider.js, Toast.module.css)
- REPLACE with: ShadCN `Sonner` (`src/components/ui/sonner.jsx`)
- Usage: `import { toast } from 'sonner'` then `toast.success("Posts refreshed!")`
- Add `<Toaster />` in App.jsx

**Icon Component**:
- DELETE: `src/components/Icon/` entirely
- Import Lucide icons directly in each component: `import { Flame } from 'lucide-react'`
- Sizing: use Tailwind `className="size-4"`, `"size-5"`, etc.

**SkeletonLoader** → Split into:
- **PostSkeleton** (`src/components/posts/PostSkeleton.jsx`): Uses ShadCN `Skeleton` inside `Card`
- **CommentSkeleton** (`src/components/comments/CommentSkeleton.jsx`): Uses ShadCN `Skeleton` for comment tree shape

**ErrorMessage** (`src/components/shared/ErrorMessage.jsx`):
- Use `Card` with error styling
- LFC-themed error messages (from `src/utils/lfcData.js`)
- Retry `Button`

**ErrorBoundary** (`src/components/shared/ErrorBoundary.jsx`):
- Keep as class component (error boundaries require it)
- Use Tailwind for styling

**VideoPlayer** (`src/components/shared/VideoPlayer.jsx`):
- Keep HLS.js logic unchanged
- Replace CSS Module styles with Tailwind: `className="w-full rounded-lg"`

**Avatar** (`src/components/shared/Avatar.jsx`):
- Combine ShadCN `Avatar` primitive with existing `colorHash.js` utility
- `AvatarFallback` shows initial with hash-derived background color

**BottomNav** (`src/components/layout/BottomNav.jsx`):
- Mobile only: `md:hidden`
- Use `Button variant="ghost"` for nav items
- Lucide icons for navigation

**App.jsx** (`src/App.jsx`):
- Wire up all rebuilt components
- Lazy load `PostDetail` with `React.lazy` + `Suspense`
- Include `<Toaster />` from Sonner
- Skip-to-content link for accessibility
- Layout: Header → SortBar → FilterPanel → PostList → LfcFooter → PostDetail (Sheet) → BottomNav

### What Stays Unchanged
- `src/redux/store.js` — Redux store configuration
- `src/redux/actions/*` — All action creators
- `src/redux/reducers/*` — All reducers (posts, comments, subreddits)
- `src/utils/cache.js` — Client-side caching
- `src/utils/formatTime.js` — Relative timestamps
- `src/utils/formatDuration.js` — Duration formatting
- `src/utils/colorHash.js` — Username → color mapping
- `src/utils/sanitize.js` — URL/HTML sanitization
- `src/utils/markdown.js` — Markdown processing

### What Gets Deleted (After Rebuild Complete)
- All 19 `*.module.css` files
- `src/App.css`
- `src/index.css`
- `src/styles/variables.css`
- `src/components/Icon/` directory
- `src/components/LoadingSpinner/` directory
- `src/components/Toast/` directory (all files)

## data-testid Attributes (Required for E2E Tests)

All rebuilt components MUST include `data-testid` attributes for Playwright test selectors. Tailwind utility classes are not semantic, so tests cannot use `[class*="..."]` patterns. See `specs/testing-cleanup.md` for the full mapping table.

Key attributes per component:

- **PostItem**: `data-testid="post-item"`, plus `post-title`, `post-header`, `post-footer`, `post-subreddit`
- **PostList**: `data-testid="post-list"`, `empty-state`, `load-more`
- **PostDetail (Sheet)**: `data-testid="post-detail-content"`, `close-button`, `sheet-overlay`, `post-author`, `post-time`
- **CommentList**: `data-testid="comments-section"`, `no-comments`, `collapse-all-button`
- **Comment**: `data-testid="comment"`, `comment-meta`, `comment-score`, `op-badge`, `mod-badge`
- **SearchBar**: `data-testid="search-bar"`, `search-clear`
- **BottomNav**: `data-testid="bottom-nav"`
- **SortBar**: `data-testid="sort-tabs"`
- **FilterPanel**: `data-testid="filter-panel"`, `filter-expand`, `filter-button`, `flair-pill`
- **ThemeSwitcher**: `data-testid="theme-switcher"`
- **Skeletons**: `data-testid="skeleton"`, `comments-skeleton`
- **ErrorMessage**: `data-testid="error-message"`
- **Dynamic content**: `timestamp`, `upvotes`, `score`, `comment-count`, `author`

## Acceptance Criteria

- All ShadCN components render correctly
- Radix UI primitives work (open/close Sheet, click Toggle, etc.)
- No CSS Module imports remain
- All components use Tailwind utility classes
- All components include required `data-testid` attributes (see above)
- Posts display in Card layout
- Post detail opens as Sheet slide-in
- Comments collapse/expand
- Keyboard navigation works throughout
- Screen reader announces correctly
- Mobile responsive at 320px, 768px, 1024px, 1440px
