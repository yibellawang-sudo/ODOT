let currentTabId = null;
let currentUrl = '';
let startTime = Date.now();
let isTracking = false;

let data = {
    sites: {},  
    total: 0
};

// Native messaging port (for communicating with Electron)
let nativePort = null;

// Start extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    loadData();
    connectToNativeHost();
    
    // Track every 5 seconds
    chrome.alarms.create('tick', { periodInMinutes: 0.083 }); // 5 seconds
    
    // Get current tab immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            currentTabId = tabs[0].id;
            currentUrl = tabs[0].url || '';
            startTime = Date.now();
            isTracking = true;
            console.log('Started tracking:', getDomain(currentUrl));
        }
    });
});

// Connect to native messaging host
function connectToNativeHost() {
    try {
        nativePort = chrome.runtime.connectNative('com.hackclub.odot');
        
        nativePort.onMessage.addListener((msg) => {
            console.log('Message from native host:', msg);
        });
        
        nativePort.onDisconnect.addListener(() => {
            console.log('Native host disconnected:', chrome.runtime.lastError);
            nativePort = null;
            // Try to reconnect in 5 seconds
            setTimeout(connectToNativeHost, 5000);
        });
        
        console.log('Connected to native host');
    } catch (error) {
        console.log('Could not connect to native host:', error);
    }
}

// Send data to Electron via native messaging
function sendToElectron() {
    if (!nativePort) {
        console.log('Native port not connected, skipping send');
        return;
    }
    
    try {
        const exportData = {
            action: 'saveData',
            data: {
                sites: data.sites,
                total: data.total,
                currentSite: getDomain(currentUrl),
                isTracking: isTracking,
                lastUpdated: new Date().toISOString()
            }
        };
        
        nativePort.postMessage(exportData);
        console.log('Sent data to Electron');
    } catch (error) {
        console.error('Error sending to Electron:', error);
    }
}

// Load saved data
async function loadData() {
    const result = await chrome.storage.local.get('data');
    if (result.data) {
        data = result.data;
        console.log('Loaded data:', data);
    } else {
        console.log('No saved data, starting fresh');
    }
}

// Save data
async function saveData() {
    await chrome.storage.local.set({ data });
    // Send to Electron
    sendToElectron();
}

// Get domain from URL
function getDomain(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        return u.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

// Save current session time
function saveCurrentSession() {
    if (!isTracking || !currentUrl) return;
    
    const now = Date.now();
    const seconds = (now - startTime) / 1000;
    const minutes = seconds / 60;
    
    const domain = getDomain(currentUrl);
    
    if (domain && minutes > 0.01) { // at least 0.6 seconds
        data.sites[domain] = (data.sites[domain] || 0) + minutes;
        data.total += minutes;
        
        console.log(`Saved ${minutes.toFixed(2)}min on ${domain} (total: ${data.sites[domain].toFixed(2)}min)`);
        saveData();
    }
}

// Switch to new tab/url
function switchTo(url) {
    saveCurrentSession(); // save old session
    
    currentUrl = url;
    startTime = Date.now();
    isTracking = true;
    
    const domain = getDomain(url);
    if (domain) {
        console.log(`Now tracking: ${domain}`);
    }
}

// Detect tab switch
chrome.tabs.onActivated.addListener(async (info) => {
    console.log('Tab switched');
    
    currentTabId = info.tabId;
    
    try {
        const tab = await chrome.tabs.get(currentTabId);
        switchTo(tab.url || '');
    } catch (e) {
        console.log('Error getting tab:', e);
        isTracking = false;
    }
});

// Detect url changes in current tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.url) {
        console.log('URL changed');
        switchTo(changeInfo.url);
    }
});

// Detect window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Browser lost focus
        console.log('Browser minimized/unfocused');
        saveCurrentSession();
        isTracking = false;
        sendToElectron(); // Send final state
    } else {
        // Browser gained focus
        console.log('Browser focused');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                currentTabId = tabs[0].id;
                switchTo(tabs[0].url || '');
            }
        });
    }
});

// Save every 5 seconds
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'tick') {
        if (isTracking) {
            console.log('⏱ Auto-save tick');
            saveCurrentSession();
            startTime = Date.now(); // reset timer
        }
    }
});

// Messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
        // Save current session before sending data
        saveCurrentSession();
        startTime = Date.now();
        
        sendResponse({
            sites: data.sites,
            total: data.total,
            currentSite: getDomain(currentUrl),
            isTracking: isTracking
        });
    } else if (request.action === 'reset') {
        console.log('Resetting all data');
        data = { sites: {}, total: 0 };
        saveData();
        sendResponse({ success: true });
    } else if (request.action === 'analyzeWithAI') {
        // Handle AI analysis
        analyzeWithAI(request.sites).then(result => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    }
    return true;
});



// AI Analysis function
async function analyzeWithAI(sites) {
    try {
        // Use fallback classification for now
        return fallbackClassification(sites);
    } catch (error) {
        console.error('AI Analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fallback classification
function fallbackClassification(sites) {
    const workKeywords = ['github', 'stackoverflow', 'docs', 'sheets', 'slides', 'google', 'drive', 'gmail', 'linkedin', 'slack', 'desmos', 'bluebook', 'apclassroom', 'notion', 'figma', 'jira', 'confluence', 'vscode', 'replit'];
    const playKeywords = ['youtube', 'instagram', 'facebook', 'tiktok', 'shorts', 'reels', 'reddit', 'snapchat', 'netflix', 'disney', 'twitch', 'game', 'discord', 'spotify', 'twitter', 'x.com', 'pinterest'];

    const work = [];
    const play = [];

    Object.keys(sites).forEach(site => {
        const lower = site.toLowerCase();
        if (playKeywords.some(kw => lower.includes(kw))) {
            play.push(site);
        } else if (workKeywords.some(kw => lower.includes(kw))) {
            work.push(site);
        } else {
            // Default unknown sites to work
            work.push(site);
        }
    });

    return {
        success: true,
        analysis: { work, play },
        isFallback: true
    };
}

//ai analysis function
//response tbd based on included ai model
