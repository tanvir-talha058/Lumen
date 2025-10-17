# 🚀 Quick Start Guide - Lumen Browser

This guide will get you up and running with Lumen Browser in minutes!

## Step 1: Install Prerequisites

### Install Rust
```powershell
# Download and run rustup-init.exe
# Or use winget:
winget install Rustlang.Rustup
```

After installation, verify:
```powershell
rustc --version
cargo --version
```

### Install Node.js
```powershell
# Download from nodejs.org or use winget:
winget install OpenJS.NodeJS
```

Verify:
```powershell
node --version
npm --version
```

### Install WebView2 (Windows)
Windows 11 has this pre-installed. For Windows 10:
```powershell
winget install Microsoft.EdgeWebView2Runtime
```

## Step 2: Install Dependencies

Open PowerShell in the project directory:

```powershell
# Install Node.js dependencies
npm install
```

This will install:
- Vite (build tool)
- Tauri CLI
- Tauri API bindings

## Step 3: Run in Development Mode

```powershell
npm run tauri:dev
```

**What happens:**
1. Vite starts dev server on http://localhost:1420
2. Tauri compiles Rust backend
3. Browser window opens automatically

**First run takes 2-5 minutes** (Rust compilation). Subsequent runs are fast!

## Step 4: Try the Features

### Basic Navigation
1. Click the address bar or press `Ctrl+L`
2. Type a search query or URL
3. Press Enter

### Tabs
- **New Tab**: Click `+` button or press `Ctrl+T`
- **Close Tab**: Click `×` on tab or press `Ctrl+W`
- **Switch Tabs**: Click on tabs or use `Ctrl+Tab`

### Bookmarks
1. Navigate to a site (search for something)
2. Press `Ctrl+D` or click ⭐
3. View bookmarks: Click 📚 icon

### Settings
1. Click ⚙️ icon
2. Configure:
   - Home page URL
   - Default search engine (Google, DuckDuckGo, Bing, Brave)
   - Privacy options
   - Low memory mode
3. Click "Save Settings"

### Keyboard Shortcuts (Windows)
- `Ctrl+T` - New tab
- `Ctrl+W` - Close tab
- `Ctrl+L` - Focus address bar
- `Ctrl+D` - Bookmark page
- `Ctrl+R` - Refresh
- `Ctrl+Tab` - Next tab
- `Ctrl+Shift+Tab` - Previous tab
- `Alt+Left` - Back
- `Alt+Right` - Forward

## Step 5: Build for Production

```powershell
npm run tauri:build
```

**Output location:**
```
src-tauri\target\release\lumen-browser.exe
src-tauri\target\release\bundle\msi\lumen-browser_0.1.0_x64_en-US.msi
```

**Installer**: Use the .msi file to install on other Windows machines

**Portable**: Copy the .exe to run without installation

## Troubleshooting

### "npm install" fails
```powershell
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

### Rust compilation errors
```powershell
# Update Rust
rustup update stable
# Clean and rebuild
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

### Port 1420 already in use
```powershell
# Kill process using the port
netstat -ano | findstr :1420
taskkill /PID <PID> /F
```

### WebView2 not found
```powershell
# Install WebView2 Runtime
winget install Microsoft.EdgeWebView2Runtime
```

## Development Tips

### Hot Reload
- **Frontend changes**: Auto-reload (Vite)
- **Rust changes**: Requires restart of dev server

### Debug Console
Press `F12` in the browser window to open DevTools

### Logs
- Frontend logs: DevTools Console
- Rust logs: Terminal where you ran `npm run tauri:dev`

### File Locations

**Source code:**
- Frontend: `src/main.js`, `src/styles.css`, `index.html`
- Backend: `src-tauri/src/main.rs`
- Config: `src-tauri/tauri.conf.json`

**User data:**
- Bookmarks: `%APPDATA%\com.lumen.browser\bookmarks.json`
- Settings: Browser LocalStorage

## Next Steps

### Customize the UI
1. Edit `src/styles.css` for colors and layout
2. Modify `index.html` for structure
3. Update `src/main.js` for behavior

### Add Features
See `DEVELOPMENT.md` for architecture details and ideas:
- Reader mode
- Ad blocking
- Download manager
- History tracking
- Extensions system

### Performance Tuning

**Optimize build size:**
```toml
# Edit src-tauri/Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
strip = true        # Strip symbols
```

**Faster compilation:**
```toml
[profile.dev]
opt-level = 1       # Some optimization in dev
```

## Common Tasks

### Update dependencies
```powershell
# Frontend
npm update

# Rust
cd src-tauri
cargo update
cd ..
```

### Run tests
```powershell
# Rust backend tests
cd src-tauri
cargo test
cd ..
```

### Format code
```powershell
# Rust
cd src-tauri
cargo fmt
cd ..

# JavaScript (install prettier first)
npm install --save-dev prettier
npx prettier --write "src/**/*.{js,css,html}"
```

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Tauri Docs**: https://tauri.app/
- **Rust Docs**: https://doc.rust-lang.org/
- **Vite Docs**: https://vitejs.dev/

## What's Next?

Current implementation shows **placeholder content** when navigating. To add real webpage rendering, you'll need to:

1. **Option A**: Use multiple Tauri windows (one per tab)
2. **Option B**: Implement custom webview embedding
3. **Option C**: Use tauri-plugin-webview (when available)

See `DEVELOPMENT.md` for detailed implementation strategies!

---

**Enjoy building with Lumen! 🌟**
