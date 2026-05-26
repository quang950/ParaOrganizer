// ParaOrganizer Express API Backend Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateConnection, initializePARASchema, pollAndSyncInbox } from './services/notion.js';
import { classifyPage } from './services/llm.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body Parsing
app.use(cors());
app.use(express.json());

// =========================================================================
// RESILIENT IN-MEMORY DEV DATABASE
// =========================================================================
// Fallback if Postgres/Supabase keys are not set, ensuring zero-friction local tests
const MOCK_DB = {
  users: [
    { id: 'user-default', email: 'founder@paraorganizer.ai', fullName: 'Alex Organizer' }
  ],
  notionConfigs: {
    'user-default': {
      notionToken: 'secret_notion_api_key_sandbox_mode',
      parentPageId: 'ParaOrganizer Workspace Parent',
      inboxDatabaseId: 'Inbox Feed',
      projectsDatabaseId: 'PARA - Projects Database',
      areasDatabaseId: 'PARA - Areas Database',
      resourcesDatabaseId: 'PARA - Resources Database',
      archivesDatabaseId: 'PARA - Archives Database',
      isConnected: true,
      lastSynced: new Date().toISOString()
    }
  },
  logs: [
    {
      id: 'log-backend-1',
      title: 'Backend Design Specs & Express Router',
      url: 'https://expressjs.com/en/guide/routing.html',
      contentSnippet: 'Guide on routing models, parameter parsing, and middleware binding in modern Express applications.',
      assignedCategory: 'RESOURCES',
      reasoning: 'Focuses on structural learning documentation of indefinite timeline value.',
      confidence: 0.94,
      isOverridden: false,
      overriddenCategory: null,
      createdAt: new Date(Date.now() - 3600000).toISOString() // 1h ago
    },
    {
      id: 'log-backend-2',
      title: 'Deploy Express API server to Heroku',
      url: 'https://heroku.com/deploy/express',
      contentSnippet: 'Deployment checklist, Procfile configurations, and environment secrets management instructions.',
      assignedCategory: 'PROJECTS',
      reasoning: 'Represents a discrete deployment action with an imminent concrete release goal.',
      confidence: 0.97,
      isOverridden: false,
      overriddenCategory: null,
      createdAt: new Date(Date.now() - 7200000).toISOString() // 2h ago
    }
  ]
};

// =========================================================================
// ROUTES: AUTHENTICATION
// =========================================================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Find user
  const user = MOCK_DB.users.find(u => u.email === email) || {
    id: `user-${Date.now()}`,
    email,
    fullName: email.split('@')[0]
  };

  return res.json({
    success: true,
    user: {
      ...user,
      token: `jwt-session-${user.id}`
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newUser = { id: `user-${Date.now()}`, email, fullName };
  MOCK_DB.users.push(newUser);

  return res.json({
    success: true,
    user: {
      ...newUser,
      token: `jwt-session-${newUser.id}`
    }
  });
});

// =========================================================================
// ROUTES: CLASSIFICATION LOGS
// =========================================================================
app.get('/api/logs', (req, res) => {
  // Sort logs by newest first
  const sortedLogs = [...MOCK_DB.logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json(sortedLogs);
});

app.patch('/api/logs/:id/override', (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ message: 'Target category is required.' });
  }

  const logIndex = MOCK_DB.logs.findIndex(l => l.id === id);
  if (logIndex === -1) {
    return res.status(404).json({ message: 'Sync log not found.' });
  }

  const log = MOCK_DB.logs[logIndex];
  if (log.assignedCategory === category) {
    log.isOverridden = false;
    log.overriddenCategory = null;
  } else {
    log.isOverridden = true;
    log.overriddenCategory = category;
  }

  MOCK_DB.logs[logIndex] = log;
  return res.json({ success: true, log });
});

// =========================================================================
// ROUTES: NOTION CONFIGURATIONS & HEALTH CHECKS
// =========================================================================
app.get('/api/notion/config', (req, res) => {
  // Hardcoded to default user session for ease of local tests
  const config = MOCK_DB.notionConfigs['user-default'] || {
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
  return res.json(config);
});

app.post('/api/notion/config', (req, res) => {
  const configData = req.body;
  
  MOCK_DB.notionConfigs['user-default'] = {
    ...MOCK_DB.notionConfigs['user-default'],
    ...configData,
    isConnected: true
  };

  return res.json({
    success: true,
    config: MOCK_DB.notionConfigs['user-default']
  });
});

app.post('/api/notion/test', async (req, res) => {
  const { token } = req.body;
  const result = await validateConnection(token);
  return res.json(result);
});

app.post('/api/notion/init', async (req, res) => {
  const { parentPageId } = req.body;
  const config = MOCK_DB.notionConfigs['user-default'] || {};
  
  try {
    const result = await initializePARASchema(config.notionToken, parentPageId);
    if (result.success) {
      MOCK_DB.notionConfigs['user-default'] = {
        ...config,
        ...result.config,
        isConnected: true
      };
      return res.json({ success: true, config: MOCK_DB.notionConfigs['user-default'] });
    } else {
      return res.status(400).json({ message: 'Notion databases initialization failed.' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// ROUTES: SIMULATION TRIGGERS
// =========================================================================
app.post('/api/notion/inbox/simulate', async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: 'Webpage title and URL are required.' });
  }

  try {
    console.log(`📡 Simulating Notion clip webhook for "${title}"...`);
    
    // 1. Process Classification via AI Engine (Gemini / OpenAI or regex heuristic)
    const classification = await classifyPage(title, url);
    
    // 2. Save log record
    const newLog = {
      id: `log-backend-${Date.now()}`,
      title,
      url,
      contentSnippet: `Page bookmark of ${title} saved in Notion Inbox.`,
      assignedCategory: classification.category,
      reasoning: classification.reasoning,
      confidence: classification.confidence,
      isOverridden: false,
      overriddenCategory: null,
      createdAt: new Date().toISOString()
    };

    MOCK_DB.logs.unshift(newLog);
    
    // Update Notion config last sync timestamp
    if (MOCK_DB.notionConfigs['user-default']) {
      MOCK_DB.notionConfigs['user-default'].lastSynced = newLog.createdAt;
    }

    return res.json({ success: true, log: newLog });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// SERVER START
// =========================================================================
app.listen(PORT, () => {
  console.log(`🚀 ParaOrganizer server humming on http://localhost:${PORT}`);
  console.log(`🧪 Running resilient in-memory session database.`);
});
