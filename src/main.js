import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';

// State Management
const state = {
  tabs: [{ id: 0, title: 'New Tab', url: '', active: true }],
  nextTabId: 1,
  bookmarks: [],
  settings: {
    homePage: '',
    searchEngine: 'https://www.google.com/search?q=',
    blockThirdPartyCookies: true,
    disableAutoplay: true,
    lowMemoryMode: false,
    tabSuspendTime: 10
  }
};

// Initialize
async function init() {
  loadSettings();
  await loadBookmarks();
  setupEventListeners();
  setupKeyboardShortcuts();
  renderBookmarks();
  
  console.log('Lumen Browser initialized');
}

// Settings Management
function loadSettings() {
  const saved = localStorage.getItem('lumen_settings');
  if (saved) {
    state.settings = { ...state.settings, ...JSON.parse(saved) };
  }
  applySettings();
}

function saveSettings() {
  localStorage.setItem('lumen_settings', JSON.stringify(state.settings));
  applySettings();
  alert('Settings saved!');
}

function applySettings() {
  document.getElementById('homePageInput').value = state.settings.homePage;
  document.getElementById('searchEngineSelect').value = state.settings.searchEngine;
  document.getElementById('blockThirdPartyCookies').checked = state.settings.blockThirdPartyCookies;
  document.getElementById('disableAutoplay').checked = state.settings.disableAutoplay;
  document.getElementById('lowMemoryMode').checked = state.settings.lowMemoryMode;
  document.getElementById('tabSuspendTime').value = state.settings.tabSuspendTime;
}

// Bookmarks Management
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
    alert('No URL to bookmark');
    return;
  }

  const bookmark = {
    id: Date.now(),
    title: activeTab.title || activeTab.url,
    url: activeTab.url,
    createdAt: new Date().toISOString()
  };

  try {
    await invoke('add_bookmark', { bookmark });
    state.bookmarks.push(bookmark);
    renderBookmarks();
    alert('Bookmark added!');
  } catch (error) {
    console.error('Failed to add bookmark:', error);
  }
}

async function deleteBookmark(id) {
  try {
    await invoke('delete_bookmark', { id });
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
    renderBookmarks();
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
  }
}

function renderBookmarks() {
  const quickList = document.getElementById('quickBookmarksList');
  const modalList = document.getElementById('bookmarksModalBody');

  if (state.bookmarks.length === 0) {
    const empty = '<div class="empty-state"><p>No bookmarks yet</p></div>';
    quickList.innerHTML = empty;
    if (modalList) modalList.innerHTML = empty;
    return;
  }

  const html = state.bookmarks.map(b => `
    <div class="bookmark-item" onclick="navigateToBookmark('${b.url}')">
      <div>
        <div class="bookmark-item-title">${escapeHtml(b.title)}</div>
        <div class="bookmark-item-url">${escapeHtml(b.url)}</div>
      </div>
      <button class="bookmark-item-delete" onclick="event.stopPropagation(); deleteBookmark(${b.id})">
        Delete
      </button>
    </div>
  `).join('');

  quickList.innerHTML = html;
  if (modalList) modalList.innerHTML = html;
}

window.deleteBookmark = deleteBookmark;
window.navigateToBookmark = (url) => {
  const addressBar = document.getElementById('addressBar');
  addressBar.value = url;
  navigate(url);
  closeAllModals();
};

// Tab Management
function createTab() {
  const tab = {
    id: state.nextTabId++,
    title: 'New Tab',
    url: '',
    active: false
  };

  // Deactivate all tabs
  state.tabs.forEach(t => t.active = false);
  tab.active = true;
  state.tabs.push(tab);

  renderTabs();
  renderTabContent(tab.id);
  switchToTab(tab.id);
}

function closeTab(tabId) {
  const index = state.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;

  // Can't close the last tab
  if (state.tabs.length === 1) {
    state.tabs[0] = { id: state.nextTabId++, title: 'New Tab', url: '', active: true };
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
  }

  renderTabs();
  if (wasActive) {
    switchToTab(state.tabs.find(t => t.active).id);
  }
}

function switchToTab(tabId) {
  state.tabs.forEach(t => t.active = t.id === tabId);
  renderTabs();

  // Show/hide webview containers
  document.querySelectorAll('.webview-container').forEach(container => {
    container.classList.toggle('active', container.dataset.tabId == tabId);
  });

  // Update address bar
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    document.getElementById('addressBar').value = tab.url || '';
  }
}

function renderTabs() {
  const tabStrip = document.getElementById('tabStrip');
  const newTabBtn = document.querySelector('.new-tab-btn');

  const tabsHtml = state.tabs.map(tab => `
    <div class="tab ${tab.active ? 'active' : ''}" data-tab-id="${tab.id}" onclick="switchToTab(${tab.id})">
      <span class="tab-title">${escapeHtml(tab.title)}</span>
      <button class="tab-close" data-tab-id="${tab.id}" onclick="event.stopPropagation(); closeTab(${tab.id})">×</button>
    </div>
  `).join('');

  tabStrip.innerHTML = tabsHtml;
  tabStrip.appendChild(newTabBtn);
}

