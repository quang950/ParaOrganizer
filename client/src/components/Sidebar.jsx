import React from "react";
import {
  LayoutDashboard,
  Database,
  ListFilter,
  LogOut,
  Layers,
  Cpu,
} from "lucide-react";
import * as storage from "../utils/storage";

export default function Sidebar({
  activePage,
  setActivePage,
  user,
  onLogout,
  appMode,
  setAppMode,
}) {
  const handleModeChange = (mode) => {
    storage.setAppMode(mode);
    setAppMode(mode);
    // Reload state if sandbox is initialized
    storage.initializeStorage();
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="brand-icon"
          >
            <defs>
              <linearGradient
                id="brand-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>ParaOrganizer</span>
        </div>

        <nav>
          <ul className="sidebar-menu">
            <li
              className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}
              onClick={() => setActivePage("dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </li>
            <li
              className={`sidebar-item ${activePage === "logs" ? "active" : ""}`}
              onClick={() => setActivePage("logs")}
            >
              <ListFilter size={18} />
              <span>Classification Logs</span>
            </li>
            <li
              className={`sidebar-item ${activePage === "settings" ? "active" : ""}`}
              onClick={() => setActivePage("settings")}
            >
              <Database size={18} />
              <span>Notion Settings</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        {/* Mode Switcher */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "0.35rem",
              display: "block",
            }}
          >
            APPLICATION CORE MODE
          </label>
          <div className="mode-toggle-card">
            <div
              className={`mode-toggle-btn ${appMode === "sandbox" ? "active" : ""}`}
              onClick={() => handleModeChange("sandbox")}
              title="Full simulation mode using client browser storage"
            >
              <Cpu
                size={12}
                style={{ marginRight: "0.25rem", verticalAlign: "middle" }}
              />
              Sandbox
            </div>
            <div
              className={`mode-toggle-btn ${appMode === "production" ? "active" : ""}`}
              onClick={() => handleModeChange("production")}
              title="Real database, polling service, and AI engine"
            >
              <Database
                size={12}
                style={{ marginRight: "0.25rem", verticalAlign: "middle" }}
              />
              Production
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div className="user-profile">
              <div className="user-avatar">
                {(user?.user_metadata?.full_name || user?.fullName || "US")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.user_metadata?.full_name || user?.fullName || "User"}
                </span>
                <span className="user-role">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary"
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "0.8rem",
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
