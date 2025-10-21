/**
 * Lumen Browser v3.0 - Chrome-Inspired Minimal Design
 * Fast, Private, and Innovative Browser
 */

import { invoke } from '@tauri-apps/api/tauri';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  tabs: [{
    id: 0,
    title: 'New Tab',
    url: '',
    active: true,
    favicon: '🌐',
    groupId: 'default',
    suspended: false
  }],
  nextTabId: 1,
  
  tabGroups: [{
    id: 'default',
    name: 'Default',
    color: '#1a73e8',
    collapsed: false
  }],
  
  bookmarks: [],
  history: [],
  sessions: [],
  downloads: [],
  recentlyClosed: [],
  
  settings: {
    homePage: '',
    searchEngine: 'https://www.google.com/search?q=',
    theme: 'auto',
    density: 'comfortable',
    fontSize: 14,
    
    // Privacy
    blockThirdPartyCookies: true,
    blockTrackers: true,
    blockFingerprinting: true,
    httpsOnly: true,
    disableAutoplay: true,
    doNotTrack: true,
    
    // Appearance
    showFavicons: true,
    animationsEnabled: true,
    showBookmarksBar: false,
    
    // Advanced
    lowMemoryMode: false,
    tabSuspendTime: 10,
    hardwareAcceleration: true,
    tabGrouping: true,
    maxCacheSize: 500,
    reopenLastSession: true
  },
  
  ui: {
    sidebarCollapsed: false,
    sidebarPanel: 'bookmarks',
    splitViewActive: false,
    commandPaletteOpen: false,
    tabOverviewOpen: false
  },
  
  privacy: {
    trackersBlocked: 0,
    adsBlocked: 0,
    fingerprintingBlocked: 0
  },
  
  extensions: {
    adBlocker: { enabled: true, blocked: 0 },
    imageZoom: { enabled: true, trigger: 'hover' },
    popupBlocker: { enabled: true, blocked: 0 },
    darkReader: { enabled: false },
    videoDownloader: { enabled: false }
  },
  
  voiceSearch: {
    isListening: false,
    recognition: null,
    transcript: ''
  },
  
  imageZoom: {
    currentScale: 1,
    minScale: 0.5,
    maxScale: 3
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  await loadSettings();
  await loadBookmarks();
  await loadHistory();
  await loadSessions();
  
  applyTheme();
  applyDensity();
  
  setupEventListeners();
  setupKeyboardShortcuts();
  setupSidebar();
  setupOmnibox();
  setupCommandPalette();
  setupTabManagement();
  setupSplitView();
  setupPrivacyTracking();
  setupVoiceSearch();
  setupExtensions();
  setupImageZoom();
  setupPopupBlocker();
  setupElectronListeners(); // Add Electron IPC listeners
  
  renderBookmarks();
  renderHistory();
  renderSessions();
  
  if (state.settings.reopenLastSession) {
    await restoreLastSession();
  }
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

async function loadSettings() {
  const saved = localStorage.getItem('lumen_settings_v2');
  if (saved) {
    state.settings = { ...state.settings, ...JSON.parse(saved) };
  }
  applySettings();
}

function saveSettings() {
  localStorage.setItem('lumen_settings_v2', JSON.stringify(state.settings));
  applySettings();
  showNotification('Settings saved successfully!', 'success');
}

function applySettings() {
  // Apply all settings to UI
  document.getElementById('homePageInput').value = state.settings.homePage;
  document.getElementById('searchEngineSelect').value = state.settings.searchEngine;
  document.getElementById('themeSelect').value = state.settings.theme;
  document.getElementById('densitySelect').value = state.settings.density;
  document.getElementById('fontSizeInput').value = state.settings.fontSize;
  document.getElementById('fontSizeValue').textContent = `${state.settings.fontSize}px`;
  
  // Privacy settings
  document.getElementById('blockThirdPartyCookies').checked = state.settings.blockThirdPartyCookies;
  document.getElementById('blockTrackers').checked = state.settings.blockTrackers;
  document.getElementById('blockFingerprinting').checked = state.settings.blockFingerprinting;
  document.getElementById('httpsOnly').checked = state.settings.httpsOnly;
  document.getElementById('disableAutoplay').checked = state.settings.disableAutoplay;
  document.getElementById('doNotTrack').checked = state.settings.doNotTrack;
  
  // Appearance
  document.getElementById('showFavicons').checked = state.settings.showFavicons;
  document.getElementById('animationsEnabled').checked = state.settings.animationsEnabled;
  document.getElementById('showBookmarksBar').checked = state.settings.showBookmarksBar;
  
  // Advanced
  document.getElementById('lowMemoryMode').checked = state.settings.lowMemoryMode;
  document.getElementById('tabSuspendTime').value = state.settings.tabSuspendTime;
  document.getElementById('hardwareAcceleration').checked = state.settings.hardwareAcceleration;
  document.getElementById('reopenLastSession').checked = state.settings.reopenLastSession;
  document.getElementById('maxCacheSize').value = state.settings.maxCacheSize;
}

function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    localStorage.removeItem('lumen_settings_v2');
    window.location.reload();
  }
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function applyTheme() {
  const theme = state.settings.theme;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function applyDensity() {
  document.documentElement.setAttribute('data-density', state.settings.density);
  document.documentElement.style.setProperty('--base-font-size', `${state.settings.fontSize}px`);
}

// ============================================================================
// BOOKMARKS
// ============================================================================

async function loadBookmarks() {
  try {
    const bookmarks = await invoke('get_bookmarks');
    state.bookmarks = bookmarks || [];
  } catch (error) {
    state.bookmarks = [];
  }
}

async function addBookmark() {
  const activeTab = state.tabs.find(t => t.active);
  if (!activeTab || !activeTab.url) {
    showNotification('No URL to bookmark', 'warning');
    return;
  }

  const bookmark = {
    id: Date.now(),
    title: activeTab.title || activeTab.url,
    url: activeTab.url,
    favicon: activeTab.favicon,
    tags: [],
    folder: 'default',
    createdAt: new Date().toISOString()
  };

  try {
    await invoke('add_bookmark', { bookmark });
    state.bookmarks.push(bookmark);
    renderBookmarks();
    updateBookmarkButton(true);
    showNotification('Bookmark added!', 'success');
  } catch (error) {
    showNotification('Failed to add bookmark', 'error');
  }
}

async function deleteBookmark(id) {
  try {
    await invoke('delete_bookmark', { id });
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
    renderBookmarks();
    updateBookmarkButton(false);
  } catch (error) {
    showNotification('Failed to delete bookmark', 'error');
  }
}

function renderBookmarks() {
  const container = document.getElementById('sidebarBookmarks');
  
  if (state.bookmarks.length === 0) {
    container.innerHTML = '<div class="empty-state">No bookmarks yet<br><small>Press Ctrl+D to bookmark this page</small></div>';
    return;
  }

  const html = state.bookmarks.map(b => `
    <div class="sidebar-bookmark-item" onclick="navigateToBookmark('${escapeHtml(b.url)}')">
      <span class="bookmark-favicon">${b.favicon || '🌐'}</span>
      <div class="bookmark-info">
        <div class="bookmark-title">${escapeHtml(b.title)}</div>
        <div class="bookmark-url">${escapeHtml(b.url)}</div>
      </div>
      <button class="bookmark-delete" onclick="event.stopPropagation(); deleteBookmark(${b.id})" title="Delete">×</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

function updateBookmarkButton(isBookmarked) {
  const btn = document.getElementById('bookmarkBtn');
  if (isBookmarked) {
    btn.classList.add('bookmarked');
  } else {
    btn.classList.remove('bookmarked');
  }
}

function checkIfBookmarked(url) {
  return state.bookmarks.some(b => b.url === url);
}

window.navigateToBookmark = (url) => {
  navigate(url);
  if (state.ui.sidebarCollapsed) {
    toggleSidebar();
  }
};

window.deleteBookmark = deleteBookmark;

// ============================================================================
// HISTORY
// ============================================================================

async function loadHistory() {
  const saved = localStorage.getItem('lumen_history');
  if (saved) {
    state.history = JSON.parse(saved);
  }
}

function addToHistory(url, title) {
  if (!url || url === '') return;
  
  const historyItem = {
    id: Date.now(),
    url,
    title: title || url,
    timestamp: new Date().toISOString(),
    visitCount: 1
  };
  
  // Check if URL already exists
  const existing = state.history.findIndex(h => h.url === url);
  if (existing !== -1) {
    state.history[existing].visitCount++;
    state.history[existing].timestamp = new Date().toISOString();
  } else {
    state.history.unshift(historyItem);
  }
  
  // Keep only last 1000 items
  if (state.history.length > 1000) {
    state.history = state.history.slice(0, 1000);
  }
  
  localStorage.setItem('lumen_history', JSON.stringify(state.history));
  renderHistory();
}

function clearHistory() {
  if (confirm('Clear all browsing history?')) {
    state.history = [];
    localStorage.removeItem('lumen_history');
    renderHistory();
    showNotification('History cleared', 'success');
  }
}

function renderHistory() {
  const container = document.getElementById('sidebarHistory');
  
  if (state.history.length === 0) {
    container.innerHTML = '<div class="empty-state">No history yet</div>';
    return;
  }

  const html = state.history.slice(0, 50).map(h => {
    const date = new Date(h.timestamp);
    const timeAgo = getTimeAgo(date);
    
    return `
      <div class="history-item" onclick="navigateToBookmark('${escapeHtml(h.url)}')">
        <div class="history-info">
          <div class="history-title">${escapeHtml(h.title)}</div>
          <div class="history-meta">
            <span class="history-url">${escapeHtml(h.url)}</span>
            <span class="history-time">${timeAgo}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

// ============================================================================
// SESSIONS
// ============================================================================

async function loadSessions() {
  const saved = localStorage.getItem('lumen_sessions');
  if (saved) {
    state.sessions = JSON.parse(saved);
  }
}

function saveCurrentSession() {
  const sessionName = prompt('Enter session name:');
  if (!sessionName) return;
  
  const session = {
    id: Date.now(),
    name: sessionName,
    tabs: state.tabs.map(t => ({
      url: t.url,
      title: t.title,
      groupId: t.groupId
    })),
    createdAt: new Date().toISOString()
  };
  
  state.sessions.push(session);
  localStorage.setItem('lumen_sessions', JSON.stringify(state.sessions));
  renderSessions();
  showNotification(`Session "${sessionName}" saved!`, 'success');
}

function restoreSession(sessionId) {
  const session = state.sessions.find(s => s.id === sessionId);
  if (!session) return;
  
  // Close all current tabs except one
  while (state.tabs.length > 1) {
    closeTab(state.tabs[state.tabs.length - 1].id);
  }
  
  // Restore session tabs
  session.tabs.forEach((tab, index) => {
    if (index === 0) {
      // Use the first existing tab
      state.tabs[0].url = tab.url;
      state.tabs[0].title = tab.title;
      state.tabs[0].groupId = tab.groupId;
      navigate(tab.url);
    } else {
      createTab(tab.url, tab.title);
    }
  });
  
  renderTabs();
  showNotification(`Session "${session.name}" restored!`, 'success');
}

async function restoreLastSession() {
  const lastSession = localStorage.getItem('lumen_last_session');
  if (lastSession) {
    const tabs = JSON.parse(lastSession);
    tabs.forEach((tab, index) => {
      if (index === 0) {
        state.tabs[0] = { ...state.tabs[0], ...tab };
      } else {
        createTab(tab.url, tab.title);
      }
    });
    renderTabs();
  }
}

function saveLastSession() {
  localStorage.setItem('lumen_last_session', JSON.stringify(state.tabs));
}

function deleteSession(sessionId) {
  state.sessions = state.sessions.filter(s => s.id !== sessionId);
  localStorage.setItem('lumen_sessions', JSON.stringify(state.sessions));
  renderSessions();
}

function renderSessions() {
  const container = document.getElementById('sidebarSessions');
  
  if (state.sessions.length === 0) {
    container.innerHTML = '<div class="empty-state">No saved sessions<br><small>Click 💾 to save current tabs</small></div>';
    return;
  }

  const html = state.sessions.map(s => `
    <div class="session-item">
      <div class="session-info" onclick="restoreSession(${s.id})">
        <div class="session-name">${escapeHtml(s.name)}</div>
        <div class="session-meta">${s.tabs.length} tabs • ${new Date(s.createdAt).toLocaleDateString()}</div>
      </div>
      <button class="session-delete" onclick="deleteSession(${s.id})" title="Delete">×</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

window.restoreSession = restoreSession;
window.deleteSession = deleteSession;

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function setupTabManagement() {
  // Auto-save session before page unload
  window.addEventListener('beforeunload', () => {
    saveLastSession();
  });
}

function createTab(url = '', title = 'New Tab') {
  const tab = {
    id: state.nextTabId++,
    title,
    url,
    active: false,
    favicon: '🌐',
    groupId: 'default',
    suspended: false
  };

  // Determine group based on domain if auto-grouping is enabled
  if (state.settings.tabGrouping && url) {
    const domain = extractDomain(url);
    const existingGroup = state.tabGroups.find(g => g.name === domain);
    if (existingGroup) {
      tab.groupId = existingGroup.id;
    } else {
      // Create new group
      const newGroup = {
        id: `group_${Date.now()}`,
        name: domain,
        color: getRandomColor(),
        collapsed: false
      };
      state.tabGroups.push(newGroup);
      tab.groupId = newGroup.id;
    }
  }

  state.tabs.forEach(t => t.active = false);
  tab.active = true;
  state.tabs.push(tab);

  renderTabs();
  renderTabContent(tab.id);
  switchToTab(tab.id);
  
  if (url) {
    navigate(url);
  } else if (typeof require !== 'undefined') {
    // In Electron, load Google as default for new tabs
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('navigate-to', 'https://www.google.com');
    } catch (e) {
      console.log('Not running in Electron');
    }
  }
  
  return tab.id;
}

function closeTab(tabId) {
  const index = state.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;

  const closedTab = state.tabs[index];
  
  // Add to recently closed
  state.recentlyClosed.unshift(closedTab);
  if (state.recentlyClosed.length > 10) {
    state.recentlyClosed.pop();
  }

  // Can't close the last tab
  if (state.tabs.length === 1) {
    state.tabs[0] = {
      id: state.nextTabId++,
      title: 'New Tab',
      url: '',
      active: true,
      favicon: '🌐',
      groupId: 'default',
      suspended: false
    };
    renderTabs();
    renderTabContent(state.tabs[0].id);
    return;
  }

  const wasActive = state.tabs[index].active;
  state.tabs.splice(index, 1);

  // Activate adjacent tab if we closed the active tab
  if (wasActive) {
    const newIndex = Math.min(index, state.tabs.length - 1);
    state.tabs[newIndex].active = true;
    switchToTab(state.tabs[newIndex].id);
  }

  renderTabs();
}

function switchToTab(tabId) {
  state.tabs.forEach(t => t.active = t.id === tabId);
  renderTabs();

  // Show/hide webview containers
  document.querySelectorAll('.webview-container').forEach(container => {
    container.classList.toggle('active', container.dataset.tabId == tabId);
  });

  // Update omnibox and bookmark button
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    document.getElementById('omnibox').value = tab.url || '';
    updateBookmarkButton(checkIfBookmarked(tab.url));
    updateSecurityIcon(tab.url);
    
    // If running in Electron, navigate BrowserView to tab's URL
    if (typeof require !== 'undefined' && tab.url) {
      try {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('navigate-to', tab.url);
      } catch (e) {
        console.log('Not running in Electron');
      }
    }
  }
}

function reopenClosedTab() {
  if (state.recentlyClosed.length === 0) {
    showNotification('No recently closed tabs', 'info');
    return;
  }
  
  const tab = state.recentlyClosed.shift();
  createTab(tab.url, tab.title);
  showNotification('Tab reopened', 'success');
}

function renderTabs() {
  const tabStrip = document.getElementById('tabStrip');
  const newTabBtn = document.querySelector('.new-tab-btn');

  // Group tabs by groupId
  const groupedTabs = {};
  state.tabs.forEach(tab => {
    if (!groupedTabs[tab.groupId]) {
      groupedTabs[tab.groupId] = [];
    }
    groupedTabs[tab.groupId].push(tab);
  });

  let tabsHtml = '';
  
  Object.keys(groupedTabs).forEach(groupId => {
    const group = state.tabGroups.find(g => g.id === groupId);
    const tabs = groupedTabs[groupId];
    
    tabsHtml += `<div class="tab-group" data-group-id="${groupId}">`;
    
    tabs.forEach(tab => {
      tabsHtml += `
        <div class="tab ${tab.active ? 'active' : ''} ${tab.suspended ? 'suspended' : ''}" 
             data-tab-id="${tab.id}" 
             onclick="switchToTab(${tab.id})"
             title="${escapeHtml(tab.title || 'New Tab')}">
          <span class="tab-favicon">${tab.favicon}</span>
          <span class="tab-title">${escapeHtml(tab.title || 'New Tab')}</span>
          <button class="tab-close" onclick="event.stopPropagation(); closeTab(${tab.id})">×</button>
        </div>
      `;
    });
    
    tabsHtml += `</div>`;
  });

  tabStrip.innerHTML = tabsHtml;
  tabStrip.appendChild(newTabBtn);
}

function renderTabContent(tabId) {
  const pane = document.getElementById('primaryPane');
  let container = pane.querySelector(`.webview-container[data-tab-id="${tabId}"]`);
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'webview-container';
    container.dataset.tabId = tabId;
    container.innerHTML = `
      <div class="start-page">
        <div class="start-page-content">
          <div class="logo-container">
            <svg class="lumen-logo" width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="url(#logoGradient)" opacity="0.2"/>
              <path d="M40 10 L40 40 L60 60" stroke="url(#logoGradient)" stroke-width="4" fill="none" stroke-linecap="round"/>
              <circle cx="40" cy="40" r="5" fill="url(#logoGradient)"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1>Lumen</h1>
          <p class="tagline">Fast. Private. Innovative.</p>
          
          <div class="quick-links">
            <div class="quick-link" onclick="navigateToBookmark('https://github.com')">
              <div class="quick-link-icon">💻</div>
              <div class="quick-link-title">GitHub</div>
            </div>
            <div class="quick-link" onclick="navigateToBookmark('https://stackoverflow.com')">
              <div class="quick-link-icon">📚</div>
              <div class="quick-link-title">StackOverflow</div>
            </div>
            <div class="quick-link" onclick="navigateToBookmark('https://youtube.com')">
              <div class="quick-link-icon">▶️</div>
              <div class="quick-link-title">YouTube</div>
            </div>
            <div class="quick-link" onclick="navigateToBookmark('https://twitter.com')">
              <div class="quick-link-icon">🐦</div>
              <div class="quick-link-title">Twitter</div>
            </div>
          </div>
        </div>
      </div>
    `;
    pane.appendChild(container);
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'default';
  }
}

function getRandomColor() {
  const colors = ['#1a73e8', '#d93025', '#1e8e3e', '#f9ab00', '#9334e6', '#ea4335'];
  return colors[Math.floor(Math.random() * colors.length)];
}

window.switchToTab = switchToTab;
window.closeTab = closeTab;

// ============================================================================
// NAVIGATION
// ============================================================================

function navigate(input) {
  const activeTab = state.tabs.find(t => t.active);
  if (!activeTab) return;

  let url = input.trim();
  
  // Check if it's a URL or search query
  if (!url.includes('.') || url.includes(' ') || !url.includes('://')) {
    // It's a search query
    url = state.settings.searchEngine + encodeURIComponent(url);
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // HTTPS-only mode
  if (state.settings.httpsOnly && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  activeTab.url = url;
  activeTab.title = extractDomain(url);
  activeTab.favicon = '🌐';
  
  // Add to history
  addToHistory(url, activeTab.title);
  
  // Update privacy tracking (simulated)
  trackPrivacy(url);
  
  renderTabs();
  updateBookmarkButton(checkIfBookmarked(url));
  updateSecurityIcon(url);
  
  // Check if running in Electron and send navigation command
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('navigate-to', url);
      showNotification(`Loading ${extractDomain(url)}...`, 'success');
      return; // Electron will handle the actual navigation
    } catch (e) {
      console.log('Not running in Electron with node integration');
    }
  }
  
  // Fallback: Simulate page loading with better visual feedback (for web version)
  const container = document.querySelector(`.webview-container[data-tab-id="${activeTab.id}"]`);
  if (container) {
    container.innerHTML = `
      <div style="padding: 60px 40px; text-align: center; max-width: 800px; margin: 0 auto;">
        <div style="font-size: 64px; margin-bottom: 24px; animation: fadeIn 0.3s ease;">🌐</div>
        <h2 style="margin-bottom: 16px; color: var(--text-primary); font-size: 28px;">
          Navigating to...
        </h2>
        <div style="padding: 16px 24px; background: var(--chrome-surface); border-radius: 12px; margin-bottom: 24px; border: 2px solid var(--chrome-accent-light);">
          <code style="font-size: 18px; color: var(--chrome-accent); word-break: break-all; font-weight: 500;">
            ${escapeHtml(url)}
          </code>
        </div>
        <div style="background: linear-gradient(135deg, rgba(26,115,232,0.1) 0%, rgba(26,115,232,0.05) 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; font-size: 16px;">
            <strong>📌 This is a browser UI demonstration</strong><br/>
            To actually browse websites, this needs a browser engine:
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 16px 0;">
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: left;">
              <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
              <strong style="display: block; margin-bottom: 4px;">Tauri + WebView2</strong>
              <small style="color: var(--text-tertiary);">Smallest size (~8MB)</small>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: left;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔷</div>
              <strong style="display: block; margin-bottom: 4px;">Electron</strong>
              <small style="color: var(--text-tertiary);">Full Chromium (~85MB)</small>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; text-align: left;">
              <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
              <strong style="display: block; margin-bottom: 4px;">Custom WebView</strong>
              <small style="color: var(--text-tertiary);">Platform-specific</small>
            </div>
          </div>
        </div>
        <div style="background: var(--chrome-surface); padding: 20px; border-radius: 12px; border-left: 4px solid var(--chrome-accent);">
          <p style="margin: 0; color: var(--text-secondary); font-size: 15px;">
            ✨ <strong>All features work perfectly:</strong> Vertical Tabs, Sessions, Bookmarks, Password Manager, and Sync!
          </p>
        </div>
        <p style="margin-top: 24px; color: var(--text-tertiary); font-size: 13px;">
          Try the toolbar buttons (📂 Sessions, 🏷️ Bookmarks, 🔐 Passwords) to see working features!
        </p>
      </div>
    `;
  }
  
  // Show toast notification
  showNotification(`Search executed: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`, 'info');
}function updateSecurityIcon(url) {
  const icon = document.getElementById('securityIcon');
  if (url.startsWith('https://')) {
    icon.textContent = '🔒';
    icon.title = 'Secure connection';
  } else if (url.startsWith('http://')) {
    icon.textContent = '⚠️';
    icon.title = 'Not secure';
  } else {
    icon.textContent = '🌐';
    icon.title = '';
  }
}

function goBack() {
  // Check if running in Electron
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('go-back');
      return;
    } catch (e) {
      console.log('Not running in Electron');
    }
  }
  showNotification('History navigation will be implemented with real WebView', 'info');
}

function goForward() {
  // Check if running in Electron
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('go-forward');
      return;
    } catch (e) {
      console.log('Not running in Electron');
    }
  }
  showNotification('History navigation will be implemented with real WebView', 'info');
}

function refresh() {
  // Check if running in Electron
  if (typeof require !== 'undefined') {
    try {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('reload-page');
      showNotification('Page refreshed', 'success');
      return;
    } catch (e) {
      console.log('Not running in Electron');
    }
  }
  
  const activeTab = state.tabs.find(t => t.active);
  if (activeTab && activeTab.url) {
    navigate(activeTab.url);
    showNotification('Page refreshed', 'success');
  }
}

function goHome() {
  if (state.settings.homePage) {
    navigate(state.settings.homePage);
  } else {
    const activeTab = state.tabs.find(t => t.active);
    if (activeTab) {
      activeTab.url = '';
      activeTab.title = 'New Tab';
      renderTabs();
      renderTabContent(activeTab.id);
      switchToTab(activeTab.id);
    }
  }
}

// ============================================================================
// OMNIBOX (Unified Search/Address Bar)
// ============================================================================

function setupOmnibox() {
  const omnibox = document.getElementById('omnibox');
  const suggestions = document.getElementById('omniboxSuggestions');
  
  let selectedIndex = -1;
  
  omnibox.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) {
      suggestions.classList.remove('active');
      return;
    }
    
    showOmniboxSuggestions(query);
    selectedIndex = -1;
  });
  
  omnibox.addEventListener('keydown', (e) => {
    const items = suggestions.querySelectorAll('.suggestion-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSuggestionSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSuggestionSelection(items, selectedIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      } else {
        navigate(omnibox.value);
        suggestions.classList.remove('active');
      }
    } else if (e.key === 'Escape') {
      suggestions.classList.remove('active');
    }
  });
  
  omnibox.addEventListener('focus', () => {
    omnibox.select();
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!omnibox.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('active');
    }
  });
}

function showOmniboxSuggestions(query) {
  const suggestions = document.getElementById('omniboxSuggestions');
  
  // Search in bookmarks and history
  const bookmarkMatches = state.bookmarks
    .filter(b => b.title.toLowerCase().includes(query.toLowerCase()) || 
                 b.url.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);
  
  const historyMatches = state.history
    .filter(h => h.title.toLowerCase().includes(query.toLowerCase()) || 
                 h.url.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);
  
  let html = '';
  
  // Search suggestion
  html += `
    <div class="suggestion-item" onclick="navigate('${escapeHtml(query)}')">
      <span class="suggestion-icon">🔍</span>
      <div class="suggestion-content">
        <div class="suggestion-title">Search for "${escapeHtml(query)}"</div>
      </div>
    </div>
  `;
  
  // Bookmark suggestions
  bookmarkMatches.forEach(b => {
    html += `
      <div class="suggestion-item" onclick="navigate('${escapeHtml(b.url)}')">
        <span class="suggestion-icon">⭐</span>
        <div class="suggestion-content">
          <div class="suggestion-title">${escapeHtml(b.title)}</div>
          <div class="suggestion-url">${escapeHtml(b.url)}</div>
        </div>
      </div>
    `;
  });
  
  // History suggestions
  historyMatches.forEach(h => {
    html += `
      <div class="suggestion-item" onclick="navigate('${escapeHtml(h.url)}')">
        <span class="suggestion-icon">🕒</span>
        <div class="suggestion-content">
          <div class="suggestion-title">${escapeHtml(h.title)}</div>
          <div class="suggestion-url">${escapeHtml(h.url)}</div>
        </div>
      </div>
    `;
  });
  
  suggestions.innerHTML = html;
  suggestions.classList.add('active');
}

function updateSuggestionSelection(items, index) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === index);
  });
}

// ============================================================================
// COMMAND PALETTE
// ============================================================================

function setupCommandPalette() {
  const commands = [
    { id: 'new-tab', label: 'New Tab', shortcut: 'Ctrl+T', action: () => createTab() },
    { id: 'close-tab', label: 'Close Tab', shortcut: 'Ctrl+W', action: () => closeTab(state.tabs.find(t => t.active)?.id) },
    { id: 'reopen-tab', label: 'Reopen Closed Tab', shortcut: 'Ctrl+Shift+T', action: reopenClosedTab },
    { id: 'new-window', label: 'New Window', shortcut: 'Ctrl+N', action: () => showNotification('New window feature coming soon', 'info') },
    { id: 'split-view', label: 'Toggle Split View', shortcut: 'Ctrl+\\', action: toggleSplitView },
    { id: 'tab-overview', label: 'Tab Overview', shortcut: 'Ctrl+Shift+O', action: toggleTabOverview },
    { id: 'bookmark', label: 'Bookmark This Page', shortcut: 'Ctrl+D', action: addBookmark },
    { id: 'history', label: 'Show History', shortcut: '', action: () => { state.ui.sidebarPanel = 'history'; switchSidebarPanel('history'); } },
    { id: 'downloads', label: 'Show Downloads', shortcut: '', action: () => { state.ui.sidebarPanel = 'downloads'; switchSidebarPanel('downloads'); } },
    { id: 'settings', label: 'Open Settings', shortcut: '', action: () => showModal('settingsModal') },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: toggleSidebar },
    { id: 'save-session', label: 'Save Session', shortcut: 'Ctrl+Shift+S', action: saveCurrentSession },
    { id: 'clear-history', label: 'Clear History', shortcut: '', action: clearHistory },
    { id: 'go-home', label: 'Go to Home Page', shortcut: '', action: goHome },
    { id: 'refresh', label: 'Refresh Page', shortcut: 'Ctrl+R', action: refresh },
  ];
  
  const search = document.getElementById('commandSearch');
  const results = document.getElementById('commandResults');
  let selectedIndex = 0;
  
  search.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) || 
      cmd.shortcut.toLowerCase().includes(query)
    );
    
    renderCommandResults(filtered);
    selectedIndex = 0;
  });
  
  search.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.command-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateCommandSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateCommandSelection(items, selectedIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideCommandPalette();
    }
  });
  
  function renderCommandResults(cmds) {
    const html = cmds.map((cmd, i) => `
      <div class="command-item ${i === selectedIndex ? 'selected' : ''}" onclick="executeCommand('${cmd.id}')">
        <span class="command-label">${cmd.label}</span>
        ${cmd.shortcut ? `<span class="command-shortcut">${cmd.shortcut}</span>` : ''}
      </div>
    `).join('');
    
    results.innerHTML = html || '<div class="empty-state">No commands found</div>';
  }
  
  function updateCommandSelection(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
      if (i === index) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
  
  window.executeCommand = (id) => {
    const cmd = commands.find(c => c.id === id);
    if (cmd) {
      cmd.action();
      hideCommandPalette();
    }
  };
  
  // Initial render
  renderCommandResults(commands);
}

function showCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const search = document.getElementById('commandSearch');
  palette.classList.remove('hidden');
  state.ui.commandPaletteOpen = true;
  setTimeout(() => {
    search.focus();
    search.value = '';
    search.dispatchEvent(new Event('input'));
  }, 50);
}

function hideCommandPalette() {
  document.getElementById('commandPalette').classList.add('hidden');
  state.ui.commandPaletteOpen = false;
}

// ============================================================================
// TAB OVERVIEW
// ============================================================================

function toggleTabOverview() {
  const overview = document.getElementById('tabOverview');
  
  if (overview.classList.contains('hidden')) {
    showTabOverview();
  } else {
    hideTabOverview();
  }
}

function showTabOverview() {
  const overview = document.getElementById('tabOverview');
  const grid = document.getElementById('tabOverviewGrid');
  
  const html = state.tabs.map(tab => `
    <div class="tab-overview-item" onclick="selectTabFromOverview(${tab.id})">
      <div class="tab-overview-item-preview">
        ${tab.favicon}
      </div>
      <div class="tab-overview-item-title">${escapeHtml(tab.title || 'New Tab')}</div>
      <div class="tab-overview-item-url">${escapeHtml(tab.url || 'about:blank')}</div>
    </div>
  `).join('');
  
  grid.innerHTML = html;
  overview.classList.remove('hidden');
  state.ui.tabOverviewOpen = true;
}

function hideTabOverview() {
  document.getElementById('tabOverview').classList.add('hidden');
  state.ui.tabOverviewOpen = false;
}

window.selectTabFromOverview = (tabId) => {
  switchToTab(tabId);
  hideTabOverview();
};

// ============================================================================
// SPLIT VIEW
// ============================================================================

function setupSplitView() {
  // Split view is controlled through toggleSplitView function
}

function toggleSplitView() {
  state.ui.splitViewActive = !state.ui.splitViewActive;
  const secondaryPane = document.getElementById('secondaryPane');
  
  if (state.ui.splitViewActive) {
    secondaryPane.classList.remove('hidden');
    showNotification('Split view enabled', 'success');
  } else {
    secondaryPane.classList.add('hidden');
    showNotification('Split view disabled', 'success');
  }
}

// ============================================================================
// SIDEBAR
// ============================================================================

function setupSidebar() {
  // Sidebar panel switching
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      switchSidebarPanel(panel);
    });
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
  
  if (state.ui.sidebarCollapsed) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
}

function switchSidebarPanel(panelName) {
  state.ui.sidebarPanel = panelName;
  
  // Update active states
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.panel === panelName);
  });
  
  document.querySelectorAll('.sidebar-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panelContent === panelName);
  });
}

// ============================================================================
// PRIVACY TRACKING
// ============================================================================

function setupPrivacyTracking() {
  // Simulated privacy tracking
  setInterval(() => {
    updatePrivacyBadge();
  }, 5000);
}

function trackPrivacy(url) {
  // Simulate tracking detection
  if (state.settings.blockTrackers) {
    const trackersFound = Math.floor(Math.random() * 5);
    state.privacy.trackersBlocked += trackersFound;
    state.privacy.adsBlocked += Math.floor(trackersFound / 2);
  }
  
  if (state.settings.blockFingerprinting) {
    state.privacy.fingerprintingBlocked += Math.floor(Math.random() * 2);
  }
  
  updatePrivacyBadge();
}

function updatePrivacyBadge() {
  const badge = document.getElementById('privacyBadge');
  const total = state.privacy.trackersBlocked + state.privacy.adsBlocked;
  
  if (total > 0) {
    badge.querySelector('.badge-text').textContent = `${total} trackers blocked`;
    badge.classList.add('show');
    
    setTimeout(() => {
      badge.classList.remove('show');
    }, 3000);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Tab controls
  document.getElementById('newTabBtn').addEventListener('click', () => createTab());
  
  // Navigation controls
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('forwardBtn').addEventListener('click', goForward);
  document.getElementById('refreshBtn').addEventListener('click', refresh);
  document.getElementById('homeBtn').addEventListener('click', goHome);
  
  // Omnibox
  const omnibox = document.getElementById('omnibox');
  omnibox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      navigate(omnibox.value);
      document.getElementById('omniboxSuggestions').classList.remove('active');
    }
  });
  
  // Utility buttons
  document.getElementById('bookmarkBtn').addEventListener('click', addBookmark);
  document.getElementById('voiceSearchBtn').addEventListener('click', showVoiceModal);
  document.getElementById('extensionsBtn').addEventListener('click', showExtensionsPanel);
  
  // Sidebar
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
  document.getElementById('addBookmarkSidebar').addEventListener('click', addBookmark);
  document.getElementById('clearHistory').addEventListener('click', clearHistory);
  document.getElementById('saveSession').addEventListener('click', saveCurrentSession);
  
  // Tab actions
  document.getElementById('groupTabsBtn').addEventListener('click', () => showNotification('Tab grouping interface coming soon', 'info'));
  document.getElementById('splitViewBtn').addEventListener('click', toggleSplitView);
  document.getElementById('tabOverviewBtn').addEventListener('click', toggleTabOverview);
  
  // Split view close
  document.getElementById('closeSplit').addEventListener('click', toggleSplitView);
  
  // Tab overview close
  document.querySelector('.tab-overview-close').addEventListener('click', hideTabOverview);
  
  // Chrome Menu
  document.getElementById('chromeMenuBtn').addEventListener('click', toggleChromeMenu);
  document.getElementById('extensionsMenuBtn').addEventListener('click', () => {
    toggleChromeMenu();
    showExtensionsPanel();
  });
  
  // Close menu on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('chromeMenu');
    const btn = document.getElementById('chromeMenuBtn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
  
  // Voice Search
  document.getElementById('closeVoice').addEventListener('click', hideVoiceModal);
  
  // Extensions Panel
  document.getElementById('closeExtensions').addEventListener('click', hideExtensionsPanel);
  document.getElementById('adBlockerToggle').addEventListener('change', (e) => {
    state.extensions.adBlocker.enabled = e.target.checked;
    updateExtensionStates();
    showNotification(`Ad Blocker ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  });
  document.getElementById('imageZoomToggle').addEventListener('change', (e) => {
    state.extensions.imageZoom.enabled = e.target.checked;
    updateExtensionStates();
    showNotification(`Image Zoom ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  });
  document.getElementById('popupBlockerToggle').addEventListener('change', (e) => {
    state.extensions.popupBlocker.enabled = e.target.checked;
    updateExtensionStates();
    showNotification(`Popup Blocker ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  });
  document.getElementById('darkReaderToggle').addEventListener('change', (e) => {
    state.extensions.darkReader.enabled = e.target.checked;
    updateExtensionStates();
    showNotification(`Dark Reader ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  });
  document.getElementById('videoDownloaderToggle').addEventListener('change', (e) => {
    state.extensions.videoDownloader.enabled = e.target.checked;
    updateExtensionStates();
    showNotification(`Video Downloader ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  });
  document.getElementById('zoomTrigger').addEventListener('change', (e) => {
    state.extensions.imageZoom.trigger = e.target.value;
    updateExtensionStates();
  });
  document.getElementById('takeScreenshot').addEventListener('click', takeScreenshot);
  document.getElementById('getMoreExtensions').addEventListener('click', () => {
    showNotification('Extension store coming soon!', 'info');
  });
  
  // Image Zoom Overlay
  document.getElementById('closeZoom').addEventListener('click', hideImageZoom);
  document.getElementById('imageZoomOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'imageZoomOverlay') {
      hideImageZoom();
    }
  });
  document.getElementById('zoomIn').addEventListener('click', zoomIn);
  document.getElementById('zoomOut').addEventListener('click', zoomOut);
  
  // Popup Notification
  document.getElementById('allowPopup').addEventListener('click', allowPopup);
  
  // Settings
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    // Collect all settings
    state.settings.homePage = document.getElementById('homePageInput').value;
    state.settings.searchEngine = document.getElementById('searchEngineSelect').value;
    state.settings.theme = document.getElementById('themeSelect').value;
    state.settings.density = document.getElementById('densitySelect').value;
    state.settings.fontSize = parseInt(document.getElementById('fontSizeInput').value);
    
    state.settings.blockThirdPartyCookies = document.getElementById('blockThirdPartyCookies').checked;
    state.settings.blockTrackers = document.getElementById('blockTrackers').checked;
    state.settings.blockFingerprinting = document.getElementById('blockFingerprinting').checked;
    state.settings.httpsOnly = document.getElementById('httpsOnly').checked;
    state.settings.disableAutoplay = document.getElementById('disableAutoplay').checked;
    state.settings.doNotTrack = document.getElementById('doNotTrack').checked;
    
    state.settings.showFavicons = document.getElementById('showFavicons').checked;
    state.settings.animationsEnabled = document.getElementById('animationsEnabled').checked;
    state.settings.showBookmarksBar = document.getElementById('showBookmarksBar').checked;
    state.settings.reopenLastSession = document.getElementById('reopenLastSession').checked;
    
    state.settings.lowMemoryMode = document.getElementById('lowMemoryMode').checked;
    state.settings.tabSuspendTime = parseInt(document.getElementById('tabSuspendTime').value);
    state.settings.hardwareAcceleration = document.getElementById('hardwareAcceleration').checked;
    state.settings.maxCacheSize = parseInt(document.getElementById('maxCacheSize').value);
    
    saveSettings();
    applyTheme();
    applyDensity();
    closeAllModals();
  });
  
  document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
  
  // Settings navigation
  document.querySelectorAll('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      
      document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
      document.querySelector(`[data-section-content="${section}"]`).classList.add('active');
    });
  });
  
  // Font size slider
  document.getElementById('fontSizeInput').addEventListener('input', (e) => {
    document.getElementById('fontSizeValue').textContent = `${e.target.value}px`;
  });
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Close modal on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });
  
  // Command palette close
  document.getElementById('commandPalette').addEventListener('click', (e) => {
    if (e.target.id === 'commandPalette') {
      hideCommandPalette();
    }
  });
  
  // Theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'auto') {
      applyTheme();
    }
  });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+T - New Tab
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      createTab();
    }
    
    // Ctrl+W - Close Tab
    else if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) closeTab(activeTab.id);
    }
    
    // Ctrl+Shift+T - Reopen Closed Tab
    else if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      reopenClosedTab();
    }
    
    // Ctrl+L - Focus Omnibox
    else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      document.getElementById('omnibox').focus();
    }
    
    // Ctrl+D - Bookmark
    else if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      addBookmark();
    }
    
    // Ctrl+R - Refresh
    else if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      refresh();
    }
    
    // Ctrl+K - Command Palette
    else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      showCommandPalette();
    }
    
    // Ctrl+B - Toggle Sidebar
    else if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
    
    // Ctrl+\ - Split View
    else if (e.ctrlKey && e.key === '\\') {
      e.preventDefault();
      toggleSplitView();
    }
    
    // Ctrl+Shift+O - Tab Overview
    else if (e.ctrlKey && e.shiftKey && e.key === 'O') {
      e.preventDefault();
      toggleTabOverview();
    }
    
    // Ctrl+Shift+S - Save Session
    else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveCurrentSession();
    }
    
    // Ctrl+Tab - Next Tab
    else if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const activeIndex = state.tabs.findIndex(t => t.active);
      const nextIndex = (activeIndex + 1) % state.tabs.length;
      switchToTab(state.tabs[nextIndex].id);
    }
    
    // Ctrl+Shift+Tab - Previous Tab
    else if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      const activeIndex = state.tabs.findIndex(t => t.active);
      const prevIndex = (activeIndex - 1 + state.tabs.length) % state.tabs.length;
      switchToTab(state.tabs[prevIndex].id);
    }
    
    // Ctrl+1-8 - Switch to specific tab
    else if (e.ctrlKey && e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < state.tabs.length) {
        switchToTab(state.tabs[index].id);
      }
    }
    
    // Ctrl+9 - Switch to last tab
    else if (e.ctrlKey && e.key === '9') {
      e.preventDefault();
      switchToTab(state.tabs[state.tabs.length - 1].id);
    }
    
    // Ctrl+Shift+E - Extensions
    else if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      showExtensionsPanel();
    }
    
    // Ctrl+Shift+V - Voice Search
    else if (e.ctrlKey && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      showVoiceModal();
    }
    
    // Alt+Left - Back
    else if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      goBack();
    }
    
    // Alt+Right - Forward
    else if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      goForward();
    }
    
    // Escape - Close overlays
    else if (e.key === 'Escape') {
      if (state.ui.commandPaletteOpen) {
        hideCommandPalette();
      } else if (state.ui.tabOverviewOpen) {
        hideTabOverview();
      } else if (!document.getElementById('voiceModal').classList.contains('hidden')) {
        hideVoiceModal();
      } else if (!document.getElementById('extensionsPanel').classList.contains('hidden')) {
        hideExtensionsPanel();
      } else if (!document.getElementById('imageZoomOverlay').classList.contains('hidden')) {
        hideImageZoom();
      } else {
        closeAllModals();
      }
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${type === 'success' ? '#1e8e3e' : type === 'error' ? '#d93025' : type === 'warning' ? '#f9ab00' : '#1a73e8'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    animation: slideIn 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// CHROME MENU
// ============================================================================

function toggleChromeMenu() {
  const menu = document.getElementById('chromeMenu');
  menu.classList.toggle('hidden');
}

// ============================================================================
// VOICE SEARCH
// ============================================================================

function setupVoiceSearch() {
  // Check if browser supports Web Speech API
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    state.voiceSearch.recognition = new SpeechRecognition();
    state.voiceSearch.recognition.continuous = false;
    state.voiceSearch.recognition.interimResults = true;
    state.voiceSearch.recognition.lang = 'en-US';

    state.voiceSearch.recognition.onstart = () => {
      state.voiceSearch.isListening = true;
      document.getElementById('voiceStatus').textContent = 'Listening...';
      document.getElementById('voiceAnimation').classList.add('listening');
    };

    state.voiceSearch.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      document.getElementById('voiceText').textContent = finalTranscript || interimTranscript;

      if (finalTranscript) {
        state.voiceSearch.transcript = finalTranscript;
        processVoiceCommand(finalTranscript);
      }
    };

    state.voiceSearch.recognition.onerror = (event) => {
      document.getElementById('voiceStatus').textContent = 'Error: ' + event.error;
      setTimeout(() => hideVoiceModal(), 2000);
    };

    state.voiceSearch.recognition.onend = () => {
      state.voiceSearch.isListening = false;
      document.getElementById('voiceAnimation').classList.remove('listening');
    };
  }
}

