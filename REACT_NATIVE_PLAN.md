# React Native Migration Plan

## LFC Reddit Viewer — iOS & Android App

This document outlines how to convert the existing React web app into a React Native app using Expo. The goal is to preserve all existing logic while replacing the browser-based UI layer with native components.

---

## Why React Native?

- Native HTTP requests have **no CORS restrictions** — Reddit API calls work directly
- App Store / Google Play presence gives users a proper mobile experience
- Push notifications, offline support, and native performance become possible
- ~30% of the existing codebase (Redux, utils, data logic) transfers unchanged

---

## Phase 1: Project Setup

### 1.1 Initialise Expo Project

```bash
npx create-expo-app LFCRedditViewer --template blank
cd LFCRedditViewer
```

### 1.2 Install Dependencies

```bash
# State management (same versions as web app)
npx expo install redux react-redux redux-thunk

# Navigation (replaces browser routing)
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Media
npx expo install expo-av expo-image

# Markdown rendering (replaces react-markdown)
npm install react-native-markdown-display

# Storage (replaces localStorage)
npx expo install @react-native-async-storage/async-storage

# Gesture handling
npx expo install react-native-gesture-handler
```

### 1.3 Copy Existing Code (No Changes Needed)

Copy these files directly from `lfc-news-reddit-app/src/` into the new project's `src/` directory:

| File | Notes |
|------|-------|
| `redux/store.js` | Works as-is |
| `redux/actions/posts.js` | Works as-is |
| `redux/actions/comments.js` | Works as-is |
| `redux/actions/types.js` | Works as-is |
| `redux/reducers/posts.js` | Works as-is |
| `redux/reducers/comments.js` | Works as-is |
| `redux/reducers/subreddits.js` | Works as-is |
| `utils/cache.js` | Works as-is |
| `utils/formatTime.js` | Works as-is |
| `utils/formatDuration.js` | Works as-is |
| `utils/colorHash.js` | Works as-is |

### 1.4 Simplify api.js

The biggest win. Replace the entire CORS proxy system with direct fetch calls:

```javascript
// src/utils/api.js (React Native version)
import { cache } from './cache';

const BASE_URL = 'https://www.reddit.com';
const CACHE_TTL = 300000;

const fetchFromReddit = async (url) => {
  const cachedData = cache.get(url);
  if (cachedData) return cachedData;

  // No CORS proxy needed — native HTTP client has no CORS restrictions
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'LFCRedditViewer/1.0 (React Native)',
    },
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, data, CACHE_TTL);
  return data;
};

// Keep processPostData, processCommentData, fetchPosts, fetchComments,
// searchPosts, fetchPostDetails exactly as they are — they all call
// fetchFromReddit() and don't touch the DOM.
```

All the `processPostData`, `processCommentData`, `fetchPosts`, `fetchComments`, `searchPosts`, and `fetchPostDetails` functions stay identical. Only `fetchFromReddit` changes.

---

## Phase 2: Navigation Structure

### 2.1 App Navigation Layout

```
App
├── BottomTabNavigator
│   ├── HomeTab (PostList screen)
│   ├── SearchTab (Search screen)
│   └── SettingsTab (Theme picker)
└── Modal Stack
    └── PostDetailScreen (full post + comments)
```

### 2.2 Navigation Setup

```javascript
// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={PostListScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Theme" component={ThemeScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
```

---

## Phase 3: Component Conversion Guide

Each web component maps to a React Native equivalent. The conversion is mechanical — same props, same Redux connections, different JSX elements.

### 3.1 Conversion Reference Table

