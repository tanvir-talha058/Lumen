# 🚀 Lumen Browser - Portable Edition

## ⚠️ Important Note

If you see HTML code as text instead of the browser interface, this is due to browser security restrictions with local files.

## ✅ **How to Run Properly**

### **Method 1: Using Development Server (RECOMMENDED)**

1. Make sure you have Node.js installed: https://nodejs.org/
2. Open PowerShell in the Lumen folder
3. Run: `npm install` (first time only)
4. Run: `npm run dev`
5. Open your browser to: http://localhost:1420/

**This method ensures all features work perfectly!**

---

### **Method 2: Using Chrome/Edge Directly**

If you must use file:// protocol:

**For Chrome:**
Right-click `index.html` → Open with → Chrome
Then add these flags in a shortcut:
```
chrome.exe --allow-file-access-from-files --disable-web-security
```

**For Edge:**
```
msedge.exe --allow-file-access-from-files --disable-web-security
```

⚠️ Warning: This disables security features. Use only for testing!

---

## 🌟 Features Included

✅ **All TOP 5 Features:**
- Vertical Tabs Manager
- Session Manager  
- Smart Bookmarks
- Password Manager
- Universal Sync

✅ **Modern Design:**
- Clean, aesthetic interface
- Smooth animations
- Professional appearance

---

## 📋 System Requirements

- Windows 7/8/10/11
- Node.js (for dev server method)
- OR Chrome/Edge (for portable method)

---

## 🆘 Troubleshooting

**Problem:** HTML shows as plain text
**Solution:** Use `npm run dev` and open http://localhost:1420/

**Problem:** Features don't work
**Solution:** File:// protocol has limitations. Use the dev server!

**Problem:** Need standalone .exe
**Solution:** Ask the developer for the Electron build

---

## 📞 Support

Visit: https://github.com/tanvir-talha058/Lumen

**For best experience, use the development server!**

---

**Quick Start:**
```powershell
npm install
npm run dev
```

Then open: **http://localhost:1420/** 🎉
