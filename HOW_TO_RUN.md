# 🚀 Lumen Browser - How to Run

## ✅ **Best Method: Use Development Server**

The browser works best with a local web server to avoid file:// restrictions.

### **Quick Start:**

```powershell
# Run this command in PowerShell:
npm run dev
```

Then open your browser to: **http://localhost:1420/**

---

## 🎯 **Alternative Methods**

### **Method 1: Development Server (Recommended)**

```powershell
# Start server
npm run dev

# Open browser to: http://localhost:1420/
```

**Pros:**
- ✅ All features work perfectly
- ✅ No CORS issues
- ✅ Hot reload during development

---

### **Method 2: Portable with Chrome/Edge**

If the launcher shows HTML as text, use this instead:

```powershell
# Open Chrome with the right flags
chrome.exe --app="file:///D:/Vs Code/Lumen/index.html" --allow-file-access-from-files --disable-web-security --user-data-dir="D:/Vs Code/Lumen/.profile"
```

Or for Edge:
```powershell
msedge.exe --app="file:///D:/Vs Code/Lumen/index.html" --allow-file-access-from-files --disable-web-security --user-data-dir="D:/Vs Code/Lumen/.profile"
```

---

### **Method 3: Build and Use Electron**

For a true standalone app:

```powershell
# Run PowerShell as Administrator
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
npm run package
```

Then run: `electron-dist/win-unpacked/Lumen Browser.exe`

---

## 🐛 **Why HTML Shows as Text?**

The issue you're seeing is caused by:
1. **CORS restrictions** - Browsers block local file:// access for security
2. **MIME type issues** - Files loaded directly may not have correct content type

**Solution:** Use a web server (Method 1) or Electron (Method 3)

---

## 📦 **For Distribution**

### **Option A: Share with Vite Dev Server**

Users need:
1. Node.js installed
2. Run `npm install` in the folder
3. Run `npm run dev`
4. Open http://localhost:1420/

### **Option B: Build Static Files**

```powershell
# Build production files
npm run build

# Serve the dist/ folder with any web server
npx http-server dist -p 8080
```

### **Option C: Electron App (Best for End Users)**

Build standalone .exe that doesn't need web server:

```powershell
# As Administrator
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"  
npm run electron:build
```

---

## 🎯 **Recommended for You**

**Right now:**
```powershell
npm run dev
```

Then visit: **http://localhost:1420/** ← Your browser will work perfectly here!

**For distribution:**
- Build Electron app (requires admin PowerShell)
- Or host online (GitHub Pages, Netlify, Vercel)

---

## 💡 **Quick Fix**

If you're seeing HTML as text in the portable version, **just use the dev server instead**:

```powershell
npm run dev
```

All your features will work perfectly at http://localhost:1420/! 🎉

---

*The portable .bat launcher has limitations with file:// protocol. The dev server is the recommended way to run it.*