| Web (HTML/CSS) | React Native | Notes |
|----------------|-------------|-------|
| `<div>` | `<View>` | Layout container |
| `<span>`, `<p>` | `<Text>` | All text must be in `<Text>` |
| `<img>` | `<Image>` from expo-image | Use `source={{ uri: url }}` |
| `<input>` | `<TextInput>` | For search bar |
| `<button>` | `<TouchableOpacity>` | Wraps any tappable element |
| `<a href>` | `<TouchableOpacity>` + `Linking.openURL()` | External links |
| `<select>` | `<Picker>` or custom modal | For sort dropdown |
| CSS Modules | `StyleSheet.create({})` | Inline style objects |
| `className` | `style` prop | Pass style objects |
| CSS Grid | `<FlatList>` with `numColumns` | For post grid |
| CSS Flexbox | Flexbox (default) | Same concepts, column default |
| `overflow: scroll` | `<ScrollView>` or `<FlatList>` | Built-in scroll |
| `@media` queries | `Dimensions` API or `useWindowDimensions` | Responsive layouts |
| CSS variables | Theme context or constants | `themes.js` file |
| `react-window` | `<FlatList>` | Built-in virtualisation |
| `react-markdown` | `react-native-markdown-display` | Different API |
| HLS.js video | `expo-av` `<Video>` | Handles HLS natively |
| `localStorage` | `AsyncStorage` | Async, persistent |
| Modal (`<dialog>`) | React Navigation modal stack | Native transitions |

### 3.2 Core Components to Convert

**Priority order (build in this sequence):**

1. **PostListScreen** — `<FlatList>` replaces virtualised grid, pull-to-refresh built in
2. **PostItem** — `<View>` + `<Text>` + `<Image>`, `onPress` navigation
3. **PostDetailScreen** — `<ScrollView>` with post content + `<CommentList>`
4. **CommentList** — Recursive `<View>` with `marginLeft` for nesting
5. **SearchBar** — `<TextInput>` dispatching same Redux search action
6. **FilterBar** — `<TouchableOpacity>` buttons for sort/filter (same Redux actions)
7. **VideoPlayer** — `expo-av` `<Video>` component replaces HLS.js
8. **ThemeSwitcher** — React Context + `AsyncStorage` for persistence

### 3.3 Example: PostItem Conversion

**Web version (simplified):**
```jsx
<div className={styles.postItem} onClick={() => onSelect(post)}>
  <img src={post.thumbnail} className={styles.thumbnail} />
  <div className={styles.content}>
    <h3>{post.title}</h3>
    <span>{post.author}</span>
  </div>
</div>
```

**React Native version:**
```jsx
<TouchableOpacity style={styles.postItem} onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
  <Image source={{ uri: post.thumbnail }} style={styles.thumbnail} />
  <View style={styles.content}>
    <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
    <Text style={styles.author}>{post.author}</Text>
  </View>
</TouchableOpacity>
```

### 3.4 Example: PostList with Pull-to-Refresh

```jsx
<FlatList
  data={posts}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PostItem post={item} />}
  onRefresh={() => dispatch(fetchPostsAction())}
  refreshing={loading}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  numColumns={1}
/>
```

---

## Phase 4: Theming

### 4.1 Port CSS Variables to JS Theme Objects

```javascript
// src/themes.js
export const themes = {
  red: {
    name: 'Anfield Red',
    primary: '#C8102E',
    primaryDark: '#8B0000',
    background: '#1a1a2e',
    surface: '#16213e',
    surfaceHover: '#1a2744',
    text: '#ffffff',
    textSecondary: '#a0a0b0',
    accent: '#C8102E',
  },
  cream: {
    name: 'Away Cream',
    primary: '#FBE9D0',
    primaryDark: '#D4A574',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    surfaceHover: '#FFF0E0',
    text: '#2C1810',
    textSecondary: '#8B7355',
    accent: '#C8102E',
  },
  green: {
    name: 'Keeper Green',
    primary: '#1E5631',
    primaryDark: '#0D2818',
    background: '#0A1F0F',
    surface: '#132A1A',
    surfaceHover: '#1A3A22',
    text: '#E8F5E9',
    textSecondary: '#81C784',
    accent: '#4CAF50',
  },
};
```

### 4.2 Theme Context

```javascript
// src/contexts/ThemeContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('red');

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => {
      if (saved && themes[saved]) setThemeName(saved);
    });
  }, []);

  const setTheme = (name) => {
    setThemeName(name);
    AsyncStorage.setItem('theme', name);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## Phase 5: Media Handling

### 5.1 Video Player

```javascript
import { Video } from 'expo-av';

