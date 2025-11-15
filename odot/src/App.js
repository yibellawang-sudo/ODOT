import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [extensionData, setExtensionData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExtensionData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadExtensionData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadExtensionData() {
    try {
      // Get data from Chrome extension via IPC
      const data = await window.electronAPI.getExtensionData();
      setExtensionData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load extension data: ' + err.message);
    }
  }

  async function analyzeWithAI() {
    if (!extensionData || !extensionData.sites) return;
    
    setLoading(true);
    try {
      const result = await window.electronAPI.analyzeWithAI(extensionData.sites);
      if (result.success) {
        setAnalysis(result.analysis);
        setError(null);
      } else {
        setError('AI Analysis failed: ' + result.error);
      }
    } catch (err) {
      setError('Analysis error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.floor((minutes % 1) * 60);
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'black',
      color: 'white',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px 0' }}>
            ODOT Dashboard
          </h1>
          <p style={{ color: '#888', fontSize: '18px' }}>
            Analyzing your browsing habits with AI
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#888',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        {/* Current Stats */}
        {extensionData && (
          <div style={{
            background: '#16213e',
            padding: '32px',
            borderRadius: '16px',
            marginBottom: '32px',
            border: '2px solid #0f3460'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              {/* Total Time */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                  Total Time Tracked
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                  {formatTime(extensionData.total || 0)}
                </div>
              </div>

              {/* Sites Count */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                  Sites Visited
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                  {Object.keys(extensionData.sites || {}).length}
                </div>
              </div>

              {/* Current Site */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                  Currently On
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                  {extensionData.currentSite || 'None'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Button */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={analyzeWithAI}
            disabled={loading || !extensionData}
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: loading ? '#888' : 'white',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {loading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>

        {/* AI Analysis Results */}
        {analysis && (
          <div style={{
            background: '#16213e',
            padding: '32px',
            borderRadius: '16px',
            marginBottom: '32px',
            border: '2px solid white'
          }}>
            <h2 style={{ marginTop: 0, textAlign: 'center', fontSize: '32px' }}>
              AI Analysis Results
            </h2>

            {/* Work vs Play Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Work Stats */}
              <div style={{
                background: '#0f3460',
                padding: '24px',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>Work Sites</div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '888' }}>
                  {analysis.work.length}
                </div>
                <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
                  {formatTime(
                    analysis.work.reduce((total, site) => 
                      total + (extensionData.sites[site] || 0), 0
                    )
                  )}
                </div>
              </div>

              {/* Play Stats */}
              <div style={{
                background: '#0f3460',
                padding: '24px',
                borderRadius: '12px',
                borderLeft: '4px solid white'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>Play Sites</div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'black' }}>
                  {analysis.play.length}
                </div>
                <div style={{ fontSize: '18px', color: '#888', marginTop: '8px' }}>
                  {formatTime(
                    analysis.play.reduce((total, site) => 
                      total + (extensionData.sites[site] || 0), 0
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Site Lists */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              {/* Work Sites List */}
              <div>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>
                  Work Sites ({analysis.work.length})
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {analysis.work.map(site => (
                    <div key={site} style={{
                      background: 'black',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>{site}</span>
                      <span style={{ color: 'black', fontWeight: 'bold' }}>
                        {formatTime(extensionData.sites[site] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Play Sites List */}
              <div>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>
                  🎮 Play Sites ({analysis.play.length})
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {analysis.play.map(site => (
                    <div key={site} style={{
                      background: '#0f3460',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderLeft: '3px solid #888'
                    }}>
                      <span>{site}</span>
                      <span style={{ color: '#888', fontWeight: 'bold' }}>
                        {formatTime(extensionData.sites[site] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Sites Table */}
        {extensionData && extensionData.sites && (
          <div style={{
            background: '#black',
            padding: '32px',
            borderRadius: '16px',
            border: '2px solid #black'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '24px', marginBottom: '24px' }}>
              All Tracked Sites
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.entries(extensionData.sites)
                .sort((a, b) => b[1] - a[1])
                .map(([site, time]) => (
                  <div key={site} style={{
                    background: 'black',
                    padding: '16px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '16px' }}>{site}</span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#888'
                    }}>
                      {formatTime(time)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!extensionData && !error && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#888'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>
              Waiting for extension data...
            </div>
            <div style={{ fontSize: '16px' }}>
              Make sure the Chrome extension is installed and tracking
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;