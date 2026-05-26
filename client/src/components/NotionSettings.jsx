import React, { useState } from 'react';
import { Database, Key, Check, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';

export default function NotionSettings({ config, setConfig, addToast }) {
  const [notionToken, setNotionToken] = useState(config.notionToken || '');
  const [parentPageId, setParentPageId] = useState(config.parentPageId || '');
  const [inboxDatabaseId, setInboxDatabaseId] = useState(config.inboxDatabaseId || '');
  const [projectsDatabaseId, setProjectsDatabaseId] = useState(config.projectsDatabaseId || '');
  const [areasDatabaseId, setAreasDatabaseId] = useState(config.areasDatabaseId || '');
  const [resourcesDatabaseId, setResourcesDatabaseId] = useState(config.resourcesDatabaseId || '');
  const [archivesDatabaseId, setArchivesDatabaseId] = useState(config.archivesDatabaseId || '');
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const handleTestConnection = async () => {
    if (!notionToken) {
      addToast('Please enter an integration key.', 'error');
      return;
    }
    setTesting(true);
    try {
      const res = await api.testConnection(notionToken);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err) {
      addToast(err.message || 'Connection test failed.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const settings = {
        notionToken,
        parentPageId,
        inboxDatabaseId,
        projectsDatabaseId,
        areasDatabaseId,
        resourcesDatabaseId,
        archivesDatabaseId
      };
      const res = await api.saveNotionConfig(settings);
      if (res.success) {
        setConfig(res.config);
        addToast('Notion integration settings saved successfully!', 'success');
      } else {
        addToast('Failed to save settings.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDatabases = async () => {
    if (!notionToken) {
      addToast('Set Notion Integration Key before generating databases.', 'error');
      return;
    }
    setInitializing(true);
    try {
      const res = await api.initializePARA(parentPageId || 'My Notion Workspace');
      if (res.success) {
        setConfig(res.config);
        // Map states locally
        setInboxDatabaseId(res.config.inboxDatabaseId);
        setProjectsDatabaseId(res.config.projectsDatabaseId);
        setAreasDatabaseId(res.config.areasDatabaseId);
        setResourcesDatabaseId(res.config.resourcesDatabaseId);
        setArchivesDatabaseId(res.config.archivesDatabaseId);
        setParentPageId(res.config.parentPageId);
        addToast('Notion databases provisioned and mapped successfully!', 'success');
      } else {
        addToast('Failed to initialize Notion workspace databases.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error occurred while provisioning workspace.', 'error');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Notion Integration Settings</h1>
          <p className="page-subtitle">Configure your secure API credentials and map your structural PARA database schema.</p>
        </div>
      </div>

      <div className="settings-section">
        {/* Left Side: Mapping Form */}
        <form onSubmit={handleSaveSettings} className="glass-card ai-glowing" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} style={{ color: 'var(--accent-primary)' }} />
            Integration Credentials
          </h3>

          <div className="form-group">
            <label>Internal Integration Secret Token</label>
            <input
              type="password"
              placeholder="secret_••••••••••••••••••••••••••••••••"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Created at notion.so/my-integrations. Ensure it has "Read content" and "Insert/Update content" permissions.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button type="button" onClick={handleTestConnection} className="btn btn-secondary" disabled={testing}>
              {testing ? 'Verifying Token...' : 'Test Connection Secret'}
            </button>
          </div>

          <h3 style={{ fontSize: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--accent-primary)' }} />
            Notion Target Schema Mapping
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Choose the target Notion databases for matching incoming items. If you haven't structured these databases yet, use our **One-Click Builder** on the right side.
          </p>

          <div className="form-group">
            <label>Parent Workspace Page</label>
            <input
              type="text"
              placeholder="e.g. My Productivity Space"
              value={parentPageId}
              onChange={(e) => setParentPageId(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="settings-mapping-grid">
            <div className="form-group">
              <label>Inbox Database (Polling Target)</label>
              <input
                type="text"
                placeholder="Database ID or Name"
                value={inboxDatabaseId}
                onChange={(e) => setInboxDatabaseId(e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Projects Database (PARA)</label>
              <input
                type="text"
                placeholder="Database ID or Name"
                value={projectsDatabaseId}
                onChange={(e) => setProjectsDatabaseId(e.target.value)}
                className="form-input"
                style={{ borderLeft: '3px solid var(--color-projects)' }}
              />
            </div>

            <div className="form-group">
              <label>Areas Database (PARA)</label>
              <input
                type="text"
                placeholder="Database ID or Name"
                value={areasDatabaseId}
                onChange={(e) => setAreasDatabaseId(e.target.value)}
                className="form-input"
                style={{ borderLeft: '3px solid var(--color-areas)' }}
              />
            </div>

            <div className="form-group">
              <label>Resources Database (PARA)</label>
              <input
                type="text"
                placeholder="Database ID or Name"
                value={resourcesDatabaseId}
                onChange={(e) => setResourcesDatabaseId(e.target.value)}
                className="form-input"
                style={{ borderLeft: '3px solid var(--color-resources)' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Archives Database (PARA)</label>
              <input
                type="text"
                placeholder="Database ID or Name"
                value={archivesDatabaseId}
                onChange={(e) => setArchivesDatabaseId(e.target.value)}
                className="form-input"
                style={{ borderLeft: '3px solid var(--color-archives)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Mappings...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {/* Right Side: Setup Status Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Box */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Schema Connection Status</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>API Connection</span>
                <span className="status-badge">
                  <span className={`status-indicator ${config.isConnected ? 'active' : 'inactive'}`}></span>
                  {config.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Inbox Database</span>
                <span style={{ fontWeight: 600, color: inboxDatabaseId ? 'var(--color-areas)' : 'var(--color-projects)' }}>
                  {inboxDatabaseId ? 'MAPPED' : 'UNMAPPED'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PARA Mappings</span>
                <span style={{ fontWeight: 600, color: (projectsDatabaseId && areasDatabaseId && resourcesDatabaseId && archivesDatabaseId) ? 'var(--color-areas)' : 'var(--color-resources)' }}>
                  {(projectsDatabaseId && areasDatabaseId && resourcesDatabaseId && archivesDatabaseId) ? 'FULLY SYNCED' : 'INCOMPLETE'}
                </span>
              </div>

              {config.lastSynced && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Polled Sync</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <RefreshCw size={10} />
                    {new Date(config.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Database Setup Generator Box */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Info size={16} style={{ color: 'var(--accent-primary)' }} />
              Quick Workspace Provisioner
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Don't have structured PARA databases or an Inbox page configured in Notion yet?
              Click below to generate all necessary structures dynamically inside your Notion environment with fully initialized property schemas.
            </p>
            
            <button
              type="button"
              onClick={handleInitializeDatabases}
              className="btn btn-secondary"
              style={{ width: '100%', display: 'flex', gap: '0.5rem' }}
              disabled={initializing}
            >
              {initializing ? (
                <>
                  <div className="sim-loader-spinner" style={{ width: '14px', height: '14px' }}></div>
                  <span>Provisioning databases...</span>
                </>
              ) : (
                <>
                  <Database size={14} />
                  <span>Auto-Initialize Workspace</span>
                </>
              )}
            </button>
          </div>

          {/* Security Alert Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-resources)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-resources)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} />
              Privacy & Security
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              All Notion tokens are stored locally on your device (in Sandbox mode) or highly encrypted in PostgreSQL using AES-256 (in Production mode) guarded by strict Row-Level Security policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
