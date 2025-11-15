#!/usr/bin/env node

// This script runs as a native messaging host
// Chrome extension -> This script -> Writes to file -> Electron reads file

const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_FILE = path.join(os.homedir(), '.odot-tracker-data.json');

// Read message from Chrome extension (stdin)
function getMessage() {
  return new Promise((resolve) => {
    const chunks = [];
    let length = 0;
    let lengthBytes = null;

    process.stdin.on('readable', () => {
      if (lengthBytes === null) {
        lengthBytes = process.stdin.read(4);
        if (lengthBytes === null) return;
        length = lengthBytes.readUInt32LE(0);
      }

      const chunk = process.stdin.read(length);
      if (chunk === null) return;

      chunks.push(chunk);
      const message = Buffer.concat(chunks).toString();
      resolve(JSON.parse(message));
    });
  });
}

// Send message back to Chrome extension (stdout)
function sendMessage(message) {
  const buffer = Buffer.from(JSON.stringify(message));
  const header = Buffer.alloc(4);
  header.writeUInt32LE(buffer.length, 0);
  
  process.stdout.write(header);
  process.stdout.write(buffer);
}

// Write data to shared file
function writeDataFile(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main handler
async function main() {
  try {
    const message = await getMessage();
    
    if (message.action === 'saveData') {
      const result = writeDataFile(message.data);
      sendMessage(result);
    } else {
      sendMessage({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    sendMessage({ success: false, error: error.message });
  }
  
  process.exit(0);
}

main();