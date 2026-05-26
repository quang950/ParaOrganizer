import React, { useState } from 'react';
import { ArrowRight, Check, Key, Database, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import * as storage from '../utils/storage';

export default function Onboarding({ user, onComplete, addToast }) {
  const onboardingState = storage.getOnboarding();
  const [step, setStep] = useState(onboardingState.currentStep || 1);
  const [notionToken, setNotionToken] = useState('');
  const [parentPage, setParentPage] = useState('My Notion Workspace');
  const [testing, setTesting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [initSuccess, setInitSuccess] = useState(false);
  const [initSteps, setInitSteps] = useState([
    { name: 'Preparing workspace target page', status: 'pending' },
    { name: 'Provisioning "Projects" database structure', status: 'pending' },
    { name: 'Provisioning "Areas" database structure', status: 'pending' },
    { name: 'Provisioning "Resources" database structure', status: 'pending' },
    { name: 'Provisioning "Archives" database structure', status: 'pending' },
    { name: 'Establishing sync polling pipeline hooks', status: 'pending' }
  ]);

  const handleTestConnection = async () => {
    if (!notionToken.trim()) {
      setError('Please input a valid Integration Token.');
      return;
    }
    setError('');
    setTesting(true);
    try {
      const res = await api.testConnection(notionToken);
      if (res.success) {
        addToast(res.message, 'success');
        // Save current configuration partially
        await api.saveNotionConfig({ notionToken });
        // Progress to next step
        const nextStep = 3;
        setStep(nextStep);
        storage.saveOnboarding({ isCompleted: false, currentStep: nextStep });
      } else {
        setError(res.message || 'Notion rejected the API credentials.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while verifying token.');
    } finally {
      setTesting(false);
    }
  };

  const handleInitializeDatabases = async () => {
    setError('');
    setInitializing(true);
    
    // Animate individual step creation for immersive high-fidelity experience
    for (let i = 0; i < initSteps.length; i++) {
      setInitSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'active' } : s));
      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 200));
      setInitSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
    }

    try {
      const res = await api.initializePARA(parentPage);
      if (res.success) {
        setInitSuccess(true);
        addToast('PARA Framework provisioned in Notion!', 'success');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Complete Onboarding
        storage.saveOnboarding({ isCompleted: true, currentStep: 3 });
        onComplete();
      } else {
        setError('Failed to configure target PARA databases.');
      }
    } catch (err) {
      setError(err.message || 'Failed during database provisioning.');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Step Indicator */}
        <div className="onboarding-steps">
          <div className={`onboarding-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            {step > 1 ? <Check size={16} /> : '1'}
          </div>
          <div className={`onboarding-step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            {step > 2 ? <Check size={16} /> : '2'}
          </div>
          <div className={`onboarding-step-indicator ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            {step > 3 ? <Check size={16} /> : '3'}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="onboarding-body">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Welcome to ParaOrganizer, {user.fullName.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Get ready to transform your scattered web clips, random bookmarks, and thoughts into a perfectly sorted digital workspace using the legendary **PARA method**.
            </p>
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--border-glow)', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Sparkles size={16} className="stat-icon" /> How ParaOrganizer Works:
              </h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <li>📥 **Save Page:** Send articles, clips, and receipts to a central "Inbox".</li>
                <li>🧠 **AI Organizes:** Our LLM classifies them into Projects, Areas, Resources, or Archives.</li>
                <li>📤 **Notion Synced:** Matched items are instantly structured in your Notion workspace.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setStep(2);
                  storage.saveOnboarding({ isCompleted: false, currentStep: 2 });
                }}
                className="btn btn-primary"
              >
                <span>Connect Notion Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-body">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Key style={{ color: 'var(--accent-primary)' }} />
              Integrate Notion API
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Create an Integration in Notion at <a href="https://notion.so/my-integrations" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>notion.so/my-integrations</a>, authorize it to access your target page, and paste the Secret Key below.
            </p>

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--color-projects)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>Internal Integration Secret Key</label>
              <input
                type="password"
                placeholder="secret_••••••••••••••••••••••••••••••••"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                disabled={testing}
              />
            </div>

            <div className="onboarding-footer">
              <button onClick={() => setStep(1)} className="btn btn-secondary" disabled={testing}>
                Back
              </button>
              <button onClick={handleTestConnection} className="btn btn-primary" disabled={testing}>
                {testing ? (
                  <>
                    <div className="sim-loader-spinner" style={{ width: '14px', height: '14px' }}></div>
                    <span>Verifying Token...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Connection</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-body">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database style={{ color: 'var(--accent-primary)' }} />
              Provision PARA Schema
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              We will now initialize your target Notion workspace page with a core "Inbox" tracker database and the four structured PARA tables.
            </p>

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--color-projects)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!initializing && !initSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Notion Parent Page Title / Name</label>
                  <input
                    type="text"
                    value={parentPage}
                    onChange={(e) => setParentPage(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ParaOrganizer will generate its databases as sub-components under this parent.
                  </span>
                </div>
                <button onClick={handleInitializeDatabases} className="btn btn-primary" style={{ width: '100%' }}>
                  <span>Initialize PARA Databases in Notion</span>
                  <Database size={16} />
                </button>
              </div>
            ) : (
              <div className="sim-loader-wrapper" style={{ margin: '1rem 0' }}>
                {initSteps.map((s, idx) => (
                  <div key={idx} className={`sim-loader-step ${s.status}`}>
                    {s.status === 'pending' && <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)' }} />}
                    {s.status === 'active' && <div className="sim-loader-spinner" style={{ width: '12px', height: '12px' }}></div>}
                    {s.status === 'completed' && <Check size={14} style={{ color: 'var(--color-areas)' }} />}
                    <span style={{
                      color: s.status === 'completed' ? 'var(--text-primary)' :
                             s.status === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: s.status === 'active' ? '600' : 'normal'
                    }}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {initSuccess && (
              <div style={{ color: 'var(--color-areas)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                🎉 Success! Notion databases initialized. Launching console...
              </div>
            )}

            {!initializing && !initSuccess && (
              <div className="onboarding-footer" style={{ marginTop: '1.5rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary">
                  Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
