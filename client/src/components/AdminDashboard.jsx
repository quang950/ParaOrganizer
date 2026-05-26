import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Database,
  Clock,
  Link as LinkIcon,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard({ logs }) {
  const [expandedUser, setExpandedUser] = useState(null);

  // Grouping logic bằng useMemo để tối ưu hiệu suất
  const userGroups = useMemo(() => {
    const groups = {};
    logs.forEach((log) => {
      // Sử dụng userId, nếu cũ không có thì để Unknown
      const uid = log.userId || "Unknown (Legacy)";
      if (!groups[uid]) {
        groups[uid] = {
          userId: uid,
          logs: [],
          counts: { PROJECTS: 0, AREAS: 0, RESOURCES: 0, ARCHIVES: 0 },
        };
      }
      groups[uid].logs.push(log);
      if (
        log.assignedCategory &&
        groups[uid].counts[log.assignedCategory] !== undefined
      ) {
        groups[uid].counts[log.assignedCategory]++;
      }
    });

    // Trả về mảng đã được sort theo số lượng log giảm dần
    return Object.values(groups).sort((a, b) => b.logs.length - a.logs.length);
  }, [logs]);

  const toggleExpand = (uid) => {
    setExpandedUser(expandedUser === uid ? null : uid);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "1rem",
            borderRadius: "12px",
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              color: "var(--text-primary)",
              fontSize: "1.75rem",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)" }}>
            System-wide Classification Logs Grouped By Users
          </p>
        </div>
      </div>

      <div className="glass-card">
        <h3
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Database size={18} />
          Users Database ({userGroups.length} users / {logs.length} logs)
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th
                  style={{
                    padding: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Tài khoản (UserID)
                </th>
                <th
                  style={{
                    padding: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Tổng hợp PARA
                </th>
                <th
                  style={{
                    padding: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {userGroups.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Không có người dùng hoặc bản ghi nào trên hệ thống
                  </td>
                </tr>
              ) : (
                userGroups.map((group) => (
                  <React.Fragment key={group.userId}>
                    {/* HÀNG CHÍNH: HIỂN THỊ TỔNG QUAN THEO USER */}
                    <tr
                      onClick={() => toggleExpand(group.userId)}
                      style={{
                        borderBottom:
                          expandedUser === group.userId
                            ? "none"
                            : "1px solid var(--border-color)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        background:
                          expandedUser === group.userId
                            ? "rgba(255,255,255,0.02)"
                            : "transparent",
                      }}
                      className="hover-bg-light"
                    >
                      <td style={{ padding: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                          }}
                        >
                          <User
                            size={16}
                            style={{ color: "var(--accent-primary)" }}
                          />
                          <span style={{ color: "var(--text-primary)" }}>
                            {group.userId}
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontWeight: "normal",
                                marginLeft: "6px",
                                fontSize: "0.8rem",
                              }}
                            >
                              ({group.logs.length} logs)
                            </span>
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--color-projects)",
                              fontWeight: 600,
                            }}
                          >
                            P: {group.counts.PROJECTS}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>|</span>
                          <span
                            style={{
                              color: "var(--color-areas)",
                              fontWeight: 600,
                            }}
                          >
                            A: {group.counts.AREAS}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>|</span>
                          <span
                            style={{
                              color: "var(--color-resources)",
                              fontWeight: 600,
                            }}
                          >
                            R: {group.counts.RESOURCES}
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>|</span>
                          <span
                            style={{
                              color: "var(--color-archives)",
                              fontWeight: 600,
                            }}
                          >
                            A: {group.counts.ARCHIVES}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        {expandedUser === group.userId ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </td>
                    </tr>

                    {/* HÀNG PHỤ: MỞ RỘNG DANH SÁCH LOGS DETAIL */}
                    {expandedUser === group.userId && (
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                          background: "rgba(0,0,0,0.2)",
                        }}
                      >
                        <td
                          colSpan="3"
                          style={{ padding: "1rem 2rem 2rem 2rem" }}
                        >
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                              marginBottom: "1rem",
                            }}
                          >
                            Danh sách phân loại chi tiết của User:{" "}
                            <strong>{group.userId}</strong>
                          </div>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {group.logs.map((log) => (
                              <div
                                key={log.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "1rem",
                                  padding: "0.75rem 1rem",
                                  background: "rgba(255,255,255,0.03)",
                                  borderRadius: "8px",
                                  borderLeft: `3px solid var(--color-${log.assignedCategory?.toLowerCase()})`,
                                }}
                              >
                                <div style={{ width: "100px" }}>
                                  <span
                                    className={`badge badge-${log.assignedCategory?.toLowerCase()}`}
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {log.assignedCategory}
                                  </span>
                                </div>
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                  <div
                                    style={{
                                      color: "var(--text-primary)",
                                      fontWeight: 500,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {log.title}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.25rem",
                                      marginTop: "0.25rem",
                                    }}
                                  >
                                    <LinkIcon
                                      size={12}
                                      color="var(--text-muted)"
                                    />
                                    <a
                                      href={log.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color: "var(--text-muted)",
                                        textDecoration: "none",
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {log.url}
                                    </a>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  <Clock size={12} />
                                  {new Date(log.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