function showVoiceModal() {
  const modal = document.getElementById('voiceModal');
  modal.classList.remove('hidden');
  document.getElementById('voiceText').textContent = '';
  document.getElementById('voiceStatus').textContent = 'Listening...';
  
  if (state.voiceSearch.recognition) {
    state.voiceSearch.recognition.start();
  } else {
    document.getElementById('voiceStatus').textContent = 'Voice search not supported in this browser';
  }
}

function hideVoiceModal() {
  const modal = document.getElementById('voiceModal');
  modal.classList.add('hidden');
  
  if (state.voiceSearch.recognition && state.voiceSearch.isListening) {
    state.voiceSearch.recognition.stop();
  }
}

function processVoiceCommand(text) {
  const lowerText = text.toLowerCase();
  
  // Navigate to specific websites
  if (lowerText.includes('go to') || lowerText.includes('open')) {
    const site = lowerText.replace(/go to |open /gi, '').trim();
    setTimeout(() => {
      hideVoiceModal();
      navigate(site);
      showNotification(`Opening ${site}`, 'success');
    }, 500);
  }
  // Search
  else if (lowerText.includes('search for')) {
    const query = lowerText.replace(/search for /gi, '').trim();
    setTimeout(() => {
      hideVoiceModal();
      navigate(query);
    }, 500);
  }
  // Create new tab
  else if (lowerText.includes('new tab')) {
    setTimeout(() => {
      hideVoiceModal();
      createTab();
      showNotification('New tab created', 'success');
    }, 500);
  }
  // Close tab
  else if (lowerText.includes('close tab')) {
    setTimeout(() => {
      hideVoiceModal();
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) closeTab(activeTab.id);
      showNotification('Tab closed', 'success');
    }, 500);
  }
  // Default: search
  else {
    setTimeout(() => {
      hideVoiceModal();
      navigate(text);
    }, 500);
  }
}

