import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        loadData();
        
        // Refresh every 5 seconds
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        try {
            if (window.electronAPI) {
                // Running in Electron - use IPC
                const result = await window.electronAPI.getExtensionData();
                setData(result);
            } else {
                // Fallback for browser testing
                const response = await fetch('http://localhost:3737/data');
                const result = await response.json();
                setData({
                    sites: result.data || {},
                    total: Object.values(result.data || {}).reduce((sum, time) => sum + time, 0),
                });
            }
            setError(null);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    async function handleAnalyze() {
        if (!data?.sites) return;
        
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.analyzeWithAI(data.sites);
                if (result.success) {
                    setAnalysis(result.analysis);
                } else {
                    alert('Analysis failed: ' + result.error);
                }
            } else {
                // Browser fallback with simple classification
                const work = [], play = [];
                const workKeywords = ['github', 'stackoverflow', 'docs', 'gmail', 'notion', 'slack'];
                const playKeywords = ['youtube', 'reddit', 'twitter', 'instagram', 'discord', 'netflix'];
                
                Object.keys(data.sites).forEach(site => {
                    const siteLower = site.toLowerCase();
                    if (workKeywords.some(k => siteLower.includes(k))) work.push(site);
                    else if (playKeywords.some(k => siteLower.includes(k))) play.push(site);
                    else play.push(site);
                });
                
                setAnalysis({ work, play });
            }
        } catch (err) {
            alert('Analysis failed: ' + err.message);
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

    if (loading) {
        return (
            <div className="dashboard loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard error-state">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={loadData}>Retry</button>
            </div>
        );
    }

    const sortedSites = Object.entries(data?.sites || {})
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <p onClick={() => navigate("/onboarding")} className="navButton">
                    ←
                </p>
                <h1>Screen Time Usage</h1>
            </header>

            <div className="stats-grid">
                <div className="stat-card total-time">
                    <div className="stat-value">{formatTime(data?.total || 0)}</div>
                    <div className="stat-label">Total Time Tracked</div>
                </div>

                {data?.currentSite && (
                    <div className="stat-card current-site">
                        <div className="stat-label">Currently Tracking</div>
                        <div className="site-name">{data.currentSite}</div>
                        <div className={`status ${data.isTracking ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            {data.isTracking ? 'Active' : 'Paused'}
                        </div>
                    </div>
                )}

                <div className="stat-card sites-count">
                    <div className="stat-value">{Object.keys(data?.sites || {}).length}</div>
                    <div className="stat-label">Sites Visited</div>
                </div>
            </div>

            {!analysis ? (
                <>
                    <div className="section-header">
                        <h2>All Sites</h2>
                        <button onClick={handleAnalyze} className="analyze-btn">
                            Analyze with AI
                        </button>
                    </div>

                    <div className="sites-list">
                        {sortedSites.length > 0 ? (
                            sortedSites.map(([site, time]) => (
                                <div key={site} className="site-item">
                                    <div className="site-info">
                                        <span className="site-name">{site}</span>
                                        <span className="site-time">{formatTime(time)}</span>
                                    </div>
                                    <div className="site-bar">
                                        <div 
                                            className="site-bar-fill" 
                                            style={{ width: `${(time / data.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No activity yet</p>
                                <p className="empty-subtitle">Start browsing to track time!</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <AnalysisView 
                    analysis={analysis} 
                    sites={data.sites} 
                    total={data.total}
                    onBack={() => setAnalysis(null)}
                    formatTime={formatTime}
                />
            )}
        </div>
    );
}

function AnalysisView({ analysis, sites, total, onBack, formatTime }) {
    const workTime = analysis.work.reduce((sum, site) => sum + (sites[site] || 0), 0);
    const playTime = analysis.play.reduce((sum, site) => sum + (sites[site] || 0), 0);

    const workPercent = total > 0 ? Math.round((workTime / total) * 100) : 0;
    const playPercent = total > 0 ? Math.round((playTime / total) * 100) : 0;

    return (
        <div className="analysis-view">
            <div className="section-header">
                <h2>AI Analysis Results</h2>
                <button onClick={onBack} className="back-btn">← Back</button>
            </div>

            <div className="productivity-breakdown">
                <h3>Productivity Breakdown</h3>
                
                <div className="breakdown-item work">
                    <div className="breakdown-header">
                        <span>Work</span>
                        <span className="percentage">{workPercent}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill work-fill" style={{ width: `${workPercent}%` }}></div>
                    </div>
                    <div className="breakdown-time">{formatTime(workTime)}</div>
                </div>

                <div className="breakdown-item play">
                    <div className="breakdown-header">
                        <span>Play</span>
                        <span className="percentage">{playPercent}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill play-fill" style={{ width: `${playPercent}%` }}></div>
                    </div>
                    <div className="breakdown-time">{formatTime(playTime)}</div>
                </div>
            </div>

            <div className="category-lists">
                <div className="category-section">
                    <h3>Work Sites ({analysis.work.length})</h3>
                    <div className="category-sites">
                        {analysis.work.map(site => (
                            <div key={site} className="category-site-item work-item">
                                <span className="site-name">{site}</span>
                                <span className="site-time">{formatTime(sites[site] || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="category-section">
                    <h3>Play Sites ({analysis.play.length})</h3>
                    <div className="category-sites">
                        {analysis.play.map(site => (
                            <div key={site} className="category-site-item play-item">
                                <span className="site-name">{site}</span>
                                <span className="site-time">{formatTime(sites[site] || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;