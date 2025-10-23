const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let browserView;
let currentPartition = 'persist:lumen-default'; // default persisted profile partition
let sidebarCollapsed = false; // reflects vertical tabs collapsed state from renderer
const viewHistory = [];
let currentHistoryIndex = -1;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'src-tauri/icons/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: true
    },
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
    show: false
  });

  // Create BrowserView for actual web browsing
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      partition: currentPartition
    }
  });

  mainWindow.setBrowserView(browserView);
  console.log('✅ BrowserView created and attached');
  
  // Position browser view below the toolbar (adjust based on your UI)
  const updateBounds = () => {
    const { width, height } = mainWindow.getContentBounds();
    const xOffset = sidebarCollapsed ? 0 : 72; // 0 when rail collapsed, 72 when expanded
    const yOffset = 78; // top chrome height (topbar + navbar)
    browserView.setBounds({
      x: xOffset,
      y: yOffset,
      width: Math.max(0, width - xOffset),
      height: Math.max(0, height - yOffset)
    });
    console.log(`📐 BrowserView bounds updated: ${width - xOffset}x${height - yOffset} (x=${xOffset}, y=${yOffset})`);
  };

  updateBounds();
  
  mainWindow.on('resize', updateBounds);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Lumen Browser window shown');
  });

  // Load the UI
  const distPath = path.join(__dirname, 'dist', 'index.html');
  const devPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(distPath)) {
    console.log('📂 Loading from dist:', distPath);
    mainWindow.loadFile(distPath);
  } else if (fs.existsSync(devPath)) {
    console.log('📂 Loading from root:', devPath);
    mainWindow.loadFile(devPath);
  } else {
    console.error('❌ Could not find index.html');
  }

  // Debug: Log when content loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ UI loaded successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load UI:', errorCode, errorDescription);
  });

  // Helper to attach all webContents event listeners to a given BrowserView
  const attachViewEventHandlers = (view) => {
    // Send navigation updates to UI
    view.webContents.on('did-start-loading', () => {
      mainWindow.webContents.send('loading-start');
    });

    view.webContents.on('did-stop-loading', () => {
      mainWindow.webContents.send('loading-stop');
    });

    view.webContents.on('did-navigate', (event, url) => {
      mainWindow.webContents.send('url-changed', url);
    });

    view.webContents.on('did-navigate-in-page', (event, url) => {
      mainWindow.webContents.send('url-changed', url);
    });

    view.webContents.on('page-title-updated', (event, title) => {
      mainWindow.webContents.send('title-changed', title);
    });

    view.webContents.on('page-favicon-updated', (event, favicons) => {
      if (favicons && favicons.length > 0) {
        mainWindow.webContents.send('favicon-changed', favicons[0]);
      }
    });

    // Handle new windows inside same view
    view.webContents.setWindowOpenHandler(({ url }) => {
      navigateTo(url);
      return { action: 'deny' };
    });
  };

  attachViewEventHandlers(browserView);

  // Handle navigation requests from UI
  ipcMain.on('navigate-to', (event, url) => {
    navigateTo(url);
  });

  // Handle back button
  ipcMain.on('go-back', () => {
    if (browserView.webContents.canGoBack()) {
      browserView.webContents.goBack();
    }
  });

  // Handle forward button
  ipcMain.on('go-forward', () => {
    if (browserView.webContents.canGoForward()) {
      browserView.webContents.goForward();
    }
  });

  // Handle reload
  ipcMain.on('reload-page', () => {
    browserView.webContents.reload();
  });

  // Handle stop
  ipcMain.on('stop-loading', () => {
    browserView.webContents.stop();
  });

  // Handle sidebar collapsed state changes from renderer to update BrowserView bounds
  ipcMain.on('sidebar-collapsed-changed', (event, isCollapsed) => {
    sidebarCollapsed = !!isCollapsed;
    updateBounds();
  });

  // Switch BrowserView when profile/guest mode changes
  const switchProfileSession = ({ profileId = 'default', guestMode = false } = {}) => {
    try {
      const oldView = browserView;
      const currentURL = oldView?.webContents.getURL();

      // Decide partition: persisted for standard profiles, in-memory for guest
      currentPartition = guestMode
        ? `guest-${Date.now()}` // in-memory (no 'persist:' prefix)
        : `persist:lumen-${profileId || 'default'}`;

      console.log(`👤 Switching profile session → partition: ${currentPartition}`);

      // Remove old view
      if (oldView) {
        try { mainWindow.removeBrowserView(oldView); } catch {}
      }

      // Create new view with updated partition
      browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true,
          partition: currentPartition
        }
      });

      // Attach and wire up events
      mainWindow.setBrowserView(browserView);
      attachViewEventHandlers(browserView);
      updateBounds();

      // Load last URL if available, else go home
      if (currentURL && /^https?:/i.test(currentURL)) {
        browserView.webContents.loadURL(currentURL);
      } else {
        browserView.webContents.loadURL('https://www.google.com');
      }

      // Destroy old view after switch
      if (oldView) {
        try { oldView.webContents.destroy(); } catch {}
      }
    } catch (err) {
      console.error('❌ Failed to switch profile session:', err);
    }
  };

  ipcMain.on('profile-changed', (event, payload) => {
    switchProfileSession(payload || {});
  });

  // Initial load
  console.log('🌐 Loading initial page: https://www.google.com');
  browserView.webContents.loadURL('https://www.google.com');
}

function navigateTo(url) {
  if (!url) return;
  
  console.log(`🔍 Navigate to: ${url}`);
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Check if it looks like a URL
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      // It's a search query
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
  }

  console.log(`✅ Loading: ${url}`);
  browserView.webContents.loadURL(url);
}

app.whenReady().then(() => {
  console.log('🚀 Electron app ready, creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  if (browserView) {
    mainWindow.removeBrowserView(browserView);
  }
});
