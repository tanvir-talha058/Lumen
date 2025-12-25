# Lumen Browser - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Lumen Browser                            │
│                   (Tauri Application)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (UI Layer)                        │
├─────────────────────────────────────────────────────────────────┤
│  index.html          │  src/main.js      │  src/styles.css     │
│  ─────────────       │  ─────────────    │  ──────────────     │
│  • Tab Strip         │  • State Mgmt     │  • Layout           │
│  • Address Bar       │  • Tab Logic      │  • Themes           │
│  • Navigation        │  • Bookmarks      │  • Animations       │
│  • Settings UI       │  • Settings       │  • Responsive       │
│  • Modals            │  • Shortcuts      │  • Components       │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (Tauri API)
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Rust Layer)                         │
├─────────────────────────────────────────────────────────────────┤
│  src-tauri/src/main.rs                                          │
│  ──────────────────────────────────────────                     │
│  • Tauri Commands                                               │
│    - get_bookmarks()                                            │
│    - add_bookmark()                                             │
│    - delete_bookmark()                                          │
│  • File I/O                                                     │
│  • Data Persistence                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   System WebView Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Windows: WebView2  │  macOS: WKWebView  │  Linux: WebKitGTK  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Operating System                           │
│               (Windows / macOS / Linux)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Navigation Flow
```
User types URL
     ↓
[Address Bar Input] → main.js: navigate()
     ↓
Parse URL/Search Query
     ↓
Update Tab State
     ↓
[WebView Container] → Display Content
```

### 2. Bookmark Flow
```
User clicks Bookmark (⭐)
     ↓
[JavaScript] main.js: addBookmark()
     ↓
[Tauri API] invoke('add_bookmark', {...})
     ↓
[Rust Backend] add_bookmark()
     ↓
Write to JSON File
     ↓
Update UI
```

### 3. Settings Flow
```
User changes settings
     ↓
[Settings Modal] → Update UI State
     ↓
Save to localStorage
     ↓
Apply Settings
     ↓
[Rust Backend] (for persistent data)
```

## Component Structure

```
App
├── Header
│   ├── TabStrip
│   │   ├── Tab (multiple)
│   │   │   ├── Tab Title
│   │   │   └── Close Button
│   │   └── New Tab Button
│   │
│   └── NavBar
│       ├── NavigationControls
│       │   ├── Back Button
│       │   ├── Forward Button
│       │   ├── Refresh Button
│       │   └── Home Button
│       │
│       ├── AddressBarContainer
│       │   ├── Address Input
│       │   └── Reader Mode Button
│       │
│       └── UtilityControls
│           ├── Bookmark Button
│           ├── Bookmarks List Button
│           └── Settings Button
│
├── ContentArea
│   └── WebViewContainer (per tab)
│       └── StartPage / Webpage
│
└── Modals
    ├── BookmarksModal
    │   └── Bookmark List
    │
    └── SettingsModal
        └── Settings Form
```

## State Management

```javascript
state = {
  tabs: [
    {
      id: Number,
      title: String,
      url: String,
      active: Boolean
    }
  ],
  nextTabId: Number,
  bookmarks: [
    {
      id: Number,
      title: String,
      url: String,
      createdAt: String
    }
  ],
  settings: {
    homePage: String,
    searchEngine: String,
    blockThirdPartyCookies: Boolean,
    disableAutoplay: Boolean,
    lowMemoryMode: Boolean,
    tabSuspendTime: Number
  }
}
```

## File Organization

```
Lumen/
│
├── Frontend Files
│   ├── index.html              # UI Structure
│   ├── src/
│   │   ├── main.js            # Application Logic
│   │   └── styles.css         # Styling
│   │
│   └── Build Config
│       ├── package.json        # Dependencies
│       └── vite.config.js     # Build Settings
│
├── Backend Files
│   └── src-tauri/
│       ├── src/
│       │   └── main.rs        # Rust Backend
│       ├── icons/             # App Icons
│       ├── Cargo.toml         # Rust Dependencies
│       ├── tauri.conf.json    # Tauri Config
│       └── build.rs           # Build Script
│
└── Documentation
    ├── README.md              # Main Docs
    ├── QUICKSTART.md          # Setup Guide
    ├── DEVELOPMENT.md         # Dev Notes
    ├── CONTRIBUTING.md        # Contribution Guide
    ├── PROJECT_SUMMARY.md     # Overview
    └── LICENSE                # MIT License
```