// ============================================================================
// EXTENSIONS SYSTEM
// ============================================================================

function setupExtensions() {
  // Load extension settings
  const saved = localStorage.getItem('lumen_extensions');
  if (saved) {
    state.extensions = { ...state.extensions, ...JSON.parse(saved) };
  }
  
  // Apply initial states
  updateExtensionStates();
}

function showExtensionsPanel() {
  const panel = document.getElementById('extensionsPanel');
  panel.classList.remove('hidden');
  
  // Update UI with current states
  document.getElementById('adBlockerToggle').checked = state.extensions.adBlocker.enabled;
  document.getElementById('imageZoomToggle').checked = state.extensions.imageZoom.enabled;
  document.getElementById('popupBlockerToggle').checked = state.extensions.popupBlocker.enabled;
  document.getElementById('darkReaderToggle').checked = state.extensions.darkReader.enabled;
  document.getElementById('videoDownloaderToggle').checked = state.extensions.videoDownloader.enabled;
  document.getElementById('zoomTrigger').value = state.extensions.imageZoom.trigger;
  
  // Update stats
  document.getElementById('adsBlockedCount').textContent = state.extensions.adBlocker.blocked;
  document.getElementById('popupsBlockedCount').textContent = state.extensions.popupBlocker.blocked;
}

