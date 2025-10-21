# Building Lumen Browser for Windows 🪟

## 📦 **Quick Build Guide**

### **Option 1: Quick Build (Recommended)**

```powershell
# Run this single command to build the Windows installer
npm run tauri:build
```

This will create:
- ✅ **`.exe` installer** - Install on any Windows PC
- ✅ **`.msi` installer** - For corporate deployment
- ✅ Portable executable (optional)

---

## 🎯 **Step-by-Step Instructions**

### **Prerequisites**

Make sure you have installed:
1. ✅ **Node.js** (v16 or higher)
2. ✅ **Rust** (latest stable)
3. ✅ **Visual Studio Build Tools** (for Windows)

---

### **Step 1: Install Dependencies**

```powershell
# Install npm packages
npm install
```

---

### **Step 2: Build the Application**

```powershell
# This builds both the frontend and Rust backend
npm run tauri:build
```

**What happens:**
1. Vite builds your frontend (`index.html`, `main.js`, `styles.css`)
2. Rust compiles the Tauri backend
3. Creates Windows installers

**Build time:** ~2-5 minutes (first time), ~30-60 seconds (subsequent builds)

---

### **Step 3: Find Your Installers**

After build completes, find your installers at:

```
d:\Vs Code\Lumen\src-tauri\target\release\bundle\
```

**You'll find:**

#### **NSIS Installer (.exe)**
```
📁 nsis/
   └── 📦 Lumen_0.1.0_x64-setup.exe      (Recommended for distribution)
```
- **Size:** ~5-10 MB
- **Usage:** Double-click to install
- **Best for:** End users, easy distribution

#### **MSI Installer (.msi)**
```
📁 msi/
   └── 📦 Lumen_0.1.0_x64_en-US.msi      (For corporate deployment)
```
- **Size:** ~5-10 MB
- **Usage:** Windows Installer package
- **Best for:** IT departments, group policy deployment

#### **Portable Executable**
```
📁 release/
   └── 📦 lumen.exe                      (Standalone executable)
```
- **Size:** ~5-10 MB
- **Usage:** Run directly, no installation
- **Best for:** Portable usage, testing

---

## 🚀 **Distribution Options**

### **Option A: Share the .exe Installer**

1. Navigate to: `d:\Vs Code\Lumen\src-tauri\target\release\bundle\nsis\`
2. Find: `Lumen_0.1.0_x64-setup.exe`
3. Share this file (upload to GitHub, Google Drive, etc.)
4. Users double-click to install

**Pros:**
- ✅ Easy for users
- ✅ Creates Start Menu shortcut
- ✅ Can be uninstalled normally

### **Option B: Portable Version**

1. Navigate to: `d:\Vs Code\Lumen\src-tauri\target\release\`
2. Copy `lumen.exe` 
3. Share this file
4. Users run directly, no installation needed

**Pros:**
- ✅ No installation required
- ✅ Smaller download
- ✅ Great for USB stick

### **Option C: Microsoft Store (Advanced)**

For Microsoft Store distribution, you'll need:
- Microsoft Developer account ($19 one-time fee)
- MSIX packaging (Tauri supports this)
- App certification

---

## 🎨 **Customizing the Build**

### **Change App Name or Version**

Edit `src-tauri/tauri.conf.json`:

```json
{
  "package": {
    "productName": "Lumen Browser",
    "version": "1.0.0"
  }
}
```

### **Change App Icon**

Replace icons in `src-tauri/icons/`:
- `icon.ico` - Windows icon (256x256)
- `32x32.png` - Small icon
- `128x128.png` - Medium icon
- `icon.icns` - macOS icon (for later)

**To create icons:**
```powershell
# Use online tools like:
# - https://redketchup.io/icon-converter
# - Upload a 1024x1024 PNG
# - Download all formats
```

### **Build Configuration**

Edit `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "identifier": "com.lumen.browser",    // Unique app ID
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.ico"
      ],
      "windows": {
        "certificateThumbprint": null,       // For code signing
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    }
  }
}
```

---

## 🔐 **Code Signing (Optional but Recommended)**

### **Why Code Sign?**
- ✅ Removes "Unknown Publisher" warning
- ✅ Users trust your app more
- ✅ Windows SmartScreen won't block it

### **How to Code Sign:**

1. **Get a Code Signing Certificate**
   - Purchase from: DigiCert, Sectigo, Comodo (~$70-$200/year)
   - Or use: SignPath (free for open source)

2. **Sign during build:**
   ```powershell
   # Set environment variables
   $env:TAURI_SIGNING_PRIVATE_KEY="path/to/cert.pfx"
   $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD="your-password"
   
   # Build with signing
   npm run tauri:build
   ```

---

## 📊 **Build Output Details**

### **File Sizes (Approximate):**
```
Lumen_0.1.0_x64-setup.exe    ~8 MB     (Installer)
Lumen_0.1.0_x64_en-US.msi    ~8 MB     (MSI Package)
lumen.exe                     ~6 MB     (Portable)
```

### **System Requirements:**
- **OS:** Windows 7/8/10/11 (64-bit)
- **Memory:** 100-200 MB RAM
- **Disk:** 20-30 MB installed
- **Processor:** Any modern CPU

---

## 🧪 **Testing the Build**

### **Test Locally:**

```powershell
# Run the built executable
.\src-tauri\target\release\lumen.exe
```

### **Test Installer:**

1. Double-click `Lumen_0.1.0_x64-setup.exe`
2. Follow installation wizard
3. App appears in Start Menu
4. Test all features
5. Uninstall from Settings → Apps

---

## 🐛 **Troubleshooting**

### **Error: "Rust not found"**

```powershell
# Install Rust
winget install Rustlang.Rust.MSVC
```

### **Error: "MSVC build tools not found"**

```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"
```

### **Error: "npm run tauri:build not found"**

```powershell
# Reinstall dependencies
npm install
```

### **Build is Slow**

```powershell
# Use release mode with optimizations
npm run tauri:build -- --release
```

---

## 🚀 **Quick Commands Reference**

```powershell
# Development (hot reload)
npm run tauri:dev

