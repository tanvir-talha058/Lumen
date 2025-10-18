# 🔧 Quick Setup Guide - Visual Studio Build Tools

## The Issue
You're seeing this error when trying to build:
```
error: linker link.exe not found
note: the msvc targets depend on the msvc linker but link.exe was not found
```

This means you need the Microsoft Visual C++ compiler and linker.

## ✅ Solution: Install Build Tools

### Method 1: Visual Studio Build Tools (Fastest - Recommended)

1. **Download Build Tools**
   - Visit: https://visualstudio.microsoft.com/downloads/
   - Scroll down to "All Downloads"
   - Download "Build Tools for Visual Studio 2022"

2. **Install Required Workload**
   - Run the installer
   - Select **"Desktop development with C++"**
   - Click Install (requires ~7 GB)

3. **Restart Terminal**
   - Close all PowerShell windows
   - Open new PowerShell in your project folder
   - Run: `.\run-dev.bat`

### Method 2: Full Visual Studio Community (If you want the IDE)

1. **Download Visual Studio Community**
   - Visit: https://visualstudio.microsoft.com/vs/community/
   - Download Visual Studio Community 2022 (free)

2. **During Installation**
   - Select **"Desktop development with C++"** workload
   - This includes C++ compiler, linker, and Windows SDK
   - Click Install (~10 GB with IDE)

3. **Run Your Project**
   - Restart terminal
   - Run: `.\run-dev.bat`

### Method 3: Alternative Rust Toolchain (If you prefer GNU)

If you don't want to install Visual Studio Build Tools:

```powershell
# Switch to GNU toolchain (doesn't require Visual Studio)
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu

# Install MinGW
winget install -e --id GnuWin32.Make

# Try building again
.\run-dev.bat
```

**Note**: The MSVC toolchain (Method 1/2) is recommended for Windows as it produces faster binaries.

## 🚀 After Installation

Once build tools are installed:

```powershell
# Navigate to your project
cd "d:\Vs Code\Lumen"

# Run development server
.\run-dev.bat

# Or use npm directly
npm run tauri:dev
```

The first build will take 2-5 minutes as it compiles 406 Rust packages. Subsequent builds will be much faster (~30 seconds).

## ✨ What You'll See

Once running, you'll see:
1. **Vite dev server** running on `http://localhost:1420`
2. **Lumen Browser window** opens automatically
3. Beautiful gradient start page
4. All v2.0 features working (sidebar, command palette, tabs, etc.)

## 🎯 Quick Test Checklist

After it launches, try:
- ✅ Press `Ctrl+K` - Command palette should appear
- ✅ Press `Ctrl+T` - New tab should open
- ✅ Press `Ctrl+B` - Sidebar should toggle
- ✅ Press `Ctrl+\` - Split view should activate
- ✅ Type in omnibox - Suggestions should appear
- ✅ Click ⚙️ icon - Settings modal should open
- ✅ Try changing theme to Dark mode

## 🐛 Troubleshooting

### Error: "npm not found"
```powershell
winget install -e --id OpenJS.NodeJS
```

### Error: "rustc not found"
```powershell
# PATH issue - restart terminal after Rust installation
# Or manually add to PATH:
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

### Error: "failed to fetch index"
```powershell
# Clear cargo cache
cargo clean
del ~/.cargo/.package-cache
```

### Port 1420 already in use
```powershell
# Kill existing process
netstat -ano | findstr :1420
taskkill /PID [PID_NUMBER] /F
```

## 📞 Need Help?

If you encounter issues:
1. Check that Visual Studio Build Tools installed successfully
2. Restart your terminal/PowerShell
3. Verify Rust is in PATH: `rustc --version`
4. Verify Cargo is in PATH: `cargo --version`
5. Try `cargo clean` then rebuild

## 🎉 Expected Result

When successful, you'll see output like:
```
    Finished dev [unoptimized + debuginfo] target(s) in 2.34s
  VITE v5.0.0  ready in 432 ms
  ➜  Local:   http://localhost:1420/
```

And the Lumen Browser window will open with all v2.0 features ready!

---

**Time to compile: First time ~2-5 min | Subsequent builds ~30 sec**

**Binary size: ~8 MB (vs 200MB+ Chrome/Firefox)** 🚀