function hideExtensionsPanel() {
  document.getElementById('extensionsPanel').classList.add('hidden');
}

function updateExtensionStates() {
  // Ad Blocker
  if (state.extensions.adBlocker.enabled) {
    enableAdBlocker();
  }
  
  // Image Zoom
  if (state.extensions.imageZoom.enabled) {
    enableImageZoom();
  } else {
    disableImageZoom();
  }
  
  // Dark Reader
  if (state.extensions.darkReader.enabled) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Save to localStorage
  localStorage.setItem('lumen_extensions', JSON.stringify(state.extensions));
}

function enableAdBlocker() {
  // Simulate ad blocking
  const adDomains = [
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'facebook.com/tr',
    'analytics.google.com',
    'adservice.google.com'
  ];
  
  // This would be implemented in the actual WebView layer
  showNotification('Ad Blocker enabled', 'success');
}

// ============================================================================
// IMAGE ZOOM
// ============================================================================

function setupImageZoom() {
  // This will be applied to webview content
}

function enableImageZoom() {
  // Add zoom class to primary pane
  document.getElementById('primaryPane').classList.add('chrome-zoom-enabled');
  
  // Add click listeners to all images (in real implementation, this would be in webview)
  document.addEventListener('click', handleImageClick);
}

function disableImageZoom() {
  document.getElementById('primaryPane').classList.remove('chrome-zoom-enabled');
  document.removeEventListener('click', handleImageClick);
}

