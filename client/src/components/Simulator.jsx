import React, { useState } from 'react';
import { Cpu, X, Sparkles, PlusCircle, Check, Send } from 'lucide-react';
import { api } from '../utils/api';

export default function Simulator({ onNewLogCreated, addToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStep, setSyncStep] = useState(0); // 0: Idle, 1: Polling Inbox, 2: LLM Classifying, 3: Notion syncing, 4: Finished

  const presets = [
    { title: 'Finish Q4 Revenue Launch Roadmap', url: 'https://linear.app/tasks/q4-roadmap' },
    { title: 'React 19 Server Components deep-dive', url: 'https://react.dev/blog/react-19' },
    { title: 'Home Rent & Utility Monthly Budget 2026', url: 'https://ynab.com/budget' },
    { title: 'IRS Tax filings & Receipts 2021 (Expired)', url: 'https://dropbox.com/taxes-2021.pdf' }
  ];

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setUrl(preset.url);
  };

  const handleSimulateSync = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      addToast('Please enter both Title and URL.', 'error');
      return;
    }

    setLoading(true);
    
    // Step 1: Detect Inbox Item
    setSyncStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: LLM Processing
    setSyncStep(2);
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    // Step 3: Notion Database Synced
    setSyncStep(3);
    try {
      const res = await api.classifyClip(title, url);
      if (res.success) {
        // Step 4: Completed
        setSyncStep(4);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        onNewLogCreated(res.log);
        addToast(`Page classified as ${res.log.assignedCategory}! Synced to Notion.`, 'success');
        
        // Reset fields
        setTitle('');
        setUrl('');
      } else {
        addToast('Simulation classification engine error.', 'error');
        setSyncStep(0);
      }
    } catch (err) {
      addToast(err.message || 'Error executing simulated classification.', 'error');
      setSyncStep(0);
    } finally {
      setLoading(false);
      // Wait a moment and reset step to idle
      setTimeout(() => {
        setSyncStep(0);
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating activation button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sim-toggle-btn"
        title="Toggle Interactive AI Simulation Center"
      >
        {isOpen ? <X size={24} /> : <Cpu size={24} />}
      </button>

      {/* Floating Simulation Console */}
      {isOpen && (
        <div className="sim-panel">
          <div className="sim-header">
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-secondary)' }} />
              AI Simulation Console
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SANDBOX TESTING</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Test the AI sorting system by simulating a user saving a webpage to their Notion **Inbox**. Select a preset or input your own.
            </p>

            {/* Presets Row */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLIPS PRESETS:</div>
            <div className="sim-presets-row">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="sim-preset-btn"
                  title={preset.title}
                >
                  {preset.title.length > 25 ? preset.title.slice(0, 22) + '...' : preset.title}
                </button>
              ))}
            </div>

            {/* Simulated Form */}
            <form onSubmit={handleSimulateSync} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Webpage Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master React 19 Design Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Webpage Bookmark URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/learn-react"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', height: '36px', fontSize: '0.8rem' }}
              >
                {loading ? (
                  <span>Active Sync Operation...</span>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Save Web Clip to Inbox</span>
                  </>
                )}
              </button>
            </form>

            {/* Step-by-Step Simulation Checklists */}
            {syncStep > 0 && (
              <div className="sim-loader-wrapper">
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.25rem' }}>
                  SYNC PIPELINE TRACKER
                </div>
                
                {/* Step 1 */}
                <div className={`sim-loader-step ${syncStep >= 1 ? (syncStep > 1 ? 'completed' : 'active') : ''}`}>
                  {syncStep === 1 ? <div className="sim-loader-spinner" style={{ width: '10px', height: '10px' }} /> : (syncStep > 1 ? <Check size={12} style={{ color: 'var(--color-areas)' }} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />)}
                  <span>Inbox listener detected new save</span>
                </div>

                {/* Step 2 */}
                <div className={`sim-loader-step ${syncStep >= 2 ? (syncStep > 2 ? 'completed' : 'active') : ''}`}>
                  {syncStep === 2 ? <div className="ai-pulse-orb" /> : (syncStep > 2 ? <Check size={12} style={{ color: 'var(--color-areas)' }} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />)}
                  <span>AI evaluation engine classifying</span>
                </div>

                {/* Step 3 */}
                <div className={`sim-loader-step ${syncStep >= 3 ? (syncStep > 3 ? 'completed' : 'active') : ''}`}>
                  {syncStep === 3 ? <div className="sim-loader-spinner" style={{ width: '10px', height: '10px' }} /> : (syncStep > 3 ? <Check size={12} style={{ color: 'var(--color-areas)' }} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />)}
                  <span>Writing properties to Notion DB</span>
                </div>

                {/* Step 4 */}
                <div className={`sim-loader-step ${syncStep >= 4 ? 'completed' : ''}`}>
                  {syncStep === 4 && <Check size={12} style={{ color: 'var(--color-areas)' }} />}
                  <span style={{ fontWeight: syncStep === 4 ? 600 : 'normal' }}>Complete! Database synced.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
