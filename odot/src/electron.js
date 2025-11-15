(async () => {
  const isDev = (await import('electron-is-dev')).default;

  const { app, BrowserWindow, ipcMain } = require("electron");
  const path = require("path");
  const fs = require("fs");
  const os = require("os");
  require("dotenv").config();
  const https = require('https');

  // Path to Chrome extension storage
  function getChromeExtensionStoragePath() {
    const platform = process.platform;
    let basePath = '';
    
    if (platform === 'darwin') {
      // macOS
      basePath = path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default/Local Storage/leveldb');
    } else if (platform === 'win32') {
      // Windows
      basePath = path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Default/Local Storage/leveldb');
    } else {
      // Linux
      basePath = path.join(os.homedir(), '.config/google-chrome/Default/Local Storage/leveldb');
    }
    
    return basePath;
  }

  function createWindow() {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // Load React
    win.loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    );

    if (isDev) {
      win.webContents.openDevTools();
    }
  }

  // Create window when app is ready
  app.whenReady().then(() => { 
    createWindow(); 
  });

  // Quit when all windows are closed
  app.on("window-all-closed", () => {
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

  // Get extension data from Chrome
  ipcMain.handle('get-extension-data', async () => {
    try {
      // Try reading from shared data file first
      const dataPath = path.join(os.homedir(), '.odot-tracker-data.json');

      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        console.log('Loaded extension data from shared file');
        const parsed = JSON.parse(data);
        return {
          ...parsed,
          isDemoMode: false,
          source: 'file'
        };
      }

      // If no file exists, try to read from Chrome's extension storage
      // This is a fallback - the extension should write to the shared file
      console.log('No shared file found, using demo data');
      
      // Return demo data for testing
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
      // Use fallback classification
      return fallbackClassification(sites);
    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Fallback classification if AI doesn't work
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

  // Legacy fetch API handler
  ipcMain.handle('fetch-api', async (event, url) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            resolve(data); // if response is not JSON
          }
        });
      }).on('error', (err) => {
        resolve({ error: err.message });
      });
    });
  });
})();