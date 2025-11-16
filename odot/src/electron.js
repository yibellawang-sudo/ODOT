const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
const fs = require("fs");
const os = require("os");
require('dotenv').config();
const https = require('https');

const DATA_FILE = path.join(os.homedir(), '.odot-tracker-data.json');

let mainWindow;
let fileWatcher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load React
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.webContents.openDevTools();
}

function createNativeFile() {
  const nativePath = path.join(
    os.homedir(),
    "Library/Application Support/Google/Chrome/NativeMessagingHosts/com.hackclub.odot.json"
  );
  
  if (!fs.existsSync(path.dirname(nativePath))) {
    fs.mkdirSync(path.dirname(nativePath), { recursive: true });
  }
  
  if (!fs.existsSync(nativePath)) {
    const jsFile = {
      "name": "com.hackclub.odot",
      "description": "ODOT",
      "path": __dirname,
      "type": "stdio",
      "allowed_origins": ["chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/"]
    };
    fs.writeFileSync(nativePath, JSON.stringify(jsFile, null, 2));
    console.log('Created native messaging manifest at:', nativePath);
  }
}

function readTrackerData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      console.log('Loaded tracker data:', Object.keys(parsed).length, 'activities');
      return parsed;
    }
    return {};
  } catch (error) {
    console.error('Error reading tracker data:', error);
    return {};
  }
}

function watchDataFile() {
  // Check if file exists, if not create it
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}');
    console.log('Created empty tracker data file at:', DATA_FILE);
  }

  // Initial load and send to renderer
  const initialData = readTrackerData();
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('tracker-data-updated', initialData);
  }

  // Close existing watcher if any
  if (fileWatcher) {
    fileWatcher.close();
  }

  // Watch for changes
  try {
    fileWatcher = fs.watch(DATA_FILE, (eventType) => {
      if (eventType === 'change') {
        console.log('Tracker data file changed, reloading...');
        const data = readTrackerData();
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('tracker-data-updated', data);
        }
      }
    });
    console.log('Watching tracker data file for changes');
  } catch (error) {
    console.error('Error setting up file watcher:', error);
  }
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();
  createNativeFile();
  
  // Start watching the data file after window is ready
  mainWindow.webContents.once('did-finish-load', () => {
    watchDataFile();
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (fileWatcher) {
    fileWatcher.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC HANDLERS

// Get tracker data (manual request)
ipcMain.handle('get-tracker-data', async () => {
  try {
    const data = readTrackerData();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting tracker data:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
});

// Get extension data 
ipcMain.handle('get-extension-data', async () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      console.log('Loaded extension data from file');
      console.log(`   Total sites: ${Object.keys(parsed).length}`);
      
      // Calculate total time
      const total = Object.values(parsed).reduce((sum, time) => sum + time, 0);
      
      return {
        sites: parsed,
        total: total,
        isDemoMode: false,
        source: 'extension'
      };
    }

    console.log('No data file found at:', DATA_FILE);
    // Return demo data
    return {
      sites: {
        'youtube.com': 8.5,
        'github.com': 12.3,
        'stackoverflow.com': 5.2,
        'twitter.com': 4.1,
        'instagram.com': 6.5,
        'docs.google.com': 3.4,
        'reddit.com': 7.2,
        'notion.so': 4.8
      },
      total: 52.0,
      currentSite: 'github.com',
      isTracking: true,
      isDemoMode: true,
      source: 'demo'
    };
  } catch (error) {
    console.error('Error loading extension data:', error);
    return {
      sites: {},
      total: 0,
      currentSite: null,
      isTracking: false,
      error: error.message,
      source: 'error'
    };
  }
});

// Analyze with AI
ipcMain.handle('analyze-with-ai', async (event, sites) => {
  try {
    return fallbackClassification(sites);
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Fallback classification
function fallbackClassification(sites) {
  const workKeywords = ['github', 'stackoverflow', 'docs', 'sheets', 'slides', 'google', 'drive', 'gmail', 'linkedin', 'slack', 'desmos', 'bluebook', 'apclassroom', 'notion', 'figma', 'jira', 'confluence'];
  const playKeywords = ['youtube', 'instagram', 'facebook', 'tiktok', 'shorts', 'reels', 'reddit', 'snapchat', 'netflix', 'disney', 'twitch', 'game', 'discord', 'spotify', 'twitter', 'x.com'];

  const work = [];
  const play = [];

  Object.keys(sites).forEach(site => {
    const lower = site.toLowerCase();
    if (playKeywords.some(kw => lower.includes(kw))) {
      play.push(site);
    } else if (workKeywords.some(kw => lower.includes(kw))) {
      work.push(site);
    } else {
      work.push(site);
    }
  });

  return {
    success: true,
    analysis: { work, play },
    isFallback: true
  };
}

ipcMain.handle("fetch-api", async (event, message) => {
  const apiKey = process.env.API_KEY
  const res = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "model": "qwen/qwen3-32b",
      "messages": [{ "role": "user", "content": message }]
    })
  });

  return res.json();
});


ipcMain.handle("readInFile", async (event, type) => {
  let filepath;
  if (type == 'userinfo') {
    filepath = path.join(__dirname, "../userInfo.json")
  } else {
     filepath = path.join(__dirname, "../data.json");
  }
 const data = fs.readFileSync(filepath)
 
return data
})
