# LFC Personality

## Why
This app is a love letter to LFC fans and a big FU to capitalism and clickbait news. It should feel fun, irreverent, and unmistakably Liverpool. Every loading state, error message, and empty state is an opportunity to make fans smile.

## LFC Data File

Create `src/utils/lfcData.js` with exported arrays:

### Loading Messages
Displayed during skeleton loading states, rotating every 3 seconds:
```javascript
export const loadingMessages = [
  "Stevie G is fetching your posts...",
  "The Kop is loading...",
  "Crossing from Trent, connecting to server...",
  "Mo Salah running at the API...",
  "Virgil is organizing the data...",
  "Alisson with a great distribution...",
  "Walking through the tunnel at Anfield...",
  "The Anfield roar is buffering...",
  "Diaz dribbling through the middleware...",
  "Klopp approves of your patience...",
  "Firmino is looking for the data... no-look pass incoming...",
  "Corner taken quickly... LOADING!",
]
```

### LFC Trivia
Random facts shown in "Did you know?" widgets:
```javascript
export const lfcTrivia = [
  "Liverpool FC was founded in 1892 after Everton left Anfield over a rent dispute.",
  "Anfield has a capacity of 61,276 — and it still isn't big enough.",
  "'You'll Never Walk Alone' was originally from the musical Carousel (1945).",
  "Liverpool have won 6 European Cups / Champions League titles.",
  "The Spion Kop was named after a hill in the Boer War where Liverpool soldiers fought.",
  "Bill Shankly: 'Some people think football is a matter of life and death. I assure you, it's much more serious than that.'",
  "Istanbul 2005: Liverpool came back from 3-0 down at half-time to beat AC Milan on penalties. Greatest final ever.",
  "Ian Rush scored 346 goals for Liverpool — the all-time record.",
  "The Liverbird has been the symbol of the city since the 13th century.",
  "Bob Paisley won 3 European Cups as manager — and he was reluctant to take the job.",
  "Kenny Dalglish is known as 'King Kenny' on the Kop.",
  "Liverpool's first match at Anfield was on 1 September 1892.",
  "The Shankly Gates were erected in 1982 with the inscription 'You'll Never Walk Alone'.",
  "Liverpool won their first league title in 1901.",
  "The Hillsborough disaster on 15 April 1989 claimed 97 lives. JFT97. The truth was told.",
  "Anfield's 'This Is Anfield' sign was placed by Bill Shankly to intimidate visiting teams.",
]
```

### Empty State Messages
When no posts match filters:
```javascript
export const emptyStateMessages = [
  "The Kop is quiet... no posts here.",
  "Even the Anfield cat couldn't find anything.",
  "This is emptier than Goodison on a Tuesday night.",
  "No posts. Must be international break.",
  "Quieter than the away end at Old Trafford.",
  "Nothing here. Even Divock Origi couldn't find a late winner.",
]
```

### Error Messages
When API calls fail:
```javascript
export const errorMessages = [
  "VAR has disallowed this request. Try again?",
  "The referee's having a mare. Give it another go.",
  "Even Alisson couldn't save this one.",
  "That's gone over the bar. Retry?",
  "Offside! Actually, just a network error.",
  "Mike Dean has intervened. Please try again.",
]
```

### Anti-Clickbait Messages
Footer taglines and about text:
```javascript
export const antiClickbaitMessages = [
  "No ads. No trackers. No Murdoch.",
  "Just footy. No clickbait.",
  "Built by fans, for fans.",
  "Free as in freedom. Red as in Liverpool.",
  "The S*n isn't welcome here either.",
  "No algorithms. No engagement hacks. Just the beautiful game.",
]
```

## LFC Components

### LfcLoadingMessages (`src/components/lfc/LfcLoadingMessages.jsx`)
- Shows a random loading message from the array
- Rotates to a new message every 3 seconds via `useEffect` + `setInterval`
- Animated with `animate-pulse` or subtle fade
- Displayed below skeleton loaders

### LfcTrivia (`src/components/lfc/LfcTrivia.jsx`)
- Card showing a random "Did you know?" fact
- Uses ShadCN `Card` with subtle primary border
- Appears periodically in the post list (e.g., after every 10 posts)
- New random fact on each render

### LfcFooter (`src/components/lfc/LfcFooter.jsx`)
- Desktop only (`hidden md:block`)
- "You'll Never Walk Alone" in primary color
- Random anti-clickbait tagline below
- Developer attribution link
- Sits at bottom of page, below post list

### SpicyMeter (`src/components/lfc/SpicyMeter.jsx`)
- Keep the existing engagement scoring logic
- Rename the levels to LFC-themed names:
  - Score < 100: "Reserves"
  - Score 100-499: "League Cup"
  - Score 500-999: "Premier League"
  - Score 1000-4999: "Champions League"
  - Score 5000-9999: "Istanbul 2005"
  - Score 10000+: "YNWA"
- Use Tailwind classes instead of CSS Module
- Use Lucide `Flame` icon directly

## Where Personality Shows Up

1. **Loading states** — Rotating LFC loading messages instead of generic spinner
2. **Empty states** — LFC humor when no posts match filters
3. **Error states** — LFC-themed retry messages
4. **Header tagline** — "No ads. No trackers. No Murdoch." (hidden on mobile)
5. **Footer** — "You'll Never Walk Alone" + anti-clickbait messaging
6. **SpicyMeter** — LFC-themed engagement levels
7. **Trivia cards** — Random facts interspersed in feed

## Acceptance Criteria
- Loading messages rotate during skeleton loading states
- Error messages display LFC humor with retry button
- Empty states show LFC-themed messages
- Footer displays "You'll Never Walk Alone" on desktop
- SpicyMeter shows LFC-themed level names
- Trivia cards appear in the feed with random facts
- All text is respectful (JFT97 handled with dignity)
- Anti-clickbait messaging is visible but not overbearing
