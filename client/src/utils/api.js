// ParaOrganizer API Service Wrapper
import * as storage from './storage';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to simulate network latency for high-fidelity animations
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getHeaders = () => {
  const user = storage.getUser();
  return {
    'Content-Type': 'application/json',
    'Authorization': user ? `Bearer ${user.token}` : ''
  };
};

export const api = {
  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  login: async (email, password) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(800);
      const user = {
        email,
        fullName: email.split('@')[0].replace('.', ' '),
        token: `sandbox-jwt-${Date.now()}`
      };
      storage.saveUser(user);
      return { success: true, user };
    } else {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      storage.saveUser(data.user);
      return data;
    }
  },

  signup: async (email, password, fullName) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(900);
      const user = { email, fullName, token: `sandbox-jwt-${Date.now()}` };
      storage.saveUser(user);
      // Initialize onboarding
      storage.saveOnboarding({ isCompleted: false, currentStep: 1 });
      return { success: true, user };
    } else {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      storage.saveUser(data.user);
      storage.saveOnboarding({ isCompleted: false, currentStep: 1 });
      return data;
    }
  },

  logout: async () => {
    storage.saveUser(null);
    return { success: true };
  },

  // =========================================================================
  // CLASSIFICATION LOGS
  // =========================================================================
  fetchLogs: async () => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(400);
      return storage.getLogs();
    } else {
      const res = await fetch(`${API_BASE_URL}/logs`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return await res.json();
    }
  },

  overrideCategory: async (logId, newCategory) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(300);
      const updatedLog = storage.overrideLogCategory(logId, newCategory);
      return { success: true, log: updatedLog };
    } else {
      const res = await fetch(`${API_BASE_URL}/logs/${logId}/override`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ category: newCategory })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to override category');
      return data;
    }
  },

  // =========================================================================
  // NOTION INTEGRATION SETTINGS
  // =========================================================================
  fetchNotionConfig: async () => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(300);
      return storage.getNotionConfig();
    } else {
      const res = await fetch(`${API_BASE_URL}/notion/config`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch Notion config');
      return await res.json();
    }
  },

  saveNotionConfig: async (configData) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(600);
      const currentConfig = storage.getNotionConfig();
      const updatedConfig = { ...currentConfig, ...configData, isConnected: true };
      storage.saveNotionConfig(updatedConfig);
      return { success: true, config: updatedConfig };
    } else {
      const res = await fetch(`${API_BASE_URL}/notion/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(configData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save Notion config');
      return data;
    }
  },

  testConnection: async (token) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(1200);
      if (!token || token.trim() === '') {
        return { success: false, message: 'Invalid or missing API integration key.' };
      }
      return { success: true, message: 'Successfully connected to Notion API!' };
    } else {
      const res = await fetch(`${API_BASE_URL}/notion/test`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      return data;
    }
  },

  initializePARA: async (parentPageId) => {
    const mode = storage.getAppMode();
    if (mode === 'sandbox') {
      await delay(1500);
      const config = storage.getNotionConfig();
      config.parentPageId = parentPageId || 'My Notion Workspace';
      config.inboxDatabaseId = 'Inbox Feed (Generated)';
      config.projectsDatabaseId = 'PARA - Projects DB (Generated)';
      config.areasDatabaseId = 'PARA - Areas DB (Generated)';
      config.resourcesDatabaseId = 'PARA - Resources DB (Generated)';
      config.archivesDatabaseId = 'PARA - Archives DB (Generated)';
      config.isConnected = true;
      storage.saveNotionConfig(config);
      return { success: true, config };
    } else {
      const res = await fetch(`${API_BASE_URL}/notion/init`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ parentPageId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Initialization failed');
      return data;
    }
  },

  // =========================================================================
  // SIMULATION CLIP TRIGGER
  // =========================================================================
  classifyClip: async (title, url) => {
    const mode = storage.getAppMode();
    
    // Auto-predict based on PARA principles inside sandbox
    if (mode === 'sandbox') {
      await delay(1000); // Polling delay
      
      // Basic heuristic to make classification feel intelligent
      let category = 'RESOURCES';
      let reasoning = 'A general knowledge topic of ongoing interest and long-term reference.';
      const lTitle = title.toLowerCase();
      const lUrl = url.toLowerCase();
      
      if (lTitle.includes('project') || lTitle.includes('launch') || lTitle.includes('roadmap') || lTitle.includes('deadline') || lTitle.includes('by') || lTitle.includes('build a') || lTitle.includes('q3') || lTitle.includes('q4') || lTitle.includes('finish')) {
        category = 'PROJECTS';
        reasoning = 'Identified as a short-term effort with a concrete deadline or direct operational output.';
      } else if (lTitle.includes('health') || lTitle.includes('routine') || lTitle.includes('gym') || lTitle.includes('finance') || lTitle.includes('budget') || lTitle.includes('tax') || lTitle.includes('maintenance') || lTitle.includes('rent') || lTitle.includes('ongoing')) {
        category = 'AREAS';
        reasoning = 'Identified as an area of ongoing responsibility requiring continuous operational maintenance.';
      } else if (lTitle.includes('expired') || lTitle.includes('old') || lTitle.includes('archive') || lTitle.includes('2022') || lTitle.includes('2023') || lTitle.includes('former')) {
        category = 'ARCHIVES';
        reasoning = 'Classified as an archived item due to indicators of expiration or historical nature.';
      }
      
      const newLog = storage.addLog(title, url, category, reasoning, 0.93 + Math.random() * 0.05);
      return { success: true, log: newLog };
    } else {
      const res = await fetch(`${API_BASE_URL}/notion/inbox/simulate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Simulated sync failed');
      return data;
    }
  }
};
