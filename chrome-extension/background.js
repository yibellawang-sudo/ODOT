const SERVER_URL = 'http://localhost:3737';

let siteData = {};
let currentSite = null;
let lastSaveTime = Date.now();
let isTracking = false;

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.warn('Server not reachable:', error.message);
    return false;
  }
}

// Load data from server
async function loadDataFromServer() {
  try {
    const response = await fetch(`${SERVER_URL}/data`);
    const result = await response.json();
    
    if (result.success && result.data) {
      siteData = result.data;
      console.log('Loaded data from server:', siteData);
    }
  } catch (error) {
    console.error('Error loading data from server:', error);
  }
}

// Save data to server
async function saveDataToServer() {
  try {
    const response = await fetch(`${SERVER_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: siteData })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Data saved to server successfully');
    } else {
      console.error('Server save failed:', result.error);
    }
  } catch (error) {
    console.error('Error saving to server:', error.message);
  }
}

// Get site name from URL
function getSiteFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return 'unknown';
  }
}

// Start tracking a site
function startTracking(site) {
  if (currentSite === site) return;
  
  // Save previous site
  if (currentSite) {
    stopTracking();
  }
  
  currentSite = site;
  isTracking = true;
  lastSaveTime = Date.now();
  
  console.log(`Started tracking: ${site}`);
}

// Stop tracking and save
function stopTracking() {
  if (!currentSite || !isTracking) return;
  
  const now = Date.now();
  const elapsedMinutes = (now - lastSaveTime) / 1000 / 60;
  
  // Only save if more than 5 seconds elapsed
  if (elapsedMinutes > 0.08) {
    if (!siteData[currentSite]) {
      siteData[currentSite] = 0;
    }
    
    siteData[currentSite] += elapsedMinutes;
    
    const totalMinutes = siteData[currentSite].toFixed(2);
    console.log(`Saved ${elapsedMinutes.toFixed(2)}min on ${currentSite} (total: ${totalMinutes}min)`);
    
    // Save to server
    saveDataToServer();
  }
  
  isTracking = false;
  currentSite = null;
}

// Tab activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    const site = getSiteFromUrl(tab.url);
    startTracking(site);
  }
});

// Tab updated (URL changed)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        const site = getSiteFromUrl(changeInfo.url);
        startTracking(site);
      }
    });
  }
});

// Window focus changed
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.log('Browser minimized/unfocused');
    stopTracking();
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const site = getSiteFromUrl(tabs[0].url);
        startTracking(site);
      }
    });
  }
});

// Auto-save every 30 seconds
setInterval(() => {
  if (isTracking && currentSite) {
    console.log('⏱ Auto-save tick');
    const now = Date.now();
    const elapsedMinutes = (now - lastSaveTime) / 1000 / 60;
    
    if (elapsedMinutes > 0.08) {
      if (!siteData[currentSite]) {
        siteData[currentSite] = 0;
      }
      siteData[currentSite] += elapsedMinutes;
      lastSaveTime = now;
      
      saveDataToServer();
    }
  }
}, 30000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // Return current tracking data
    sendResponse({
      sites: siteData,
      total: Object.values(siteData).reduce((sum, time) => sum + time, 0),
      currentSite: currentSite,
      isTracking: isTracking
    });
    return true;
  }
  
  if (request.action === 'reset') {
    // Reset all data
    siteData = {};
    currentSite = null;
    isTracking = false;
    saveDataToServer();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'analyzeWithAI') {
    // Analyze with AI
    analyzeWithAI(request.sites).then(result => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
});

// AI Analysis function
async function analyzeWithAI(sites) {
  try {
    // Categorize sites into work/play
    const work = [];
    const play = [];
    
    const workKeywords = ['github', 'stackoverflow', 'docs', 'gmail', 'mail', 'notion', 'slack', 'coding', 'email', 'documents', 'communication', 'linkedin', 'office', 'drive', 'calendar'];
    const playKeywords = ['youtube', 'reddit', 'twitter', 'facebook', 'instagram', 'social', 'discord', 'netflix', 'twitch', 'tiktok', 'spotify', 'gaming'];
    
    Object.keys(sites).forEach(site => {
      const siteLower = site.toLowerCase();
      
      if (workKeywords.some(keyword => siteLower.includes(keyword))) {
        work.push(site);
      } else if (playKeywords.some(keyword => siteLower.includes(keyword))) {
        play.push(site);
      } else {
        // Default to play if uncertain
        play.push(site);
      }
    });
    
    return {
      success: true,
      analysis: { work, play }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Initialize
(async () => {
  console.log('ODOT Time Tracker initialized (HTTP mode)');
  
  // Check if server is running
  const serverOk = await checkServerHealth();
  if (serverOk) {
    console.log('Server is running');
    await loadDataFromServer();
  } else {
    console.warn('Server not running. Start it with: node localServer.js');
  }
  
  // Start tracking current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const site = getSiteFromUrl(tabs[0].url);
      startTracking(site);
    }
  });
})();