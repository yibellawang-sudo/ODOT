let currentTabId = null;
let currentUrl = '';
let startTime = Date.now();
let isTracking = false;

let data = {
    sites: {},  
    total: 0
};

//start extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    loadData();
    
    //track every 5 seconds
    chrome.alarms.create('tick', { periodInMinutes: 0.083 }); //5 seconds
    
    //get current tab immediately
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

//load saved data
async function loadData() {
    const result = await chrome.storage.local.get('data');
    if (result.data) {
        data = result.data;
        console.log('Loaded data:', data);
    } else {
        console.log('No saved data, starting fresh');
    }
}

//save data
async function saveData() {
    await chrome.storage.local.set({ data });
}

//get domain from URL
function getDomain(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        return u.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

//save current session time
function saveCurrentSession() {
    if (!isTracking || !currentUrl) return;
    
    const now = Date.now();
    const seconds = (now - startTime) / 1000;
    const minutes = seconds / 60;
    
    const domain = getDomain(currentUrl);
    
    if (domain && minutes > 0.01) { //at least 0.6 seconds
        data.sites[domain] = (data.sites[domain] || 0) + minutes;
        data.total += minutes;
        
        console.log(`Saved ${minutes.toFixed(2)}min on ${domain} (total: ${data.sites[domain].toFixed(2)}min)`);
        saveData();
    }
}

//switch to new tab/url
function switchTo(url) {
    saveCurrentSession(); //save old session
    
    currentUrl = url;
    startTime = Date.now();
    isTracking = true;
    
    const domain = getDomain(url);
    if (domain) {
        console.log(`Now tracking: ${domain}`);
    }
}

//detect tab switch
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

//detect url changes in current tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === currentTabId && changeInfo.url) {
        console.log('URL changed');
        switchTo(changeInfo.url);
    }
});

//detect window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        //browser lost focus
        console.log('Browser minimized/unfocused');
        saveCurrentSession();
        isTracking = false;
    } else {
        //browser gained focus
        console.log('Browser focused');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                currentTabId = tabs[0].id;
                switchTo(tabs[0].url || '');
            }
        });
    }
});

//save every 5 seconds
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'tick') {
        if (isTracking) {
            console.log('⏱Auto-save tick');
            saveCurrentSession();
            startTime = Date.now(); //reset timer
        }
    }
});

//mgs from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
        //save current session before sending data
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
    }
    return true;
});

console.log('Background script loaded');