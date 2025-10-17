# 🌟 Lumen Browser

A lightweight, minimal, and elegant web browser built with Tauri.

![Lumen Browser](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Functionality
- **📍 Address Bar** - Navigate to URLs or search the web
- **🔄 Navigation** - Back, Forward, Refresh, and Home buttons
- **📑 Tab Management** - Multiple tabs with easy switching
- **⭐ Bookmarks** - Save and manage your favorite sites (stored locally in JSON)
- **📖 Reader Mode** - Simplified reading experience (coming soon)

### Privacy & Performance
- **🔒 Privacy Defaults**
  - Block third-party cookies
  - Disable media autoplay
  - No tracking or telemetry
- **⚡ Low Memory Mode** - Suspend inactive tabs to save resources
- **🪶 Lightweight** - Small binary size using system WebView
  - Windows: WebView2
  - macOS: WKWebView
  - Linux: WebKitGTK

### User Experience
- **⌨️ Keyboard Shortcuts**
  - `Ctrl+T` - New tab
  - `Ctrl+W` - Close tab
  - `Ctrl+L` - Focus address bar
  - `Ctrl+D` - Bookmark current page
  - `Ctrl+R` - Refresh
  - `Ctrl+Tab` - Next tab
  - `Ctrl+Shift+Tab` - Previous tab
  - `Alt+Left` - Back
  - `Alt+Right` - Forward
- **🎨 Minimal UI** - Clean, distraction-free interface
- **⚙️ Settings** - Customize home page, search engine, and more

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Rust** (latest stable)
   - Install from [rustup.rs](https://rustup.rs/)
3. **Platform-specific requirements:**
   - **Windows**: WebView2 (usually pre-installed on Windows 11)
   - **macOS**: Xcode Command Line Tools
   - **Linux**: WebKitGTK and other dependencies
     ```bash
     sudo apt install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       file \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
     ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lumen-browser.git
   cd lumen-browser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

4. **Build for production**
   ```bash
   npm run tauri:build
   ```

   The compiled binary will be in `src-tauri/target/release/`

## 📦 Binary Sizes (Approximate)

- **Windows**: ~5-8 MB (using system WebView2)
- **macOS**: ~6-10 MB (using WKWebView)
- **Linux**: ~8-12 MB (using WebKitGTK)

*Note: Sizes are significantly smaller than Electron-based browsers (typically 100+ MB)*

## 🗂️ Project Structure

```
lumen-browser/
├── src/                    # Frontend source
│   ├── main.js            # Main JavaScript logic
│   └── styles.css         # Styling
├── src-tauri/             # Rust backend
│   ├── src/
│   │   └── main.rs        # Tauri backend logic
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── index.html             # Main HTML file
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration
```

## 🔧 Configuration

### Settings Location

Settings and bookmarks are stored locally:
- **Windows**: `%APPDATA%\com.lumen.browser\`
- **macOS**: `~/Library/Application Support/com.lumen.browser/`
- **Linux**: `~/.config/com.lumen.browser/`

### Customization

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and behavior
- App identifier
- Bundle settings
- Security policies

## 🛠️ Development

### Tech Stack

- **Frontend**: Vanilla JavaScript + HTML + CSS
- **Build Tool**: Vite
- **Backend**: Rust + Tauri
- **WebView**: System native (WebView2/WKWebView/WebKitGTK)

### Why Tauri?

1. **Small Binary Size** - Uses system WebView instead of bundling Chromium
2. **Low Memory Usage** - More efficient than Electron
3. **Cross-Platform** - Works on Windows, macOS, and Linux
4. **Rust Backend** - Fast, safe, and reliable
5. **Modern Frontend** - Use any web framework you want

### Adding Features

The architecture is modular. To add new features:

1. **Frontend**: Edit `src/main.js` and add UI in `index.html`
2. **Backend**: Add Tauri commands in `src-tauri/src/main.rs`
3. **Styling**: Update `src/styles.css`

## 📋 Roadmap

- [ ] **WebView Integration** - Actual webpage rendering (currently shows placeholder)
- [ ] **Reader Mode** - Distraction-free reading
- [ ] **Ad Blocking** - Host-based ad filtering
- [ ] **Download Manager** - Handle file downloads
- [ ] **History** - Browse history with search
- [ ] **Extensions** - Simple extension system
- [ ] **Themes** - Dark mode and custom themes
- [ ] **Password Manager** - Basic password storage
- [ ] **Sync** - Optional cross-device sync
- [ ] **Mobile Apps** - Android/iOS versions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Inspired by minimal browser designs
- Thanks to the open-source community

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Made with ❤️ for a faster, cleaner web experience**