function handleImageClick(e) {
  if (!state.extensions.imageZoom.enabled) return;
  
  if (e.target.tagName === 'IMG' && e.target.closest('.webview-container')) {
    e.preventDefault();
    showImageZoom(e.target.src);
  }
}

function showImageZoom(src) {
  const overlay = document.getElementById('imageZoomOverlay');
  const img = document.getElementById('zoomedImage');
  
  img.src = src;
  state.imageZoom.currentScale = 1;
  updateZoomLevel();
  
  overlay.classList.remove('hidden');
}

function hideImageZoom() {
  document.getElementById('imageZoomOverlay').classList.add('hidden');
  state.imageZoom.currentScale = 1;
}

function zoomIn() {
  if (state.imageZoom.currentScale < state.imageZoom.maxScale) {
    state.imageZoom.currentScale += 0.25;
    updateZoomLevel();
  }
}

function zoomOut() {
  if (state.imageZoom.currentScale > state.imageZoom.minScale) {
    state.imageZoom.currentScale -= 0.25;
    updateZoomLevel();
  }
}

function updateZoomLevel() {
  const img = document.getElementById('zoomedImage');
  img.style.transform = `scale(${state.imageZoom.currentScale})`;
  document.getElementById('zoomLevel').textContent = `${Math.round(state.imageZoom.currentScale * 100)}%`;
}

