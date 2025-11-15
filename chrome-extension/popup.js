function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.floor((minutes % 1) * 60);
  
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function loadData() {
  chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    if (!response) {
      document.getElementById('content').innerHTML = '<div class="empty">Error loading data</div>';
      return;
    }
    displayData(response);
  });
}

function displayData(response) {
  // Update status
  const statusEl = document.getElementById('status');
  if (response.isTracking && response.currentSite) {
    statusEl.className = 'status';
    statusEl.innerHTML = `
      <div class="pulse"></div>
      <span>Tracking: ${response.currentSite}</span>
    `;
  } else {
    statusEl.className = 'status inactive';
    statusEl.innerHTML = `
      <div class="pulse" style="background: black;"></div>
      <span>Not tracking (no active tab)</span>
    `;
  }
  
  // Build content
  let html = `
    <div class="total">${formatTime(response.total)}</div>
    <div class="total-label">Total time tracked</div>
  `;
  
  // Show current site
  if (response.currentSite && response.isTracking) {
    const currentTime = response.sites[response.currentSite] || 0;
    html += `
      <div class="current-site">
        Currently on: <strong>${response.currentSite}</strong><br>
        <span style="font-size: 12px; color: #888;">
          ${formatTime(currentTime)} total on this site
        </span>
      </div>
    `;
  }
  
  // Show all sites
  const sites = Object.entries(response.sites).sort((a, b) => b[1] - a[1]);
  
  if (sites.length > 0) {
    html += '<div class="sites-header">All Sites</div>';
    html += '<div class="sites-list">';
    sites.forEach(([site, time]) => {
      html += `
        <div class="site">
          <span class="site-name">${site}</span>
          <span class="site-time">${formatTime(time)}</span>
        </div>
      `;
    });
    html += '</div>';
  } else {
    html += `
      <div class="empty">
        <div>No activity yet</div>
        <div style="font-size: 12px; margin-top: 8px;">
          Start browsing to track time!
        </div>
      </div>
    `;
  }
  
  html += '<button id="reset">Reset All Data</button>';
  html += '<button id="analyze" style="background: #888; margin-top: 8px;">Analyze with AI</button>';
  
  document.getElementById('content').innerHTML = html;
  
  // Reset button
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Reset all tracking data? This cannot be undone.')) {
      chrome.runtime.sendMessage({ action: 'reset' }, () => {
        loadData();
      });
    }
  });
  
  // Analyze button
  document.getElementById('analyze').addEventListener('click', () => {
    analyzeWithAI(response.sites);
  });
}

// AI Analysis
function analyzeWithAI(sites) {
  const analyzeBtn = document.getElementById('analyze');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  
  chrome.runtime.sendMessage({ 
    action: 'analyzeWithAI',
    sites: sites
  }, (result) => {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze with AI';
    
    if (result.success) {
      showAnalysis(result.analysis, sites);
    } else {
      alert('AI Analysis failed: ' + result.error);
    }
  });
}

// Show Analysis Results
function showAnalysis(analysis, sites) {
  const contentEl = document.getElementById('content');
  
  // Calculate totals
  let workTime = 0;
  let playTime = 0;
  
  analysis.work.forEach(site => {
    workTime += sites[site] || 0;
  });
  
  analysis.play.forEach(site => {
    playTime += sites[site] || 0;
  });
  
  const total = workTime + playTime;
  const workPercent = total > 0 ? Math.round((workTime / total) * 100) : 0;
  const playPercent = total > 0 ? Math.round((playTime / total) * 100) : 0;
  
  let html = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 24px; font-weight: bold; color: #888; margin-bottom: 8px;">
        AI Analysis Complete! 
      </div>
    </div>
    
    <div style="background: black; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <div style="font-size: 14px; color: #888; margin-bottom: 12px;">Productivity Breakdown</div>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>💼 Work</span>
          <span style="color: #888; font-weight: bold;">${workPercent}%</span>
        </div>
        <div style="background: #black; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: #888; height: 100%; width: ${workPercent}%;"></div>
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">${formatTime(workTime)}</div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Play</span>
          <span style="color: white; font-weight: bold;">${playPercent}%</span>
        </div>
        <div style="background: black; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: white; height: 100%; width: ${playPercent}%;"></div>
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">${formatTime(playTime)}</div>
      </div>
    </div>
    
    <div class="sites-header">Work Sites (${analysis.work.length})</div>
    <div class="sites-list" style="max-height: 150px;">
  `;
  
  analysis.work.forEach(site => {
    const time = sites[site] || 0;
    html += `
      <div class="site" style="border-left: 3px solid #888;">
        <span class="site-name">${site}</span>
        <span class="site-time">${formatTime(time)}</span>
      </div>
    `;
  });
  
  html += `
    </div>
    
    <div class="sites-header" style="margin-top: 16px;">Play Sites (${analysis.play.length})</div>
    <div class="sites-list" style="max-height: 150px;">
  `;
  
  analysis.play.forEach(site => {
    const time = sites[site] || 0;
    html += `
      <div class="site" style="border-left: 3px solid #white;">
        <span class="site-name">${site}</span>
        <span class="site-time">${formatTime(time)}</span>
      </div>
    `;
  });
  
  html += `
    </div>
    <button id="back" style="background: black; margin-top: 16px;">← Back to Overview</button>
  `;
  
  contentEl.innerHTML = html;
  
  document.getElementById('back').addEventListener('click', () => {
    loadData();
  });
}

loadData();

// Auto-refresh every 2 seconds to show live updates
setInterval(loadData, 2000);