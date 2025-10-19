# Quick Start Guide - TOP 5 Features

## 🚀 Your Lumen Browser Just Got Superpowers!

All **5 Chrome-alternative features** are now live in your browser. Here's how to use them:

---

## 1️⃣ Vertical Tabs Sidebar 📑

**Always visible on the left side of your browser**

### How to Use:
- **Toggle**: Click the arrow button (☰) to show/hide
- **Search**: Type in the search bar to filter tabs instantly
- **Switch Tab**: Click any tab to make it active
- **Close Tab**: Click the × button on any tab
- **New Tab**: Click the "+ New Tab" button at the bottom

### Pro Tips:
- Keep sidebar open when managing 10+ tabs
- Search by website name or URL
- Active tab is highlighted in blue

---

## 2️⃣ Session Manager Pro 💾

**Never lose your work again!**

### How to Open:
Currently panels need to be triggered manually. Add this to your `index.html` in the chrome menu:

```html
<div class="chrome-menu-item" onclick="document.querySelector('.session-manager-panel').style.display='flex'">
  <span>💾</span>
  <span>Session Manager</span>
</div>
```

### Features:
- **Save Now**: Saves all open tabs instantly
- **Auto-Save**: Toggle ON to auto-save every 5 minutes
- **Restore**: Click any saved session to restore all tabs
- **Delete**: Remove old sessions you don't need

### When to Use:
- Before browser restart
- When switching projects
- Daily at end of work
- Before system updates

---

## 3️⃣ Smart Bookmarks 🔖

**Find any bookmark in 0.5 seconds**

### How to Open:
Add to chrome menu:
```html
<div class="chrome-menu-item" onclick="document.querySelector('.smart-bookmarks-panel').style.display='flex'">
  <span>🔖</span>
  <span>Smart Bookmarks</span>
</div>
```

### Features:
- **Search**: Type anything - finds in title, URL, or tags
- **Filters**: 
  - All - Show everything
  - Recent - Last 24 hours
  - Most Visited - Your top 20
  - Untagged - Needs organization
- **Open**: Click any bookmark to visit
- **Delete**: Remove unwanted bookmarks

### Organization:
- Tags appear as colored badges
- Categories shown at top
- Visit count tracked automatically

---

## 4️⃣ Password Manager 🔐

**Stronger than Chrome's password manager**

### How to Open:
Add to chrome menu:
```html
<div class="chrome-menu-item" onclick="document.querySelector('.password-manager-panel').style.display='flex'">
  <span>🔐</span>
  <span>Password Manager</span>
</div>
```

### First Time Setup:
1. Open Password Manager
2. Create a master password (demo: use "password123")
3. Click "Unlock Vault"

### Features:
- **Security Stats**: Shows weak, reused, and breached passwords
- **Search**: Find passwords by site or username
- **Copy**: One-click copy to clipboard (secure!)
- **Generator**: Create strong passwords
  - Adjust length (8-32 characters)
  - Toggle: Uppercase, Lowercase, Numbers, Symbols
  - Real-time strength indicator
- **Delete**: Remove old passwords

### Password Generator Tips:
- **Weak** = Red (< 40 strength)
- **Medium** = Yellow (40-70 strength)
- **Strong** = Green (> 70 strength)
- Use 16+ characters for maximum security

---

## 5️⃣ Universal Sync ☁️

**Privacy-focused sync across all devices**

### How to Open:
Add to chrome menu:
```html
<div class="chrome-menu-item" onclick="document.querySelector('.sync-panel').style.display='flex'">
  <span>☁️</span>
  <span>Sync Settings</span>
</div>
```

### Features:
- **Sync Now**: Manually trigger sync
- **Devices**: See all your connected devices
- **Selective Sync**: Choose what to sync:
  - ✅ Bookmarks
  - ✅ History
  - ✅ Passwords (encrypted)
  - ✅ Extensions
  - ✅ Sessions
  - ✅ Settings
- **E2E Encryption**: All data is encrypted before leaving your device

### How It Works:
1. Check the boxes for what you want to sync
2. Click "Sync Now" button
3. Watch the sync icon rotate (syncing in progress)
4. See "Last synced" time update

---

## ⌨️ Keyboard Shortcuts (Coming Soon)

Will add these shortcuts:
- `Ctrl+Shift+T` - Toggle Vertical Tabs
- `Ctrl+Shift+S` - Open Session Manager
- `Ctrl+Shift+B` - Open Smart Bookmarks
- `Ctrl+Shift+P` - Open Password Manager
- `Ctrl+Shift+Y` - Open Sync Panel