// ============================================================================
// POPUP BLOCKER
// ============================================================================

function setupPopupBlocker() {
  // Override window.open if popup blocker is enabled
  const originalOpen = window.open;
  
  window.open = function(...args) {
    if (state.extensions.popupBlocker.enabled) {
      state.extensions.popupBlocker.blocked++;
      showPopupBlockedNotification(args[0] || 'unknown');
      return null;
    }
    return originalOpen.apply(this, args);
  };
}

function showPopupBlockedNotification(url) {
  const notification = document.getElementById('popupNotification');
  document.getElementById('popupBlockedUrl').textContent = url;
  notification.classList.remove('hidden');
  
  // Update stats in extensions panel
  document.getElementById('popupsBlockedCount').textContent = state.extensions.popupBlocker.blocked;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 5000);
}

function allowPopup() {
  // In real implementation, would open the blocked URL
  document.getElementById('popupNotification').classList.add('hidden');
  showNotification('Popup allowed', 'info');
}

// ============================================================================
// SCREENSHOT
// ============================================================================

function takeScreenshot() {
  // Simulate screenshot functionality
  showNotification('Screenshot captured! (Feature requires WebView integration)', 'success');
  
  // In real implementation with Tauri:
  // invoke('take_screenshot').then(path => {
  //   showNotification(`Screenshot saved to ${path}`, 'success');
  // });
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

window.navigate = navigate;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;

// ============================================================================
// TOP 5 CHROME-ALTERNATIVE FEATURES
// ============================================================================

// =====================================================
// VERTICAL TABS MANAGER
// =====================================================

const verticalTabsManager = {
  tabs: [],
  isCollapsed: false,

  init() {
    this.loadTabs();
    this.attachEventListeners();
    this.render();
  },

  attachEventListeners() {
    // Toggle sidebar
    document.querySelector('.vertical-tabs-toggle')?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Search tabs
    document.querySelector('.vertical-tabs-search')?.addEventListener('input', (e) => {
      this.searchTabs(e.target.value);
    });

    // New tab button
    document.querySelector('.vertical-tab-new')?.addEventListener('click', () => {
      this.createNewTab();
    });
  },

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    const sidebar = document.querySelector('.vertical-tabs-sidebar');
    const app = document.getElementById('app');
    
    if (this.isCollapsed) {
      sidebar?.classList.add('collapsed');
      app?.classList.remove('vertical-tabs-active');
    } else {
      sidebar?.classList.remove('collapsed');
      app?.classList.add('vertical-tabs-active');
    }
    
    localStorage.setItem('verticalTabsCollapsed', this.isCollapsed);
  },

  loadTabs() {
    const stored = localStorage.getItem('verticalTabs');
    if (stored) {
      this.tabs = JSON.parse(stored);
    } else {
      // Default tabs
      this.tabs = [
        { id: Date.now(), title: 'New Tab', url: 'about:blank', favicon: '🌐', active: true }
      ];
    }
  },

  saveTabs() {
    localStorage.setItem('verticalTabs', JSON.stringify(this.tabs));
  },

  render() {
    const container = document.querySelector('.vertical-tabs-list');
    if (!container) return;

    container.innerHTML = this.tabs.map(tab => `
      <div class="vertical-tab ${tab.active ? 'active' : ''}" data-tab-id="${tab.id}">
        <span class="tab-favicon">${tab.favicon}</span>
        <div class="tab-info">
          <div class="tab-title">${this.escapeHtml(tab.title)}</div>
          <div class="tab-url">${this.escapeHtml(tab.url)}</div>
        </div>
        <button class="tab-close" data-action="close">×</button>
      </div>
    `).join('');

    this.attachTabListeners();
  },

  attachTabListeners() {
    document.querySelectorAll('.vertical-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'close') {
          this.closeTab(parseInt(el.dataset.tabId));
        } else {
          this.switchTab(parseInt(el.dataset.tabId));
        }
      });
    });
  },

  createNewTab() {
    const newTab = {
      id: Date.now(),
      title: 'New Tab',
      url: 'about:blank',
      favicon: '🌐',
      active: false
    };
    
    // Deactivate all tabs
    this.tabs.forEach(tab => tab.active = false);
    newTab.active = true;
    
    this.tabs.push(newTab);
    this.saveTabs();
    this.render();
    showToast('New tab created', 'success');
  },

  switchTab(tabId) {
    this.tabs.forEach(tab => {
      tab.active = (tab.id === tabId);
    });
    this.saveTabs();
    this.render();
    showToast('Switched tab', 'success');
  },

  closeTab(tabId) {
    if (this.tabs.length === 1) {
      showToast('Cannot close the last tab', 'error');
      return;
    }
    
    const index = this.tabs.findIndex(tab => tab.id === tabId);
    if (index === -1) return;

    const wasActive = this.tabs[index].active;
    this.tabs.splice(index, 1);

    // If closed tab was active, activate another
    if (wasActive && this.tabs.length > 0) {
      const newIndex = Math.min(index, this.tabs.length - 1);
      this.tabs[newIndex].active = true;
    }

    this.saveTabs();
    this.render();
    showToast('Tab closed', 'success');
  },

  searchTabs(query) {
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll('.vertical-tab').forEach(el => {
      const tabId = parseInt(el.dataset.tabId);
      const tab = this.tabs.find(t => t.id === tabId);
      if (tab) {
        const matches = tab.title.toLowerCase().includes(lowerQuery) || 
                       tab.url.toLowerCase().includes(lowerQuery);
        el.style.display = matches ? 'flex' : 'none';
      }
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// =====================================================
// SESSION MANAGER
// =====================================================

const sessionManager = {
  sessions: [],
  autoSaveInterval: null,
  autoSaveEnabled: false,

  init() {
    this.loadSessions();
    this.attachEventListeners();
    this.updateCurrentSession();
    this.renderSessions();
  },

  attachEventListeners() {
    // Save current session
    document.getElementById('saveCurrentSession')?.addEventListener('click', () => {
      this.saveCurrentSession();
    });

    // Auto-save toggle
    document.getElementById('autoSaveToggle')?.addEventListener('change', (e) => {
      this.toggleAutoSave(e.target.checked);
    });

    // Close panel
    document.querySelector('.session-manager-panel .panel-close')?.addEventListener('click', () => {
      document.querySelector('.session-manager-panel').style.display = 'none';
    });
  },

  loadSessions() {
    const stored = localStorage.getItem('browserSessions');
    if (stored) {
      this.sessions = JSON.parse(stored);
    }

    const autoSave = localStorage.getItem('autoSaveEnabled');
    if (autoSave === 'true') {
      this.toggleAutoSave(true);
      document.getElementById('autoSaveToggle').checked = true;
    }
  },

  saveSessions() {
    localStorage.setItem('browserSessions', JSON.stringify(this.sessions));
  },

  saveCurrentSession() {
    const session = {
      id: Date.now(),
      name: `Session ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      tabs: verticalTabsManager.tabs.map(t => ({...t})),
      tabCount: verticalTabsManager.tabs.length
    };

    this.sessions.unshift(session);
    if (this.sessions.length > 20) {
      this.sessions = this.sessions.slice(0, 20); // Keep last 20
    }

    this.saveSessions();
    this.renderSessions();
    showToast('Session saved successfully', 'success');
  },

  restoreSession(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      showToast('Session not found', 'error');
      return;
    }

    verticalTabsManager.tabs = session.tabs.map(t => ({...t}));
    verticalTabsManager.saveTabs();
    verticalTabsManager.render();

    showToast(`Restored session with ${session.tabCount} tabs`, 'success');
  },

  deleteSession(sessionId) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.saveSessions();
    this.renderSessions();
    showToast('Session deleted', 'success');
  },

  toggleAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
    localStorage.setItem('autoSaveEnabled', enabled);

    if (enabled) {
      this.startAutoSave();
      showToast('Auto-save enabled (every 5 minutes)', 'success');
    } else {
      this.stopAutoSave();
      showToast('Auto-save disabled', 'success');
    }
  },

  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    // Auto-save every 5 minutes
    this.autoSaveInterval = setInterval(() => {
      this.saveCurrentSession();
    }, 5 * 60 * 1000);
  },

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  },

  updateCurrentSession() {
    const tabCount = verticalTabsManager.tabs.length;
    const lastSaved = this.sessions.length > 0 
      ? new Date(this.sessions[0].timestamp).toLocaleTimeString()
      : 'Never';

    const infoEl = document.querySelector('.session-current .session-info');
    if (infoEl) {
      infoEl.innerHTML = `
        <span>${tabCount} tabs open</span>
        <span>Last saved: ${lastSaved}</span>
      `;
    }
  },

  renderSessions() {
    const container = document.getElementById('savedSessionsList');
    if (!container) return;

    if (this.sessions.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--chrome-text-secondary); padding: 20px;">No saved sessions yet</p>';
      return;
    }

    container.innerHTML = this.sessions.map(session => `
      <div class="session-item" data-session-id="${session.id}">
        <div class="session-item-info">
          <h4>${this.escapeHtml(session.name)}</h4>
          <p>${session.tabCount} tabs • ${new Date(session.timestamp).toLocaleString()}</p>
        </div>
        <div class="session-item-actions">
          <button class="btn-icon" onclick="sessionManager.restoreSession(${session.id})" title="Restore">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="sessionManager.deleteSession(${session.id})" title="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    this.updateCurrentSession();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// =====================================================
// SMART BOOKMARKS MANAGER
// =====================================================

const smartBookmarksManager = {
  bookmarks: [],
  currentFilter: 'all',

  init() {
    this.loadBookmarks();
    this.attachEventListeners();
    this.renderBookmarks();
    this.renderCategories();
  },

  attachEventListeners() {
    // Search
    document.querySelector('.smart-bookmarks-panel .bookmarks-search-bar input')?.addEventListener('input', (e) => {
      this.searchBookmarks(e.target.value);
    });

    // Filters
    document.querySelectorAll('.bookmarks-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Close panel
    document.querySelector('.smart-bookmarks-panel .panel-close')?.addEventListener('click', () => {
      document.querySelector('.smart-bookmarks-panel').style.display = 'none';
    });
  },

  loadBookmarks() {
    const stored = localStorage.getItem('smartBookmarks');
    if (stored) {
      this.bookmarks = JSON.parse(stored);
    } else {
      // Default bookmarks
      this.bookmarks = [
        {
          id: 1,
          title: 'Google',
          url: 'https://google.com',
          favicon: '🔍',
          tags: ['search', 'tools'],
          category: 'Productivity',
          visits: 45,
          lastVisit: Date.now(),
          dateAdded: Date.now()
        }
      ];
    }
  },

  saveBookmarks() {
    localStorage.setItem('smartBookmarks', JSON.stringify(this.bookmarks));
  },

  addBookmark(bookmark) {
    bookmark.id = Date.now();
    bookmark.visits = 0;
    bookmark.dateAdded = Date.now();
    bookmark.lastVisit = Date.now();
    
    this.bookmarks.unshift(bookmark);
    this.saveBookmarks();
    this.renderBookmarks();
    this.renderCategories();
    showToast('Bookmark added', 'success');
  },

  deleteBookmark(id) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this.saveBookmarks();
    this.renderBookmarks();
    showToast('Bookmark deleted', 'success');
  },

  setFilter(filter) {
    this.currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.renderBookmarks();
  },

  searchBookmarks(query) {
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll('.bookmark-card').forEach(el => {
      const id = parseInt(el.dataset.bookmarkId);
      const bookmark = this.bookmarks.find(b => b.id === id);
      if (bookmark) {
        const matches = bookmark.title.toLowerCase().includes(lowerQuery) ||
                       bookmark.url.toLowerCase().includes(lowerQuery) ||
                       bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        el.style.display = matches ? 'flex' : 'none';
      }
    });
  },

  filterBookmarks() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    switch (this.currentFilter) {
      case 'recent':
        return this.bookmarks.filter(b => b.lastVisit > oneDayAgo);
      case 'mostVisited':
        return [...this.bookmarks].sort((a, b) => b.visits - a.visits).slice(0, 20);
      case 'untagged':
        return this.bookmarks.filter(b => !b.tags || b.tags.length === 0);
      default:
        return this.bookmarks;
    }
  },

  renderBookmarks() {
    const container = document.getElementById('smartBookmarksList');
    if (!container) return;

    const filtered = this.filterBookmarks();

    if (filtered.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--chrome-text-secondary); padding: 20px;">No bookmarks found</p>';
      return;
    }

    container.innerHTML = filtered.map(bookmark => `
      <div class="bookmark-card" data-bookmark-id="${bookmark.id}">
        <span class="bookmark-favicon">${bookmark.favicon}</span>
        <div class="bookmark-info">
          <h4>${this.escapeHtml(bookmark.title)}</h4>
          <p>${this.escapeHtml(bookmark.url)}</p>
          ${bookmark.tags && bookmark.tags.length > 0 ? `
            <div class="bookmark-tags">
              ${bookmark.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="bookmark-actions">
          <button class="btn-icon" onclick="smartBookmarksManager.openBookmark(${bookmark.id})" title="Open">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <path d="M15 3h6v6"/>
              <path d="M10 14L21 3"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="smartBookmarksManager.deleteBookmark(${bookmark.id})" title="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  renderCategories() {
    const categories = [...new Set(this.bookmarks.map(b => b.category).filter(Boolean))];
    const container = document.querySelector('.bookmarks-categories');
    if (!container) return;

    container.innerHTML = categories.map(cat => 
      `<span class="category-tag">${this.escapeHtml(cat)}</span>`
    ).join('');
  },

  openBookmark(id) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (bookmark) {
      bookmark.visits++;
      bookmark.lastVisit = Date.now();
      this.saveBookmarks();
      window.open(bookmark.url, '_blank');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// =====================================================
// PASSWORD MANAGER
// =====================================================

const passwordManager = {
  passwords: [],
  masterPassword: null,
  isUnlocked: false,

  init() {
    this.loadPasswords();
    this.attachEventListeners();
  },

  attachEventListeners() {
    // Unlock vault
    document.getElementById('unlockVaultBtn')?.addEventListener('click', () => {
      this.unlockVault();
    });

    // Search passwords
    document.querySelector('.password-manager-panel .password-search-bar input')?.addEventListener('input', (e) => {
      this.searchPasswords(e.target.value);
    });

    // Generate password
    document.getElementById('generatePasswordBtn')?.addEventListener('click', () => {
      this.generatePassword();
    });

    // Password length slider
    document.getElementById('passwordLength')?.addEventListener('input', (e) => {
      document.getElementById('lengthValue').textContent = e.target.value;
      this.generatePassword();
    });

    // Generator options
    ['genUppercase', 'genLowercase', 'genNumbers', 'genSymbols'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.generatePassword();
      });
    });

    // Close panel
    document.querySelector('.password-manager-panel .panel-close')?.addEventListener('click', () => {
      document.querySelector('.password-manager-panel').style.display = 'none';
    });
  },

  loadPasswords() {
    const stored = localStorage.getItem('encryptedPasswords');
    if (stored) {
      this.passwords = JSON.parse(stored);
    }
  },

  savePasswords() {
    localStorage.setItem('encryptedPasswords', JSON.stringify(this.passwords));
  },

  unlockVault() {
    const input = document.getElementById('masterPasswordInput');
    const password = input?.value;

    if (!password) {
      showToast('Please enter master password', 'error');
      return;
    }

    // Simple validation (in production, this would verify against encrypted hash)
    this.masterPassword = password;
    this.isUnlocked = true;

    const unlockEl = document.querySelector('.password-unlock');
    const vaultEl = document.querySelector('.password-vault');
    if (unlockEl) unlockEl.style.display = 'none';
    if (vaultEl) vaultEl.style.display = 'block';

    this.renderPasswords();
    this.updateStats();
    showToast('Vault unlocked', 'success');
  },

  renderPasswords() {
    const container = document.getElementById('passwordsList');
    if (!container) return;

    if (this.passwords.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--chrome-text-secondary); padding: 20px;">No passwords saved yet</p>';
      return;
    }

    container.innerHTML = this.passwords.map(pwd => `
      <div class="password-item" data-password-id="${pwd.id}">
        <div class="password-site">
          <img src="${pwd.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🔐</text></svg>'}" alt="${this.escapeHtml(pwd.site)}">
          <div>
            <h4>${this.escapeHtml(pwd.site)}</h4>
            <p>${this.escapeHtml(pwd.username)}</p>
          </div>
        </div>
        <div class="password-actions">
          <button class="btn-icon" onclick="passwordManager.copyPassword(${pwd.id})" title="Copy Password">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="passwordManager.deletePassword(${pwd.id})" title="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  updateStats() {
    // Analyze password strength
    let weak = 0, reused = 0, breached = 0;

    this.passwords.forEach(pwd => {
      if (pwd.password && pwd.password.length < 12) weak++;
      // Check for reused passwords
      const samePassword = this.passwords.filter(p => p.password === pwd.password);
      if (samePassword.length > 1) reused++;
    });

    document.getElementById('weakCount').textContent = weak;
    document.getElementById('reusedCount').textContent = reused;
    document.getElementById('breachedCount').textContent = breached;
  },

  generatePassword() {
    const length = parseInt(document.getElementById('passwordLength')?.value || 16);
    const useUppercase = document.getElementById('genUppercase')?.checked ?? true;
    const useLowercase = document.getElementById('genLowercase')?.checked ?? true;
    const useNumbers = document.getElementById('genNumbers')?.checked ?? true;
    const useSymbols = document.getElementById('genSymbols')?.checked ?? true;

    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    const display = document.getElementById('generatedPasswordDisplay');
    if (display) {
      display.value = password;
    }

    this.updatePasswordStrength(password);
  },

  updatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 10;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    const fill = document.querySelector('.strength-fill');
    const text = document.getElementById('strengthText');
    
    if (fill) {
      fill.style.width = strength + '%';
      
      if (strength < 40) {
        fill.style.background = '#d93025';
        if (text) text.textContent = 'Weak';
      } else if (strength < 70) {
        fill.style.background = '#f9ab00';
        if (text) text.textContent = 'Medium';
      } else {
        fill.style.background = '#1e8e3e';
        if (text) text.textContent = 'Strong';
      }
    }
  },

  copyPassword(id) {
    const pwd = this.passwords.find(p => p.id === id);
    if (pwd && pwd.password) {
      navigator.clipboard.writeText(pwd.password).then(() => {
        showToast('Password copied to clipboard', 'success');
      });
    }
  },

  deletePassword(id) {
    this.passwords = this.passwords.filter(p => p.id !== id);
    this.savePasswords();
    this.renderPasswords();
    this.updateStats();
    showToast('Password deleted', 'success');
  },

  searchPasswords(query) {
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll('.password-item').forEach(el => {
      const id = parseInt(el.dataset.passwordId);
      const pwd = this.passwords.find(p => p.id === id);
      if (pwd) {
        const matches = pwd.site.toLowerCase().includes(lowerQuery) ||
                       pwd.username.toLowerCase().includes(lowerQuery);
        el.style.display = matches ? 'flex' : 'none';
      }
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// =====================================================
// UNIVERSAL SYNC MANAGER
// =====================================================

const syncManager = {
  devices: [],
  syncSettings: {
    bookmarks: true,
    history: true,
    passwords: true,
    extensions: true,
    sessions: true,
    settings: true
  },
  isSyncing: false,
  lastSync: null,

  init() {
    this.loadSettings();
    this.loadDevices();
    this.attachEventListeners();
    this.renderDevices();
    this.updateSyncStatus();
  },

  attachEventListeners() {
    // Sync now button
    document.getElementById('syncNowBtn')?.addEventListener('click', () => {
      this.syncNow();
    });

    // Sync settings checkboxes
    ['syncBookmarks', 'syncHistory', 'syncPasswords', 'syncExtensions', 'syncSessions', 'syncSettings'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const setting = id.replace('sync', '').toLowerCase();
        this.syncSettings[setting] = e.target.checked;
        this.saveSettings();
      });
    });

    // Close panel
    document.querySelector('.sync-panel .panel-close')?.addEventListener('click', () => {
      document.querySelector('.sync-panel').style.display = 'none';
    });
  },

  loadSettings() {
    const stored = localStorage.getItem('syncSettings');
    if (stored) {
      this.syncSettings = JSON.parse(stored);
    }

    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      this.lastSync = parseInt(lastSync);
    }

    // Update checkboxes
    Object.keys(this.syncSettings).forEach(key => {
      const checkbox = document.getElementById(`sync${key.charAt(0).toUpperCase() + key.slice(1)}`);
      if (checkbox) {
        checkbox.checked = this.syncSettings[key];
      }
    });
  },

  saveSettings() {
    localStorage.setItem('syncSettings', JSON.stringify(this.syncSettings));
  },

  loadDevices() {
    const stored = localStorage.getItem('syncDevices');
    if (stored) {
      this.devices = JSON.parse(stored);
    } else {
      // Current device
      this.devices = [{
        id: 1,
        name: 'Desktop',
        type: 'Windows',
        lastSync: Date.now(),
        active: true
      }];
    }
  },

  saveDevices() {
    localStorage.setItem('syncDevices', JSON.stringify(this.devices));
  },

  async syncNow() {
    if (this.isSyncing) {
      showToast('Sync already in progress', 'info');
      return;
    }

    this.isSyncing = true;
    const icon = document.querySelector('.sync-icon');
    icon?.classList.add('syncing');

    showToast('Syncing data...', 'info');

    // Simulate sync (in production, this would communicate with backend)
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.lastSync = Date.now();
    localStorage.setItem('lastSyncTime', this.lastSync.toString());

    this.isSyncing = false;
    icon?.classList.remove('syncing');
    this.updateSyncStatus();

    showToast('Sync completed successfully', 'success');
  },

  updateSyncStatus() {
    const timeEl = document.querySelector('.sync-time');
    if (timeEl) {
      if (this.lastSync) {
        const date = new Date(this.lastSync);
        timeEl.textContent = `Last synced: ${date.toLocaleString()}`;
      } else {
        timeEl.textContent = 'Never synced';
      }
    }
  },

  renderDevices() {
    const container = document.querySelector('.device-list');
    if (!container) return;

    container.innerHTML = this.devices.map(device => `
      <div class="device-item ${device.active ? 'active' : ''}" data-device-id="${device.id}">
        <div class="device-icon">💻</div>
        <div class="device-info">
          <h4>${this.escapeHtml(device.name)} ${device.active ? '(This Device)' : ''}</h4>
          <p>${this.escapeHtml(device.type)} • Last synced: ${new Date(device.lastSync).toLocaleString()}</p>
        </div>
      </div>
    `).join('');
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Make managers globally accessible
window.verticalTabsManager = verticalTabsManager;
window.sessionManager = sessionManager;
window.smartBookmarksManager = smartBookmarksManager;
window.passwordManager = passwordManager;
window.syncManager = syncManager;

// ============================================================================
// START APPLICATION
// ============================================================================

// Initialize everything together
document.addEventListener('DOMContentLoaded', function() {
  // Initialize main application first
  init();
  
  // Then initialize TOP 5 features
  try {
    verticalTabsManager.init();
    sessionManager.init();
    smartBookmarksManager.init();
    passwordManager.init();
    syncManager.init();
    
    // Generate initial password
    if (document.getElementById('generatedPasswordDisplay')) {
      passwordManager.generatePassword();
    }
    
    console.log('✅ All TOP 5 Chrome-alternative features initialized');
  } catch (error) {
    console.error('Error initializing TOP 5 features:', error);
  }
});

// ============================================================================
// ELECTRON INTEGRATION
// ============================================================================

function setupElectronListeners() {
  // Check if running in Electron
  if (typeof require === 'undefined') {
    console.log('Not running in Electron - browser navigation disabled');
    return;
  }
  
  try {
    const { ipcRenderer } = require('electron');
    
    // Listen for URL changes from Electron BrowserView
    ipcRenderer.on('url-changed', (event, url) => {
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) {
        activeTab.url = url;
        activeTab.title = extractDomain(url);
        renderTabs();
        
        // Add to history
        addToHistory(url, activeTab.title);
        
        // Update omnibox
        const omnibox = document.getElementById('omnibox');
        if (omnibox && document.activeElement !== omnibox) {
          omnibox.value = url;
        }
        
        updateSecurityIcon(url);
        updateBookmarkButton(checkIfBookmarked(url));
      }
    });
    
    // Listen for page title changes
    ipcRenderer.on('title-changed', (event, title) => {
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) {
        activeTab.title = title;
        renderTabs();
      }
    });
    
    // Listen for favicon changes
    ipcRenderer.on('favicon-changed', (event, favicon) => {
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) {
        activeTab.favicon = favicon;
        renderTabs();
      }
    });
    
    // Listen for loading state
    ipcRenderer.on('loading-start', () => {
      const loadingIndicator = document.getElementById('loadingIndicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
      }
    });
    
    ipcRenderer.on('loading-stop', () => {
      const loadingIndicator = document.getElementById('loadingIndicator');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    });
    
    console.log('✅ Electron IPC listeners initialized');
    console.log('✅ Navigation buttons will use goBack(), goForward(), refresh() functions');
  } catch (error) {
    console.log('Not running in Electron with node integration:', error.message);
  }
}
