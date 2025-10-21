# 🛠️ Installing Build Tools for Windows

## ⚠️ **Issue**
You need **Visual Studio Build Tools** to compile Rust/Tauri applications on Windows.

---

## ✅ **Solution: Install Visual Studio Build Tools**

### **Option 1: Quick Install (Recommended)**

1. **Download Build Tools:**
   - Open this link: https://visualstudio.microsoft.com/downloads/
   - Scroll down to "**Tools for Visual Studio**"
   - Download "**Build Tools for Visual Studio 2022**"

2. **Run the Installer:**
   - Double-click the downloaded file
   - Wait for installer to load

3. **Select Components:**
   - Check: **✅ Desktop development with C++**
   - This will include:
     - MSVC (Microsoft Visual C++)
     - Windows SDK
     - CMake tools
   
4. **Install:**
   - Click "Install"
   - Size: ~6-8 GB
   - Time: 10-20 minutes

5. **Restart:**
   - Restart your computer after installation

---

### **Option 2: Install Full Visual Studio (Alternative)**

If you want the full IDE:

1. **Download Visual Studio Community 2022** (Free)
   - https://visualstudio.microsoft.com/vs/community/

2. **During installation, select:**
   - ✅ Desktop development with C++
   - ✅ .NET desktop development (optional)

3. **Install and restart**

---

## 🔄 **After Installation**

### **Step 1: Verify Installation**

Open PowerShell and run:

```powershell
# Check if MSVC is installed
where link.exe
```

**Expected output:**
```
C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\...\bin\Hostx64\x64\link.exe
```

---

### **Step 2: Retry Build**

```powershell
cd "D:\Vs Code\Lumen"
npm run tauri:build
```

---

## 🚀 **Alternative: Use Rust GNU Target (No Build Tools Needed)**

If you don't want to install Build Tools, you can use the GNU toolchain:

### **Step 1: Install GNU Toolchain**

```powershell
# Install MSYS2
winget install MSYS2.MSYS2
```

### **Step 2: Install MinGW**

Open MSYS2 terminal and run:

```bash
pacman -S mingw-w64-x86_64-toolchain
```

### **Step 3: Switch Rust Target**

```powershell
# Add GNU target
rustup target add x86_64-pc-windows-gnu

# Set as default
rustup default stable-x86_64-pc-windows-gnu
```

### **Step 4: Build**

```powershell
npm run tauri:build -- --target x86_64-pc-windows-gnu
```

---

## 📋 **Quick Checklist**

Before building, make sure you have:

- ✅ **Node.js** (v16+) - `node --version`
- ✅ **Rust** - `rustc --version`
- ✅ **MSVC Build Tools** OR **MinGW-w64**
- ✅ **Windows SDK**

---

## 🎯 **Recommended Path**

**For beginners:** Install Visual Studio Build Tools (Option 1)
- ✅ Official Microsoft toolchain
- ✅ Best compatibility
- ✅ Most apps use this

**For advanced users:** Use GNU toolchain (Option 2)
- ✅ Smaller download
- ✅ Faster compile times
- ✅ Cross-platform compatible

---

## 🆘 **Still Having Issues?**

### **Error: "Rust not found"**

```powershell
# Install Rust
winget install Rustlang.Rust.MSVC
```

### **Error: "Node not found"**

```powershell
# Install Node.js
winget install OpenJS.NodeJS
```

### **Error: "Windows SDK not found"**

Reinstall Build Tools and ensure "Windows 10/11 SDK" is checked.

---

## ⏱️ **Installation Time Estimate**

- Download Build Tools: ~5 minutes
- Install Build Tools: ~15 minutes
- First Rust/Tauri build: ~5 minutes
- **Total:** ~25 minutes

---

## 💾 **Disk Space Required**

- Visual Studio Build Tools: ~6-8 GB
- Rust toolchain: ~2 GB
- Node modules: ~500 MB
- Build artifacts: ~500 MB
- **Total:** ~9-11 GB

---

Once installed, run:

```powershell
npm run tauri:build
```

And your Windows `.exe` installer will be created! 🎉

---

*Need help? Check: https://tauri.app/v1/guides/getting-started/prerequisites/*
