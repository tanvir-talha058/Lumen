/**
 * Lumen Browser v2.0 - Enhanced Implementation
 * Modern, Chrome-inspired browser with innovative features
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
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  console.log('🌟 Lumen Browser v2.0 initializing...');
  
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
  
  renderBookmarks();
  renderHistory();
  renderSessions();
  
  if (state.settings.reopenLastSession) {
    await restoreLastSession();
  }
  
  console.log('✅ Lumen Browser ready!');
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
    console.error('Failed to load bookmarks:', error);
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
    console.error('Failed to add bookmark:', error);
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
    console.error('Failed to delete bookmark:', error);
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
  
  // Simulate page loading
  const container = document.querySelector(`.webview-container[data-tab-id="${activeTab.id}"]`);
  if (container) {
    container.innerHTML = `
      <div style="padding: 60px 40px; text-align: center;">
        <div class="loading-spinner"></div>
        <h2 style="margin-top: 24px; color: var(--text-primary);">Loading...</h2>
        <p style="margin-top: 12px; color: var(--text-secondary);">${escapeHtml(url)}</p>
        <p style="margin-top: 24px; color: var(--text-tertiary); font-size: 14px;">
          In a full implementation, this would load the actual webpage using WebView2/WKWebView/WebKitGTK
        </p>
      </div>
    `;
  }
  
  console.log('Navigating to:', url);
}

function updateSecurityIcon(url) {
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
  showNotification('History navigation will be implemented with real WebView', 'info');
}

function goForward() {
  showNotification('History navigation will be implemented with real WebView', 'info');
}

function refresh() {
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
  document.getElementById('commandPaletteBtn').addEventListener('click', showCommandPalette);
  document.getElementById('settingsBtn').addEventListener('click', () => showModal('settingsModal'));
  
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
// GLOBAL FUNCTIONS
// ============================================================================

window.navigate = navigate;

// ============================================================================
// START APPLICATION
// ============================================================================

init();
