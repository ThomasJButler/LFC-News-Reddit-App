# Distraction-Free Experience

## Overview

The app should provide a focused, clean reading experience that's better than the cluttered Reddit app/website. Every UI element must earn its place - if it doesn't help the user read LFC content, remove it.

## Requirements

### Content Focus

- Posts and comments are the primary focus
- Minimal chrome/UI around content
- No ads, no promoted content, no "recommended" distractions
- No infinite scroll anxiety - clear pagination or "load more"
- Reading progress indicator for long posts/comment threads

### Visual Calm

- Generous whitespace
- No flashy animations or attention-grabbing elements
- Subtle, purposeful transitions only
- No auto-playing videos (user must tap to play)
- Muted colour palette with LFC colours as accents, not overwhelm

### Information Architecture

- Show only essential metadata by default
- Hide secondary info behind progressive disclosure
- Clear "back" navigation - never feel lost
- Remember scroll position when returning to list

### Reading Mode (Optional Enhancement)

- Simplified view for individual posts
- Hide all navigation except back button
- Larger text, maximum readability
- Easy toggle to return to normal view

### Reduced Cognitive Load

- Maximum 5-7 items in any navigation menu
- Clear, unambiguous labels
- Consistent interaction patterns
- No modals/popups unless absolutely necessary
- Predictable behaviour - no surprises

### Performance as UX

- Instant perceived response to interactions
- Skeleton loaders instead of spinners
- Optimistic updates where appropriate
- Cache aggressively - content should feel instant on repeat visits

## What to Remove/Minimize

- Excessive metadata (keep: author, time, score, subreddit)
- Redundant buttons/actions
- Decorative elements that add no value
- Complex nested menus
- Any UI that mimics Reddit's advertising patterns

## Acceptance Criteria

- [ ] User can read a post within 1 second of tapping it
- [ ] No UI element without clear purpose
- [ ] Whitespace is used intentionally
- [ ] App feels calmer than Reddit app/website
- [ ] User can focus on content without visual noise
- [ ] Navigation is simple and predictable
- [ ] Performance feels instant
