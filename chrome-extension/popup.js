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
      console.log(response)
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
      <div class="pulse"></div>
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
    const siteData = response.sites[response.currentSite];
    const currentTime = typeof siteData === 'number' ? siteData : (siteData?.time || 0);
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
  const sites = Object.entries(response.sites)
    .map(([site, value]) => {
      const time = typeof value === 'number' ? value : (value?.time || 0);
      return [site, time];
    })
    .sort((a, b) => b[1] - a[1]);
  
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
  html += '<button id="analyze">Analyze</button>';
  
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
    analyze(response.sites);
  });
}

// Analysis
function analyze(sites) {
  const analyzeBtn = document.getElementById('analyze');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  
  chrome.runtime.sendMessage({ 
    action: 'analyzeWithAI',
    sites: sites
  }, (result) => {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
    
    if (result.success) {
      showAnalysis(result.analysis, sites);
    } else {
      alert('Analysis failed: ' + result.error);
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
    const siteData = sites[site];
    workTime += typeof siteData === 'number' ? siteData : (siteData?.time || 0);
  });
  
  analysis.play.forEach(site => {
    const siteData = sites[site];
    playTime += typeof siteData === 'number' ? siteData : (siteData?.time || 0);
  });
  
  const total = workTime + playTime;
  const workPercent = total > 0 ? Math.round((workTime / total) * 100) : 0;
  const playPercent = total > 0 ? Math.round((playTime / total) * 100) : 0;
  
  let html = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 20px; font-weight: bold; color: #abff4f; margin-bottom: 8px;">
        Analysis Complete!
      </div>
    </div>
    
    <div style="background: #1a1a1a; border: 1px solid #333; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <div style="font-size: 14px; color: #888; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Productivity Breakdown</div>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Work</span>
          <span style="color: #abff4f; font-weight: bold;">${workPercent}%</span>
        </div>
        <div style="background: #0a0a0a; border: 1px solid #333; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: #abff4f; height: 100%; width: ${workPercent}%;"></div>
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">${formatTime(workTime)}</div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Play</span>
          <span style="color: white; font-weight: bold;">${playPercent}%</span>
        </div>
        <div style="background: #0a0a0a; border: 1px solid #333; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: #555; height: 100%; width: ${playPercent}%;"></div>
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">${formatTime(playTime)}</div>
      </div>
    </div>
    
    <div class="sites-header">Work Sites (${analysis.work.length})</div>
    <div class="sites-list" style="max-height: 150px;">
  `;
  
  analysis.work.forEach(site => {
    const siteData = sites[site];
    const time = typeof siteData === 'number' ? siteData : (siteData?.time || 0);
    html += `
      <div class="site" style="border-left: 3px solid #abff4f;">
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
    const siteData = sites[site];
    const time = typeof siteData === 'number' ? siteData : (siteData?.time || 0);
    html += `
      <div class="site" style="border-left: 3px solid #555;">
        <span class="site-name">${site}</span>
        <span class="site-time">${formatTime(time)}</span>
      </div>
    `;
  });
  
  html += `
    </div>
    <button id="back">← Back to Overview</button>
  `;
  
  contentEl.innerHTML = html;
  
  document.getElementById('back').addEventListener('click', () => {
    loadData();
  });
}

loadData();

// Auto-refresh every 2 seconds to show live updates
setInterval(loadData, 2000);