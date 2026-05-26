import React, { useState } from "react";
import {
  Search,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { api } from "../utils/api";

export default function LogsTable({
  logs,
  setLogs,
  addToast,
  stats,
  onUpdateLog,
  onDeleteLog,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const handleOverrideCategory = async (logId, newCategory) => {
    setUpdatingId(logId);
    try {
      if (onUpdateLog) {
        await onUpdateLog(logId, newCategory);
      } else {
        // Fallback or legacy logic
        const res = await api.overrideCategory(logId, newCategory);
        if (res.success) {
          setLogs((prev) =>
            prev.map((log) => (log.id === logId ? res.log : log)),
          );
          addToast(
            `Feedback Loop Activated: Learning category '${newCategory}'!`,
            "success",
          );
        } else {
          addToast("Failed to record override.", "error");
        }
      }
    } catch (err) {
      // Error handled by parent function mostly, but we catch to clear loading state
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (logId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      if (onDeleteLog) {
        onDeleteLog(logId);
      }
    }
  };

  // Filter logs based on search query and category selector
  const filteredLogs = logs.filter((log) => {
    const finalCategory = log.isOverridden
      ? log.overriddenCategory
      : log.assignedCategory;
    const matchesSearch =
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      (log.reasoning &&
        log.reasoning.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      categoryFilter === "ALL" || finalCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>AI Classification Logs</h1>
          <p className="page-subtitle">
            Inspect AI sorting decisions, review prompt reasoning, and manually
            override categories to train the model.
          </p>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "0.75rem 1.25rem",
            flex: 1,
            minWidth: "150px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Sorting Accuracy
          </span>
          <span
            style={{
              fontWeight: 700,
              color: "var(--color-areas)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <CheckCircle2 size={14} />
            {stats.accuracyRate}%
          </span>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "0.75rem 1.25rem",
            flex: 1,
            minWidth: "150px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Total Evaluated
          </span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {stats.total} clips
          </span>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "0.75rem 1.25rem",
            flex: 1,
            minWidth: "150px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Pending Syncs
          </span>
          <span
            style={{
              fontWeight: 700,
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span
              className="status-indicator active"
              style={{ width: "6px", height: "6px" }}
            ></span>
            0 in queue
          </span>
        </div>
      </div>

      {/* Table Filters Bar */}
      <div
        className="glass-card"
        style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search saved clips, web page titles, reasoning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "2.5rem", height: "38px" }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-secondary)" }} />
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginRight: "0.25rem",
            }}
          >
            Filter:
          </span>

          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "0.2rem",
            }}
          >
            {["ALL", "PROJECTS", "AREAS", "RESOURCES", "ARCHIVES"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    background:
                      categoryFilter === cat
                        ? "rgba(255, 255, 255, 0.08)"
                        : "transparent",
                    border: "none",
                    outline: "none",
                    color:
                      categoryFilter === cat
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.35rem 0.65rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                  }}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Source Web Clip</th>
              <th style={{ width: "15%" }}>AI Assigned</th>
              <th style={{ width: "35%" }}>AI Prompts Reasoning</th>
              <th style={{ width: "15%" }}>Re-Organise</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const finalCategory = log.isOverridden
                  ? log.overriddenCategory
                  : log.assignedCategory;
                return (
                  <tr
                    key={log.id}
                    style={{
                      opacity: updatingId === log.id ? 0.5 : 1,
                      transition: "opacity 0.25s",
                    }}
                  >
                    {/* Item details */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {log.title}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>
                            {new Date(log.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>•</span>
                          <a
                            href={log.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.15rem",
                              color: "var(--accent-primary)",
                              fontWeight: 500,
                            }}
                          >
                            <span>Visit Link</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* AI Assigned category */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          className={`para-badge ${finalCategory.toLowerCase()}`}
                        >
                          {finalCategory}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.15rem",
                          }}
                        >
                          <Sparkles
                            size={10}
                            style={{ color: "var(--accent-secondary)" }}
                          />
                          {Math.round(log.confidence * 100)}% Match
                        </span>
                      </div>
                    </td>

                    {/* LLM Reasoning explanation */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.4",
                          }}
                        >
                          {log.reasoning ||
                            "No specific reasoning captured by AI engine."}
                        </p>
                        {log.isOverridden && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--color-resources)",
                              fontWeight: 500,
                            }}
                          >
                            ⚠️ Originally predicted as {log.assignedCategory}{" "}
                            (Feedback Recorded)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Manual re-classify dropdown & Delete */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {updatingId === log.id ? (
                          <div
                            className="sim-loader-spinner"
                            style={{ width: "16px", height: "16px" }}
                          ></div>
                        ) : (
                          <select
                            value={finalCategory}
                            onChange={(e) =>
                              handleOverrideCategory(log.id, e.target.value)
                            }
                            className="override-select"
                          >
                            <option value="PROJECTS">Projects</option>
                            <option value="AREAS">Areas</option>
                            <option value="RESOURCES">Resources</option>
                            <option value="ARCHIVES">Archives</option>
                          </select>
                        )}
                        <button
                          onClick={() => handleDelete(log.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: "0.25rem",
                          }}
                          title="Xóa bản ghi"
                        >
                          <Trash2
                            size={16}
                            hover={{ color: "var(--color-projects)" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  No matching sync logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