function VideoPlayer({ source }) {
  return (
    <Video
      source={{ uri: source }}
      style={{ width: '100%', aspectRatio: 16/9 }}
      useNativeControls
      resizeMode="contain"
      shouldPlay={false}
    />
  );
}
```

### 5.2 Image Galleries

```javascript
import { Image } from 'expo-image';

function Gallery({ images }) {
  return (
    <FlatList
      data={images}
      horizontal
      pagingEnabled
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item.url }}
          style={{ width: screenWidth, height: 300 }}
          contentFit="contain"
        />
      )}
    />
  );
}
```

---

## Phase 6: Build & Deployment

### 6.1 Configure app.json

```json
{
  "expo": {
    "name": "LFC Reddit Viewer",
    "slug": "lfc-reddit-viewer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#C8102E"
    },
    "ios": {
      "bundleIdentifier": "com.thomasbutler.lfcredditviewer",
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#C8102E"
      },
      "package": "com.thomasbutler.lfcredditviewer"
    }
  }
}
```

### 6.2 Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for both platforms
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 6.3 Requirements for App Store Submission

**iOS (Apple Developer Account — $99/year):**
- Apple Developer Program membership
- App icons (1024x1024 for App Store)
- Screenshots for each device size (iPhone, iPad if supported)
- Privacy policy URL
- App description and keywords

**Android (Google Play Console — $25 one-time):**
- Google Play Developer account
- App icons and feature graphic (1024x500)
- Screenshots for phone and tablet
- Privacy policy URL
- Content rating questionnaire

---

## Phase 7: Suggested Project Structure

```
LFCRedditViewer/
├── App.js                    # Root component with providers
├── app.json                  # Expo config
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js   # Tab + stack navigation
│   ├── screens/
│   │   ├── HomeScreen.js     # Post list with filters
│   │   ├── SearchScreen.js   # Search interface
│   │   ├── PostDetailScreen.js # Full post + comments
│   │   └── SettingsScreen.js # Theme picker
│   ├── components/
│   │   ├── PostItem.js       # Post card
│   │   ├── CommentItem.js    # Single comment with nesting
│   │   ├── CommentList.js    # Comment thread
│   │   ├── FilterBar.js      # Sort/filter controls
│   │   ├── VideoPlayer.js    # expo-av video
│   │   ├── Gallery.js        # Image gallery
│   │   ├── SpicyMeter.js     # Engagement indicator
│   │   └── SkeletonLoader.js # Loading placeholders
│   ├── redux/                # COPIED FROM WEB APP (unchanged)
│   │   ├── store.js
│   │   ├── actions/
│   │   └── reducers/
│   ├── utils/                # COPIED FROM WEB APP (api.js simplified)
│   │   ├── api.js
│   │   ├── cache.js
│   │   ├── formatTime.js
│   │   ├── formatDuration.js
│   │   └── colorHash.js
│   ├── contexts/
│   │   └── ThemeContext.js    # Theme state + persistence
│   ├── themes.js             # Theme colour definitions
│   └── constants.js          # App-wide constants
└── assets/
    ├── icon.png              # App icon
    ├── splash.png            # Splash screen
    └── adaptive-icon.png     # Android adaptive icon
```

---

## Checklist

- [ ] Create Expo project and install dependencies
- [ ] Copy Redux store, actions, and reducers (unchanged)
- [ ] Copy utility files and simplify api.js (remove CORS proxies)
- [ ] Set up React Navigation (bottom tabs + modal stack)
- [ ] Build PostListScreen with FlatList and pull-to-refresh
- [ ] Build PostItem component
- [ ] Build PostDetailScreen with comments
- [ ] Build CommentList with threaded nesting
- [ ] Build SearchScreen with TextInput
- [ ] Build FilterBar (sort, quick filters, media filters)
- [ ] Build VideoPlayer with expo-av
- [ ] Build image/gallery rendering
- [ ] Port 3 themes to JS objects + ThemeContext
- [ ] Add AsyncStorage for theme persistence
- [ ] Add app icons and splash screen (LFC branding)
- [ ] Configure app.json for iOS and Android
- [ ] Test on iOS Simulator
- [ ] Test on Android Emulator
- [ ] Build with EAS Build
- [ ] Submit to App Store and Google Play