function renderTabContent(tabId) {
  const container = document.querySelector(`.webview-container[data-tab-id="${tabId}"]`);
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.className = 'webview-container';
    newContainer.dataset.tabId = tabId;
    newContainer.innerHTML = `
      <div class="start-page">
        <div class="start-page-content">
          <h1>🌟 Lumen</h1>
          <p class="tagline">Lightweight. Minimal. Elegant.</p>
          <div class="quick-search">
            <input type="text" class="quick-search-input" placeholder="Search the web..." />
          </div>
        </div>
      </div>
    `;
    document.getElementById('contentArea').appendChild(newContainer);
  }
}

window.switchToTab = switchToTab;
window.closeTab = closeTab;

// Navigation
function navigate(input) {
  const activeTab = state.tabs.find(t => t.active);
  if (!activeTab) return;

  let url = input.trim();
  
  // Check if it's a URL or search query
  if (!url.includes('.') || url.includes(' ')) {
    // It's a search query
    url = state.settings.searchEngine + encodeURIComponent(url);
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  activeTab.url = url;
  activeTab.title = new URL(url).hostname;
  
  renderTabs();
  
  // In a real implementation, this would load the URL in a webview
  console.log('Navigating to:', url);
  
  // For now, just update the UI
  const container = document.querySelector(`.webview-container[data-tab-id="${activeTab.id}"]`);
  if (container) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Loading: ${escapeHtml(url)}</h2>
        <p style="margin-top: 16px; color: #666;">
          In a full implementation, this would load the actual webpage.
        </p>
        <div class="loading-indicator"></div>
      </div>
    `;
  }
}

function goBack() {
  console.log('Go back');
  // Implement history navigation
}

function goForward() {
  console.log('Go forward');
  // Implement history navigation
}

function refresh() {
  const activeTab = state.tabs.find(t => t.active);
  if (activeTab && activeTab.url) {
    navigate(activeTab.url);
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

// Event Listeners
function setupEventListeners() {
  // Tab controls
  document.getElementById('newTabBtn').addEventListener('click', createTab);

  // Navigation controls
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('forwardBtn').addEventListener('click', goForward);
  document.getElementById('refreshBtn').addEventListener('click', refresh);
  document.getElementById('homeBtn').addEventListener('click', goHome);

  // Address bar
  const addressBar = document.getElementById('addressBar');
  addressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      navigate(addressBar.value);
    }
  });

  addressBar.addEventListener('focus', () => {
    addressBar.select();
  });

  // Quick search on start page
  document.addEventListener('keypress', (e) => {
    if (e.target.classList.contains('quick-search-input') && e.key === 'Enter') {
      navigate(e.target.value);
    }
  });

  // Utility buttons
  document.getElementById('bookmarkBtn').addEventListener('click', addBookmark);
  document.getElementById('bookmarksListBtn').addEventListener('click', () => {
    showModal('bookmarksModal');
  });
  document.getElementById('settingsBtn').addEventListener('click', () => {
    showModal('settingsModal');
  });

  // Settings
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    state.settings.homePage = document.getElementById('homePageInput').value;
    state.settings.searchEngine = document.getElementById('searchEngineSelect').value;
    state.settings.blockThirdPartyCookies = document.getElementById('blockThirdPartyCookies').checked;
    state.settings.disableAutoplay = document.getElementById('disableAutoplay').checked;
    state.settings.lowMemoryMode = document.getElementById('lowMemoryMode').checked;
    state.settings.tabSuspendTime = parseInt(document.getElementById('tabSuspendTime').value);
    saveSettings();
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
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+T - New Tab
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      createTab();
    }
    
    // Ctrl+W - Close Tab
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      const activeTab = state.tabs.find(t => t.active);
      if (activeTab) closeTab(activeTab.id);
    }
    
    // Ctrl+L - Focus Address Bar
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      document.getElementById('addressBar').focus();
    }
    
    // Ctrl+D - Bookmark
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      addBookmark();
    }
    
    // Ctrl+R - Refresh
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      refresh();
    }
    
    // Ctrl+Tab - Next Tab
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      const activeIndex = state.tabs.findIndex(t => t.active);
      const nextIndex = (activeIndex + 1) % state.tabs.length;
      switchToTab(state.tabs[nextIndex].id);
    }
    
    // Ctrl+Shift+Tab - Previous Tab
    if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      const activeIndex = state.tabs.findIndex(t => t.active);
      const prevIndex = (activeIndex - 1 + state.tabs.length) % state.tabs.length;
      switchToTab(state.tabs[prevIndex].id);
    }
    
    // Alt+Left - Back
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      goBack();
    }
    
    // Alt+Right - Forward
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      goForward();
    }
  });
}

// Modal Management
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start the app
init();
