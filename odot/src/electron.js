const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs")
require('dotenv').config();
const https = require('https');
//const axios = require("axios"); // Use axios for API requests

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


    win.webContents.openDevTools();
  
}

function createNativeFile() {
    const path = "~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.hackclub.odot.json"
    if (!fs.existsSync(path)) {
        const jsFile = {
  "name": "com.hackclub.odot",
  "description": "Odot",
  "path": __dirname,
  "type": "stdio",
  "allowed_origins": ["chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/"]
}
        fs.writeFileSync(path, JSON.stringify(jsFile))
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
