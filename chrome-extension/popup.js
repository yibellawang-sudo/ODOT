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
  //update status
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
      <div class="pulse" style="background: #e94560;"></div>
      <span>Not tracking (no active tab)</span>
    `;
  }
  
  //build content
  let html = `
    <div class="total">${formatTime(response.total)}</div>
    <div class="total-label">Total time tracked</div>
  `;
  
  //show current site
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
  
  //show all sites
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
  
  document.getElementById('content').innerHTML = html;
  
  //reset button
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Reset all tracking data? This cannot be undone.')) {
      chrome.runtime.sendMessage({ action: 'reset' }, () => {
        loadData(); //reload instead of full page refresh
      });
    }
  });
}

loadData();

//auto-refresh every 2 seconds to show live updates
setInterval(loadData, 2000);