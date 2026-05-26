import React, { useMemo } from 'react';
import { Layers, RefreshCw, Cpu, Star, ExternalLink, Calendar } from 'lucide-react';
import * as storage from '../utils/storage';

export default function Dashboard({ logs, stats, appMode }) {
  // Format dates elegantly
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const hours = Math.floor(diffMin / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Pre-process recent sync logs
  const recentLogs = useMemo(() => {
    return logs.slice(0, 5);
  }, [logs]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Workspace Dashboard</h1>
          <p className="page-subtitle">
            AI-powered PARA structuring console. Running in{' '}
            <span style={{
              color: 'var(--accent-primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.05em'
            }}>
              {appMode} mode
            </span>.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="stat-label">
            <Layers size={16} className="stat-icon" />
            <span>Total Organised</span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Items classified into databases
          </p>
        </div>

        <div className="glass-card">
          <div className="stat-label">
            <RefreshCw size={16} className="stat-icon" />
            <span>Notion Poller</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.85rem' }}>
            5m Active
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="status-indicator active" style={{ width: '6px', height: '6px' }}></span>
            Inbox webhook active
          </p>
        </div>

        <div className="glass-card">
          <div className="stat-label">
            <Cpu size={16} className="stat-icon" />
            <span>AI Sorting Accuracy</span>
          </div>
          <div className="stat-value" style={{ color: stats.accuracyRate > 90 ? 'var(--color-areas)' : 'var(--color-resources)' }}>
            {stats.accuracyRate}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Refined via user reclassifications
          </p>
        </div>

        <div className="glass-card">
          <div className="stat-label">
            <Star size={16} className="stat-icon" />
            <span>Last Processed</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem', marginTop: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatTimeAgo(stats.lastSyncTime)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Polling trigger operational
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="dashboard-main-section">
        {/* Left Hand: Category Distribution */}
        <div className="glass-card chart-section ai-glowing">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
            PARA Data Distribution
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Breakdown of items sorted across your central productivity databases.
          </p>

          <div className="chart-bars-container">
            {/* PROJECTS */}
            <div className="chart-bar-item">
              <div className="chart-bar-header">
                <span className="para-badge projects">Projects</span>
                <span style={{ color: 'var(--color-projects)' }}>
                  {stats.counts.PROJECTS} items ({stats.percentages.PROJECTS}%)
                </span>
              </div>
              <div className="chart-bar-bg">
                <div className="chart-bar-fill projects" style={{ width: `${stats.percentages.PROJECTS}%` }}></div>
              </div>
            </div>

            {/* AREAS */}
            <div className="chart-bar-item">
              <div className="chart-bar-header">
                <span className="para-badge areas">Areas</span>
                <span style={{ color: 'var(--color-areas)' }}>
                  {stats.counts.AREAS} items ({stats.percentages.AREAS}%)
                </span>
              </div>
              <div className="chart-bar-bg">
                <div className="chart-bar-fill areas" style={{ width: `${stats.percentages.AREAS}%` }}></div>
              </div>
            </div>

            {/* RESOURCES */}
            <div className="chart-bar-item">
              <div className="chart-bar-header">
                <span className="para-badge resources">Resources</span>
                <span style={{ color: 'var(--color-resources)' }}>
                  {stats.counts.RESOURCES} items ({stats.percentages.RESOURCES}%)
                </span>
              </div>
              <div className="chart-bar-bg">
                <div className="chart-bar-fill resources" style={{ width: `${stats.percentages.RESOURCES}%` }}></div>
              </div>
            </div>

            {/* ARCHIVES */}
            <div className="chart-bar-item">
              <div className="chart-bar-header">
                <span className="para-badge archives">Archives</span>
                <span style={{ color: 'var(--color-archives)' }}>
                  {stats.counts.ARCHIVES} items ({stats.percentages.ARCHIVES}%)
                </span>
              </div>
              <div className="chart-bar-bg">
                <div className="chart-bar-fill archives" style={{ width: `${stats.percentages.ARCHIVES}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Recent Activity Feed */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
            AI Sorting History
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Recently organized items from your browser saves.
          </p>

          <div className="feed-container">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
                const finalCategory = log.isOverridden ? log.overriddenCategory : log.assignedCategory;
                return (
                  <div className="feed-item" key={log.id}>
                    <div className="feed-item-left">
                      <div className="feed-item-title" title={log.title}>
                        {log.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}>
                        <span className="feed-item-time" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Calendar size={10} />
                          {formatTimeAgo(log.createdAt)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', color: 'var(--text-muted)' }}
                        >
                          <span>link</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                    <span className={`para-badge ${finalCategory.toLowerCase()}`}>
                      {finalCategory}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 0' }}>
                No active sync logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
