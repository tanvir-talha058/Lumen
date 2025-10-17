# Lumen Browser - Development Notes

## Architecture Overview

### Frontend (JavaScript)
- **State Management**: Simple object-based state in `main.js`
- **Tab Management**: Array of tab objects with active state
- **Bookmarks**: Local JSON storage via Tauri backend
- **Settings**: LocalStorage + Tauri for persistence

### Backend (Rust)
- **Bookmark Storage**: JSON file in app data directory
- **Commands**: `get_bookmarks`, `add_bookmark`, `delete_bookmark`
- **Future**: Add history, downloads, extensions support

## Performance Optimizations

1. **Low Memory Mode**
   - Suspend inactive tabs after configurable time
   - Unload DOM content but keep tab state
   - Restore on tab activation

2. **Lazy Loading**
   - Only render active tab's webview
   - Defer loading of bookmarks until needed
   - Minimize initial bundle size

3. **Efficient Rendering**
   - Use CSS transforms for smooth animations
   - Virtual scrolling for large bookmark lists
   - Debounce address bar search

## Security Considerations

1. **Content Security Policy** - Configured in tauri.conf.json
2. **Third-Party Cookies** - Blocked by default
3. **HTTPS Enforcement** - Auto-upgrade to HTTPS
4. **Sandboxing** - Tauri's built-in process isolation

## Next Steps for Full WebView Integration

Currently, the browser shows placeholder content. To add real webpage rendering:

### Option 1: Multiple Tauri Windows (Simpler)
```rust
// Create a new window for each tab
let window = tauri::WindowBuilder::new(
    app,
    "tab_1",
    tauri::WindowUrl::External(url.parse().unwrap())
).build()?;
```

### Option 2: WebView Plugin (Better UX)
Use the tauri-plugin-webview to embed multiple webviews in a single window.

### Option 3: Custom WebView Management
- Windows: Use WebView2 directly via windows-rs
- macOS: WKWebView via objc bindings
- Linux: WebKitGTK via gtk-rs

## Mobile Strategy

### Android
- Use Android WebView
- Kotlin + Jetpack Compose UI
- Share bookmark/settings JSON format

### iOS
- Use WKWebView
- SwiftUI interface
- CloudKit for optional sync

## Ad Blocking Implementation

Simple host-based blocking:
1. Maintain blocklist (hosts format)
2. Intercept navigation events
3. Block requests to known ad domains

```rust
// Example Tauri command
#[tauri::command]
fn should_block_url(url: String) -> bool {
    let blocklist = load_blocklist();
    blocklist.contains(&extract_domain(&url))
}
```

## Reader Mode Implementation

1. Extract article content (Readability.js algorithm)
2. Strip ads, sidebars, navigation
3. Apply clean typography stylesheet
4. Toggle between normal and reader view

## Extension System Ideas

Simple manifest-based extensions:
```json
{
  "name": "Example Extension",
  "version": "1.0",
  "permissions": ["tabs", "storage"],
  "content_scripts": ["script.js"],
  "background": "background.js"
}
```

Load extensions from `~/.config/lumen/extensions/`

## Build Optimization

### Reduce Binary Size
```toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
strip = true        # Strip symbols
```

### Faster Builds
```toml
[profile.dev]
opt-level = 1       # Some optimization in dev
```

## Testing Strategy

1. **Unit Tests**: Rust backend logic
2. **Integration Tests**: Tauri command handlers
3. **E2E Tests**: WebDriver for full flow
4. **Manual Testing**: Cross-platform verification

## Deployment

### Windows
- Build MSI installer via Tauri
- Sign with certificate (optional)
- Distribute via GitHub Releases

### macOS
- Build .app and .dmg
- Code sign and notarize (required for distribution)
- Upload to GitHub Releases

### Linux
- Build .deb and .AppImage
- Submit to package managers (Flathub, Snap Store)

## Performance Benchmarks

Target metrics:
- **Startup Time**: < 1 second
- **Memory Usage**: < 100 MB base (per tab adds ~50 MB)
- **Binary Size**: < 10 MB
- **Tab Switch**: < 100ms

## Community & Ecosystem

- GitHub Discussions for feature requests
- Discord server for real-time help
- Documentation site (Docusaurus/VitePress)
- Plugin marketplace (future)
