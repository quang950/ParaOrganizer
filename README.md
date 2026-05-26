# ParaOrganizer 🧠📂

ParaOrganizer is an ultra-premium SaaS web application that leverages artificial intelligence to automatically categorize saved web clips, notes, and pages into your Notion workspace based on the **PARA Method**: **Projects**, **Areas**, **Resources**, and **Archives**. 

This repository houses a high-fidelity, interactive **React frontend** paired with a robust **Node.js Express API** backend.

---

## 🚀 Getting Started

### 1. Unified Project Installation
To install dependencies for the root workspace, the React client, and the Express server in one simple command, run:
```bash
npm run install:all
```

### 2. Launching the Development Servers
Launch both the Vite React dev server (hosting the client at `http://localhost:5173`) and the Express API server (hosting the API at `http://localhost:5000`) concurrently by running:
```bash
npm run dev
```

---

## 🧪 Testing the Dual-Engine Architecture

ParaOrganizer is designed with a **Hybrid Engine Switcher** located in the bottom-left sidebar of the app dashboard:

### 1. Sandbox / Simulator Mode (Default - Zero Setup Required)
Perfect for instant testing and demonstration without needing API credentials.
- **How it works:** Reads and writes to your browser's local storage.
- **Simulation Center:** Click the glowing CPU pulse icon in the bottom-right corner to open the **Simulation Console**. Use presets (or type custom webpage titles) to trigger the mock inbox synchronization pipeline and watch the step-by-step AI categorization loader update your dashboard in real-time.
- **Model Feedback Loops:** In the **Classification Logs** screen, change the category of any item via the dropdown menu. This triggers a visual feedback loop, generating system notifications and instantly updating the dashboard's statistics and accuracy tracking percentages.

### 2. Production Mode (Real Integrations)
To connect to live servers, toggle the switcher in the sidebar to **Production Mode** and configure your environment variables.

#### Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
# server/.env

# 1. AI Classification Integration (Configure at least one)
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# 2. Server Customization (Optional)
PORT=5000
```

* **Notion Credentials:** Input and test your Notion credentials dynamically through the **Notion Settings** subpage inside the running web dashboard.
* **Row-Level Security (RLS):** Database templates and RLS policies are pre-defined in [schema.sql](file:///d:/Build-Project-with-AI-SolveProblem/PARA_ORGANIZE/server/db/schema.sql) for rapid PostgreSQL / Supabase deployments.

---

## 📂 Tech Stack & Codebase Directory
- **Frontend Framework:** React 19 + Vite 8
- **Design & Layouts:** Bespoke Vanilla CSS Design System with CSS Custom Properties, dynamic variables, and custom animations. (We explicitly avoid utility frameworks to maintain absolute visual control).
- **Icons Library:** Lucide React
- **Backend API:** Node.js Express Server
- **Integrations:** Official `@notionhq/client` SDK, `@google/generative-ai` SDK, `openai` API.
