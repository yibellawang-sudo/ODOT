#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const DATA_FILE = path.join(os.homedir(), '.odot-tracker-data.json');
const LOG_FILE = path.join(os.homedir(), '.odot-server.log');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${message}`);
  try {
    fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
  } catch (e) {
    console.error('Could not write to log file:', e);
  }
}

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
    return {};
  } catch (error) {
    log(`Error reading data: ${error.message}`);
    return {};
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    log(`Wrote data to ${DATA_FILE}`);
    return { success: true };
  } catch (error) {
    log(`Error writing data: ${error.message}`);
    return { success: false, error: error.message };
  }
}

const server = http.createServer((req, res) => {
  // CORS headers for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  log(`${req.method} ${req.url}`);

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Get data
  if (req.url === '/data' && req.method === 'GET') {
    const data = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
    return;
  }

  // Save data
  if (req.url === '/data' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { data } = JSON.parse(body);
        const result = writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        log(`Error processing POST: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Not found' }));
});

server.listen(PORT, 'localhost', () => {
  log(`ODOT server listening on http://localhost:${PORT}`);
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Logs: ${LOG_FILE}`);
  console.log(`Data: ${DATA_FILE}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use. Is the server already running?`);
    console.error(`ERROR: Port ${PORT} is already in use!`);
    process.exit(1);
  } else {
    log(`Server error: ${error.message}`);
    console.error('Server error:', error);
  }
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});