# Build for production
npm run tauri:build

# Build with debug info
npm run tauri:build -- --debug

# Clean build cache
cd src-tauri
cargo clean
cd ..

# Rebuild everything
npm run tauri:build
```

---

## 📦 **GitHub Release (Recommended)**

### **Step 1: Tag Your Version**

```powershell
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### **Step 2: Create GitHub Release**

1. Go to: https://github.com/tanvir-talha058/Lumen/releases
2. Click "Create a new release"
3. Choose tag: `v1.0.0`
4. Upload installers:
   - `Lumen_0.1.0_x64-setup.exe`
   - `Lumen_0.1.0_x64_en-US.msi`
5. Add release notes
6. Publish

### **Step 3: Users Download**

```
https://github.com/tanvir-talha058/Lumen/releases/latest
```

---

## 🎯 **Automated Builds (CI/CD)**

### **GitHub Actions Workflow**

Create `.github/workflows/build.yml`:

```yaml
name: Build Windows App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Install Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
    
    - name: Install dependencies
      run: npm install
    
    - name: Build Tauri app
      run: npm run tauri:build
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: windows-installer
        path: src-tauri/target/release/bundle/nsis/*.exe
```

---

## 🎉 **You're Ready!**

### **Quick Start:**

```powershell
# 1. Build the app
npm run tauri:build

# 2. Find installer
cd src-tauri\target\release\bundle\nsis

# 3. Share the .exe file!
```

### **Your Windows app includes:**
- ✅ All TOP 5 features (Vertical Tabs, Sessions, Bookmarks, Passwords, Sync)
- ✅ Modern, clean design
- ✅ Native Windows performance
- ✅ ~8 MB installer size
- ✅ Start Menu integration
- ✅ System tray icon
- ✅ Auto-updates ready (with Tauri updater)

---

## 📈 **Next Steps**

1. **Build:** `npm run tauri:build`
2. **Test:** Install and test all features
3. **Share:** Upload to GitHub releases
4. **Promote:** Share on Reddit, Twitter, Product Hunt
5. **Iterate:** Gather feedback, improve, release v1.1.0

---

## 💡 **Pro Tips**

- ✅ **Version naming:** Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
- ✅ **File size:** Compress with UPX if needed (reduce by 30-50%)
- ✅ **Updates:** Implement Tauri's auto-updater for easy updates
- ✅ **Telemetry:** Add analytics to understand user behavior
- ✅ **Crash reports:** Integrate Sentry for error tracking

---

## 🌟 **Distribution Platforms**

Consider publishing on:
- 🔵 **GitHub Releases** (Free, easy)
- 🟢 **Microsoft Store** ($19 fee, wider reach)
- 🟡 **winget** (Windows Package Manager, free)
- 🔴 **Chocolatey** (Package manager for power users)
- 🟣 **SourceForge** (Traditional, free)

---

**Happy building! Your users are going to love this! 🚀**

---

*Need help? Open an issue on GitHub or check the [Tauri docs](https://tauri.app/v1/guides/building/)*
