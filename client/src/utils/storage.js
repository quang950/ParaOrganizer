// ParaOrganizer LocalStorage Sandbox State Management

const STORAGE_KEYS = {
  LOGS: 'para_logs',
  CONFIG: 'para_config',
  USER: 'para_user',
  ONBOARDING: 'para_onboarding',
  MODE: 'para_app_mode'
};

const DEFAULT_LOGS = [
  {
    id: 'log-1',
    title: 'Q3 Marketing Strategy and Product Roadmap',
    url: 'https://linear.app/paraorganizer/documents/q3-roadmap',
    contentSnippet: 'Outline of marketing channels, campaign deadlines, and product features scheduled for release by end of Q3 2026.',
    assignedCategory: 'PROJECTS',
    reasoning: 'Focuses on a short-term effort with a concrete deadline (Q3 2026).',
    confidence: 0.96,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-25T14:20:00.000Z'
  },
  {
    id: 'log-2',
    title: 'Building a Custom Compiler in Rust',
    url: 'https://rust-lang.github.io/compiler-design',
    contentSnippet: 'A comprehensive educational guide outlining parser design, tokenization, AST generation, and LLVM compilation in Rust.',
    assignedCategory: 'RESOURCES',
    reasoning: 'A topic of ongoing learning value and technical research with no set deadline.',
    confidence: 0.94,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-25T12:05:00.000Z'
  },
  {
    id: 'log-3',
    title: 'Monthly Gym Routine & Nutrition Tracker',
    url: 'https://myfitnesspal.com/diary/member',
    contentSnippet: 'Strength training routine split, daily caloric intake targets, macro distribution, and recovery protocol.',
    assignedCategory: 'AREAS',
    reasoning: 'Represents an ongoing life responsibility (health and fitness) requiring regular maintenance.',
    confidence: 0.92,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-25T09:30:00.000Z'
  },
  {
    id: 'log-4',
    title: 'Tenant Lease Agreement (Expired May 2024)',
    url: 'https://dropbox.com/s/apartment-4b-lease-expired.pdf',
    contentSnippet: 'Residential tenancy contract for apartment 4B. Covers term, security deposit, utilities, and expired renewal clauses.',
    assignedCategory: 'ARCHIVES',
    reasoning: 'Contains historical records of a past responsibility that is no longer active.',
    confidence: 0.89,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-24T16:45:00.000Z'
  },
  {
    id: 'log-5',
    title: 'Self-Employed Tax Return Filings 2025',
    url: 'https://irs.gov/payments/individual-taxpayer-portal',
    contentSnippet: 'Completed schedule C, deductions receipts, quarterly estimated tax payment receipts, and IRS approval records.',
    assignedCategory: 'AREAS',
    reasoning: 'Relates to the ongoing administrative area of financial and legal tax responsibility.',
    confidence: 0.95,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-24T10:15:00.000Z'
  },
  {
    id: 'log-6',
    title: 'Figma UI Library & Design Tokens',
    url: 'https://figma.com/file/paraorganizer-design-system',
    contentSnippet: 'Component definitions for inputs, glass buttons, charts, typography scales, and HSL dark themes.',
    assignedCategory: 'RESOURCES',
    reasoning: 'A library of creative assets and tools for continuous future design projects.',
    confidence: 0.97,
    isOverridden: false,
    overriddenCategory: null,
    createdAt: '2026-05-23T18:30:00.000Z'
  }
];

const DEFAULT_CONFIG = {
  notionToken: 'secret_notion_api_key_sandbox_mode',
  parentPageId: 'ParaOrganizer Workspace Parent',
  inboxDatabaseId: 'Inbox Feed',
  projectsDatabaseId: 'PARA - Projects Database',
  areasDatabaseId: 'PARA - Areas Database',
  resourcesDatabaseId: 'PARA - Resources Database',
  archivesDatabaseId: 'PARA - Archives Database',
  isConnected: true,
  lastSynced: '2026-05-25T15:00:00.000Z'
};

const DEFAULT_USER = {
  email: 'founder@paraorganizer.ai',
  fullName: 'Alex Organizer',
  token: 'sandbox-jwt-session'
};