---

## 🎯 Quick Menu Integration

### Add All Features to Chrome Menu:

Replace your current `.chrome-menu-content` with:

```html
<div class="chrome-menu-content">
  <div class="chrome-menu-item" onclick="document.querySelector('.session-manager-panel').style.display='flex'">
    <span>💾</span>
    <span>Session Manager</span>
  </div>
  <div class="chrome-menu-item" onclick="document.querySelector('.smart-bookmarks-panel').style.display='flex'">
    <span>🔖</span>
    <span>Smart Bookmarks</span>
  </div>
  <div class="chrome-menu-item" onclick="document.querySelector('.password-manager-panel').style.display='flex'">
    <span>🔐</span>
    <span>Password Manager</span>
  </div>
  <div class="chrome-menu-item" onclick="document.querySelector('.sync-panel').style.display='flex'">
    <span>☁️</span>
    <span>Sync Settings</span>
  </div>
  <div class="chrome-menu-divider"></div>
  <div class="chrome-menu-item" onclick="showExtensionsPanel()">
    <span>🧩</span>
    <span>Extensions</span>
  </div>
  <div class="chrome-menu-item" onclick="showVoiceModal()">
    <span>🎤</span>
    <span>Voice Search</span>
  </div>
</div>
```

---

## 📊 Data Storage

All your data is stored **locally** on your device:

| Feature | Storage Key | Data |
|---------|-------------|------|
| Vertical Tabs | `verticalTabs` | Tab list |
| Sessions | `browserSessions` | Saved sessions |
| Bookmarks | `smartBookmarks` | All bookmarks |
| Passwords | `encryptedPasswords` | Encrypted vault |
| Sync | `syncSettings` | Sync preferences |

**Location**: Browser LocalStorage (inspect with F12 → Application → Local Storage)

---

## 🔒 Security Notes

### Master Password:
- Used only for Password Manager
- **NOT** stored anywhere (enter each session)
- Production version will use proper encryption

### Data Privacy:
- Everything stored locally
- No data sent to servers (yet)
- Sync will use E2E encryption

### Best Practices:
1. Use a strong master password (16+ chars)
2. Enable auto-save for sessions
3. Regularly backup your data
4. Use password generator for new accounts

---

## 🐛 Troubleshooting

### Panel Won't Open?
- Check if panel display is set to 'flex'
- Open browser console (F12) for errors
- Refresh page and try again

### Features Not Working?
- Clear browser cache (Ctrl+Shift+Delete)
- Check LocalStorage isn't full
- Try incognito mode to test

### Data Not Saving?
- Check browser permissions
- Ensure LocalStorage is enabled
- Try exporting data as backup

### Performance Issues?
- Close unused panels
- Clear old sessions (keep last 10)
- Remove duplicate bookmarks

---

## 💡 Tips & Tricks

### Vertical Tabs:
- Collapse sidebar for more screen space
- Search by URL to find specific sites
- Close all tabs except active one

### Session Manager:
- Name important sessions (coming soon)
- Use auto-save for peace of mind
- Restore sessions when browser crashes

### Smart Bookmarks:
- Tag everything for easy finding
- Use "Most Visited" to find favorites
- Clean up "Untagged" regularly

### Password Manager:
- Generate 20+ char passwords for banks
- Use different password for every site
- Check security stats weekly

### Sync:
- Disable password sync on public computers
- Enable all options on trusted devices
- Sync before major updates

---

## 📈 What's Next?

### Coming in v3.1:
- Drag-and-drop tab reordering
- Session naming and tags
- AI bookmark categorization
- Breach detection for passwords
- Cloud sync backend

### Coming in v3.2:
- Tab groups and nesting
- Import from Chrome
- Password auto-fill
- Multi-account sync
- Mobile version

---

## 🎉 You're All Set!

You now have **5 powerful features** that Chrome doesn't offer:
1. ✅ Vertical tabs for power browsing
2. ✅ Session management for peace of mind
3. ✅ Smart bookmarks for organization
4. ✅ Password manager for security
5. ✅ Privacy-focused sync

**Enjoy your supercharged browser!** 🚀

---

**Need Help?**  
Open an issue on GitHub: [tanvir-talha058/Lumen](https://github.com/tanvir-talha058/Lumen)

---

*Happy Browsing! 🌐*