## Build Process

```
Development Mode:
npm run tauri:dev
    ↓
1. Vite starts dev server (port 1420)
    ↓
2. Compile Rust backend
    ↓
3. Launch Tauri window
    ↓
4. Hot reload frontend changes
    ↓
5. Restart for backend changes

Production Build:
npm run tauri:build
    ↓
1. Vite builds frontend (minified)
    ↓
2. Cargo builds Rust (release mode)
    ↓
3. Bundle application
    ↓
4. Create installer (.msi, .dmg, .deb)
    ↓
5. Output to src-tauri/target/release/
```

## Event Flow

### Tab Creation
```
User: Click "+" or Ctrl+T
    ↓
createTab()
    ↓
├── Generate new tab ID
├── Deactivate all tabs
├── Add tab to state
├── Render tab UI
└── Switch to new tab
```

### Keyboard Shortcut
```
User: Press Ctrl+L
    ↓
keydown event listener
    ↓
Check: e.ctrlKey && e.key === 'l'
    ↓
e.preventDefault()
    ↓
Focus address bar
```

### Bookmark Save
```
User: Click ⭐ or Ctrl+D
    ↓
addBookmark()
    ↓
Get active tab data
    ↓
Create bookmark object
    ↓
invoke('add_bookmark', {bookmark})
    ↓
Rust: add_bookmark()
    ↓
├── Load existing bookmarks
├── Add new bookmark
├── Serialize to JSON
└── Write to file
    ↓
Update UI with new bookmark
```

## Security Model

```
┌──────────────────────┐
│   Untrusted Web      │
│   Content            │
└──────────────────────┘
         ↕ (Sandboxed)
┌──────────────────────┐
│   System WebView     │
│   (Isolated Process) │
└──────────────────────┘
         ↕ (IPC)
┌──────────────────────┐
│   Tauri Frontend     │
│   (JavaScript)       │
└──────────────────────┘
         ↕ (Tauri API - Whitelisted)
┌──────────────────────┐
│   Tauri Backend      │
│   (Rust - Trusted)   │
└──────────────────────┘
         ↕ (OS APIs)
┌──────────────────────┐
│   Operating System   │
└──────────────────────┘
```

## Performance Considerations

### Memory Usage
```
Base Application:      ~80 MB
+ Frontend:           ~20 MB
+ Active Tab:         ~50 MB
+ Inactive Tab:       ~10 MB (suspended)
────────────────────────────
Single Tab Total:     ~150 MB
```

### Binary Size
```
Rust Backend:         ~3 MB
Frontend Bundle:      ~1 MB
Tauri Runtime:        ~2 MB
System WebView:       ~0 MB (uses system)
────────────────────────────
Total:               ~6 MB
```

### Startup Time
```
1. Load Rust runtime:     ~100ms
2. Initialize Tauri:      ~200ms
3. Load frontend:         ~300ms
4. Render UI:            ~200ms
────────────────────────────────
Total:                   ~800ms
```

## Future Architecture

### With Real WebView Integration
```
┌─────────────────────────────────────┐
│           Tab Manager               │
├─────────────────────────────────────┤
│ Tab 1  │ Tab 2  │ Tab 3  │ ...     │
│   ↓    │   ↓    │   ↓    │         │
│ WV1    │ WV2    │ WV3    │         │
└─────────────────────────────────────┘
  WV = WebView Instance (isolated)
```

### With Extensions
```
┌─────────────────────────────────────┐
│         Extension Manager           │
├─────────────────────────────────────┤
│ Ext 1  │ Ext 2  │ Ext 3            │
│   ↓    │   ↓    │   ↓              │
│ API    │ API    │ API              │
└─────────────────────────────────────┘
         ↕
┌─────────────────────────────────────┐
│      Core Browser Engine            │
└─────────────────────────────────────┘
```

---

This architecture provides:
✅ Separation of concerns
✅ Easy to maintain
✅ Scalable design
✅ Security by default
✅ Cross-platform compatibility