const DEFAULT_ONBOARDING = {
  isCompleted: true,
  currentStep: 3
};

// Initialize Storage if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ONBOARDING)) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(DEFAULT_ONBOARDING));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODE)) {
    localStorage.setItem(STORAGE_KEYS.MODE, 'sandbox');
  }
};

// Mode getters & setters
export const getAppMode = () => {
  return localStorage.getItem(STORAGE_KEYS.MODE) || 'sandbox';
};

export const setAppMode = (mode) => {
  localStorage.setItem(STORAGE_KEYS.MODE, mode);
};

// User Profile Actions
export const getUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

// Onboarding State
export const getOnboarding = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
  return data ? JSON.parse(data) : { isCompleted: false, currentStep: 1 };
};

export const saveOnboarding = (state) => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(state));
};

// Notion Configuration Settings
export const getNotionConfig = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return data ? JSON.parse(data) : {
    notionToken: '',
    parentPageId: '',
    inboxDatabaseId: '',
    projectsDatabaseId: '',
    areasDatabaseId: '',
    resourcesDatabaseId: '',
    archivesDatabaseId: '',
    isConnected: false,
    lastSynced: null
  };
};

export const saveNotionConfig = (config) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// Classification Logs Actions
export const getLogs = () => {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs) => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

// Insert a simulated or real log
export const addLog = (title, url, assignedCategory, reasoning, confidence) => {
  const logs = getLogs();
  const newLog = {
    id: `log-${Date.now()}`,
    title,
    url: url || 'https://paraorganizer.ai',
    contentSnippet: `Custom saved clip of '${title}' processed via ParaOrganizer AI engine.`,
    assignedCategory,
    reasoning,
    confidence: parseFloat(confidence || 0.95),
    isOverridden: false,
    overriddenCategory: null,
    createdAt: new Date().toISOString()
  };
  
  logs.unshift(newLog);
  saveLogs(logs);
  return newLog;
};

// Manually override / re-classify a log
export const overrideLogCategory = (id, newCategory) => {
  const logs = getLogs();
  const logIndex = logs.findIndex(l => l.id === id);
  if (logIndex !== -1) {
    const log = logs[logIndex];
    if (log.assignedCategory === newCategory) {
      log.isOverridden = false;
      log.overriddenCategory = null;
    } else {
      log.isOverridden = true;
      log.overriddenCategory = newCategory;
    }
    logs[logIndex] = log;
    saveLogs(logs);
    return log;
  }
  return null;
};

// Get Dashboard Statistics
export const getStats = () => {
  const logs = getLogs();
  const total = logs.length;
  
  // Category counting (accounting for overrides)
  const counts = {
    PROJECTS: 0,
    AREAS: 0,
    RESOURCES: 0,
    ARCHIVES: 0
  };
  
  let overriddenCount = 0;
  
  logs.forEach(log => {
    const finalCategory = log.isOverridden ? log.overriddenCategory : log.assignedCategory;
    if (counts[finalCategory] !== undefined) {
      counts[finalCategory]++;
    }
    if (log.isOverridden) {
      overriddenCount++;
    }
  });
  
  // Calculate accuracy based on overridden feedback loops
  const accuracyRate = total > 0 ? Math.round(((total - overriddenCount) / total) * 100) : 100;
  
  // Percentages distribution
  const percentages = {
    PROJECTS: total > 0 ? Math.round((counts.PROJECTS / total) * 100) : 0,
    AREAS: total > 0 ? Math.round((counts.AREAS / total) * 100) : 0,
    RESOURCES: total > 0 ? Math.round((counts.RESOURCES / total) * 100) : 0,
    ARCHIVES: total > 0 ? Math.round((counts.ARCHIVES / total) * 100) : 0
  };

  return {
    total,
    counts,
    percentages,
    accuracyRate,
    lastSyncTime: total > 0 ? logs[0].createdAt : new Date().toISOString()
  };
};

// Clean Reset Database (For demo purposes)
export const resetToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(DEFAULT_ONBOARDING));
  localStorage.setItem(STORAGE_KEYS.MODE, 'sandbox');
};
