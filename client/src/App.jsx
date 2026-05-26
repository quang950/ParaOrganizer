import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LogsTable from "./components/LogsTable";
import NotionSettings from "./components/NotionSettings";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";
import Simulator from "./components/Simulator";
import AdminDashboard from "./components/AdminDashboard";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

// Thay ID mặc định ở đây (Như quy định của người dùng)
const ADMIN_ID = "da61cc1c-8c24-4d99-a3d0-a08e27989e1b";
import * as storage from "./utils/storage";
// 🔌 Import Real Backend Client ở đây nha bạn tui
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [user, setUser] = useState(null);
  const [onboarding, setOnboarding] = useState({
    isCompleted: false,
    currentStep: 1,
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({});
  const [appMode, setAppMode] = useState("sandbox");
  const [toasts, setToasts] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 1. Initialize App & Fetch Real Data from Database
  useEffect(() => {
    storage.initializeStorage();

    const currentOnboarding = storage.getOnboarding();
    const currentConfig = storage.getNotionConfig();
    const currentMode = storage.getAppMode();

    setOnboarding(currentOnboarding);
    setConfig(currentConfig);
    setAppMode(currentMode);

    // Lấy thông tin user đăng nhập trên Supabase (nếu có)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Fallback về user cũ (đang lưu local) nếu có để tương thích
        const currentUser = storage.getUser();
        setUser(currentUser);
      }
    });

    // Lắng nghe sự kiện Auth (Login, Logout, Token Refresh...)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchSupabaseLogs(); // Fetch lại khi đã có user chính thức
        } else {
          setLogs([]); // Xóa logs trên UI khi logout
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Hàm chuyên trách kéo dữ liệu real-time từ Supabase
  const fetchSupabaseLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("classification_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map lại cấu trúc của database sang cấu trúc cũ của UI để không bị lỗi giao diện
      const mappedLogs = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        assignedCategory: item.category, // Ánh xạ từ 'category' sang 'assignedCategory'
        createdAt: item.created_at, // Ánh xạ từ 'created_at' sang 'createdAt'
        confidenceScore: item.confidence_score,
        isOverridden: false,
        userId: item.user_id, // Lấy ID cho Admin View
      }));

      setLogs(mappedLogs);
    } catch (err) {
      console.error("Lỗi fetch data rồi ông Quang ơi:", err.message);
      addToast("Failed to sync database from Supabase.", "error");
    } finally {
      setLoadingLogs(false);
    }
  };

  // 🟢 1. Hàm THÊM (Insert) dữ liệu mới
  const addSupabaseLog = async (newLog) => {
    if (!user || !user.id) {
      addToast("Vui lòng đăng nhập để lưu dữ liệu.", "error");
      return;
    }

    // 1. Cập nhật UI trước cho mượt
    setLogs((prev) => [newLog, ...prev]);

    try {
      const { error } = await supabase.from("classification_logs").insert([
        {
          title: newLog.title,
          url: newLog.url,
          category: newLog.assignedCategory,
          confidence_score: newLog.confidenceScore || 95,
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      fetchSupabaseLogs(); // Sync lại
    } catch (err) {
      addToast("Lỗi khi thêm: " + err.message, "error");
    }
  };

  // 🟡 2. Hàm SỬA (Update) phân loại category
  const updateSupabaseLog = async (id, newCategory) => {
    try {
      const { error } = await supabase
        .from("classification_logs")
        .update({ category: newCategory })
        .eq("id", id);

      if (error) throw error;
      addToast(`Đã đổi phần loại thành ${newCategory}!`, "success");
      fetchSupabaseLogs();
    } catch (err) {
      addToast("Lỗi khi cập nhật: " + err.message, "error");
      throw err; // Ném lỗi để UI xử lý UI loading
    }
  };

  // 🔴 3. Hàm XÓA (Delete) dữ liệu
  const deleteSupabaseLog = async (id) => {
    try {
      const { error } = await supabase
        .from("classification_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      addToast("Đã xóa bản ghi thành công", "success");
      fetchSupabaseLogs();
    } catch (err) {
      addToast("Lỗi khi xóa: " + err.message, "error");
    }
  };

  // 2. Dynamic statistics calculator
  const stats = useMemo(() => {
    const total = logs.length;
    const counts = { PROJECTS: 0, AREAS: 0, RESOURCES: 0, ARCHIVES: 0 };
    let overriddenCount = 0;

    logs.forEach((log) => {
      const finalCategory = log.isOverridden
        ? log.overriddenCategory
        : log.assignedCategory;
      if (counts[finalCategory] !== undefined) {
        counts[finalCategory]++;
      }
      if (log.isOverridden) {
        overriddenCount++;
      }
    });

    const accuracyRate =
      total > 0 ? Math.round(((total - overriddenCount) / total) * 100) : 100;
    const percentages = {
      PROJECTS: total > 0 ? Math.round((counts.PROJECTS / total) * 100) : 0,
      AREAS: total > 0 ? Math.round((counts.AREAS / total) * 100) : 0,
      RESOURCES: total > 0 ? Math.round((counts.RESOURCES / total) * 100) : 0,
      ARCHIVES: total > 0 ? Math.round((counts.ARCHIVES / total) * 100) : 0,
    };

    return {
      total,
      counts,
      percentages,
      accuracyRate,
      lastSyncTime: total > 0 ? logs[0].createdAt : null,
    };
  }, [logs]);

  // 3. Toast Notifications Engine
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    const currentOnboarding = storage.getOnboarding();
    setOnboarding(currentOnboarding);

    // Lấy tên từ Supabase user_metadata, nếu không có thì dùng email
    const displayName =
      authenticatedUser?.user_metadata?.full_name ||
      authenticatedUser?.email ||
      "User";
    addToast(`Successfully logged in as ${displayName}!`, "success");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    storage.saveUser(null);
    setUser(null);
    addToast("Signed out of workspace.", "info");
  };

  const handleOnboardingComplete = () => {
    setOnboarding({ isCompleted: true, currentStep: 3 });
    const currentConfig = storage.getNotionConfig();
    setConfig(currentConfig);
    fetchSupabaseLogs(); // Load dữ liệu thật sau khi onboarding xong
  };

  const isAdmin = user?.id === ADMIN_ID;

  if (!user)
    return <Auth onAuthSuccess={handleAuthSuccess} addToast={addToast} />;
  if (!onboarding.isCompleted && !isAdmin)
    // Admin bỏ qua Onboarding cho tiện
    return (
      <Onboarding
        user={user}
        onComplete={handleOnboardingComplete}
        addToast={addToast}
      />
    );

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
        appMode={appMode}
        setAppMode={setAppMode}
      />

      {isAdmin && (
        <div
          style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999 }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.95)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "50px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            <ShieldCheck size={18} />
            ADMIN MODE
          </div>
        </div>
      )}

      <main className="main-content">
        {activePage === "dashboard" && (
          <div>
            {loadingLogs && (
              <div
                style={{
                  color: "var(--accent-primary)",
                  padding: "1rem",
                  fontSize: "0.85rem",
                }}
              >
                🔄 Loading real-time Supabase records...
              </div>
            )}

            {isAdmin ? (
              <AdminDashboard logs={logs} />
            ) : (
              <Dashboard logs={logs} stats={stats} appMode={appMode} />
            )}
          </div>
        )}

        {activePage === "logs" && (
          <LogsTable
            logs={logs}
            setLogs={setLogs}
            addToast={addToast}
            stats={stats}
            onUpdateLog={updateSupabaseLog}
            onDeleteLog={deleteSupabaseLog}
          />
        )}

        {activePage === "settings" && (
          <NotionSettings
            config={config}
            setConfig={setConfig}
            addToast={addToast}
          />
        )}
      </main>

      {/* Mỗi khi Simulator tạo log ảo mới, ta đồng thời trigger lưu thẳng vào DB thật luôn */}
      {(activePage === "dashboard" || activePage === "logs") && (
        <Simulator onNewLogCreated={addSupabaseLog} addToast={addToast} />
      )}

      {/* Drawer Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type === "success" ? "toast-success" : ""}`}
            onClick={() => removeToast(toast.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="toast-icon">
              {toast.type === "success" ? (
                <CheckCircle2
                  size={16}
                  style={{ color: "var(--color-areas)" }}
                />
              ) : toast.type === "error" ? (
                <AlertTriangle
                  size={16}
                  style={{ color: "var(--color-projects)" }}
                />
              ) : (
                <Sparkles
                  size={16}
                  style={{ color: "var(--accent-primary)" }}
                />
              )}
            </div>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
