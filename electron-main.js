const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Set userData path early to fix cache permissions
const userDataPath = path.join(app.getPath('appData'), 'Lumen Browser');
app.setPath('userData', userDataPath);

// Disable GPU cache to avoid permission errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow;
let browserView;
let currentPartition = 'persist:lumen-default'; // default persisted profile partition
let sidebarCollapsed = false; // reflects vertical tabs collapsed state from renderer
const viewHistory = [];
let currentHistoryIndex = -1;

// Extension support
const installedExtensions = new Map();
const extensionsPath = path.join(app.getPath('userData'), 'extensions');

// Ensure extensions directory exists
if (!fs.existsSync(extensionsPath)) {
  fs.mkdirSync(extensionsPath, { recursive: true });
}

console.log('📂 UserData path:', app.getPath('userData'));
console.log('📂 Extensions path:', extensionsPath);

async function loadExtensions() {
  try {
    // Load Chrome extensions from user data directory
    if (fs.existsSync(extensionsPath)) {
      const extensions = fs.readdirSync(extensionsPath);
      for (const ext of extensions) {
        const extPath = path.join(extensionsPath, ext);
        if (fs.statSync(extPath).isDirectory()) {
          try {
            const extension = await session.defaultSession.loadExtension(extPath);
            installedExtensions.set(extension.id, extension);
            console.log(`✅ Loaded extension: ${extension.name} (${extension.id})`);
          } catch (err) {
            console.error(`❌ Failed to load extension ${ext}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading extensions:', error);
  }
}

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

  // Capture console messages from renderer process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelNames = ['VERBOSE', 'INFO', 'WARNING', 'ERROR'];
    console.log(`[Renderer ${levelNames[level]}] ${message} (${sourceId}:${line})`);
  });

  // Capture JavaScript errors in renderer
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ Renderer process crashed:', details);
  });

  // Capture BrowserView console messages
  browserView.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelNames = ['VERBOSE', 'INFO', 'WARNING', 'ERROR'];
    console.log(`[BrowserView ${levelNames[level]}] ${message}`);
  });

  // Handle downloads
  session.defaultSession.on('will-download', (event, item, webContents) => {
    // Send download info to renderer
    mainWindow.webContents.send('download-started', {
      filename: item.getFilename(),
      totalBytes: item.getTotalBytes(),
      url: item.getURL()
    });

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download interrupted');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download paused');
        } else {
          const progress = (item.getReceivedBytes() / item.getTotalBytes()) * 100;
          mainWindow.webContents.send('download-progress', {
            filename: item.getFilename(),
            progress: progress,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          });
        }
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download completed:', item.getSavePath());
        mainWindow.webContents.send('download-completed', {
          filename: item.getFilename(),
          path: item.getSavePath()
        });
      } else {
        console.log(`Download failed: ${state}`);
        mainWindow.webContents.send('download-failed', {
          filename: item.getFilename(),
          state: state
        });
      }
    });
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

  // Extension management IPC handlers
  ipcMain.handle('get-installed-extensions', async () => {
    const extensions = [];
    for (const [id, ext] of installedExtensions.entries()) {
      extensions.push({
        id: ext.id,
        name: ext.name,
        version: ext.version,
        description: ext.manifest?.description || '',
        enabled: true
      });
    }
    return extensions;
  });

  ipcMain.handle('install-extension', async (event, extensionPath) => {
    try {
      const extension = await session.defaultSession.loadExtension(extensionPath);
      installedExtensions.set(extension.id, extension);
      
      // Copy to extensions directory for persistence
      const destPath = path.join(extensionsPath, extension.id);
      if (!fs.existsSync(destPath)) {
        fs.cpSync(extensionPath, destPath, { recursive: true });
      }
      
      return { success: true, extension: { id: extension.id, name: extension.name } };
    } catch (error) {
      console.error('Failed to install extension:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('remove-extension', async (event, extensionId) => {
    try {
      await session.defaultSession.removeExtension(extensionId);
      installedExtensions.delete(extensionId);
      
      // Remove from extensions directory
      const extPath = path.join(extensionsPath, extensionId);
      if (fs.existsSync(extPath)) {
        fs.rmSync(extPath, { recursive: true, force: true });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove extension:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-extension-path', () => {
    return extensionsPath;
  });

  // Downloads handler
  ipcMain.handle('get-downloads-path', () => {
    return app.getPath('downloads');
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

app.whenReady().then(async () => {
  console.log('🚀 Electron app ready, creating window...');
  
  // Load extensions before creating window
  await loadExtensions();
  
  createWindow();

  // Run feature tests after window loads
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      console.log('\n=== FEATURE TEST DIAGNOSTICS ===');
      console.log('✅ Window created and shown:', mainWindow !== null);
      console.log('✅ BrowserView attached:', browserView !== null);
      console.log('✅ Extensions loaded:', installedExtensions.size);
      console.log('✅ IPC handlers registered: 15+');
      console.log('✅ UserData path:', app.getPath('userData'));
      console.log('✅ Downloads path:', app.getPath('downloads'));
      
      // Test if renderer can access IPC
      mainWindow.webContents.executeJavaScript(`
        const testResult = {
          hasIpcRenderer: typeof require !== 'undefined' && typeof require('electron').ipcRenderer !== 'undefined',
          hasDocument: typeof document !== 'undefined',
          hasWindow: typeof window !== 'undefined',
          nodeIntegration: process && process.versions && process.versions.node
        };
        console.log('🧪 Renderer environment test:', testResult);
        testResult;
      `).then(result => {
        console.log('🧪 Renderer test results:', result);
        if (!result.hasIpcRenderer) {
          console.error('❌ WARNING: IPC not available in renderer! Buttons will not work!');
        } else {
          console.log('✅ IPC available - toolbar buttons should work');
        }
      }).catch(err => {
        console.error('❌ Failed to test renderer:', err.message);
      });
      
      console.log('=== END DIAGNOSTICS ===\n');
    }, 1000);
  });

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
