import React, { useState } from "react";
import LoginPage      from "./pages/LoginPage";
import LiveMonitoring from "./pages/LiveMonitoring";
import CameraFleet    from "./pages/CameraFleet";
import AddNewCamera   from "./pages/AddNewCamera";
import RoutesMap      from "./pages/RoutesMap";
import RouteAnalytics from "./pages/RouteAnalytics";
import Sidebar        from "./components/Sidebar";

function App() {
  const [screen, setScreen]                 = useState("login");
  const [activeTab, setActiveTab]           = useState("");
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [userRole, setUserRole]             = useState(null);
  const [userInfo, setUserInfo]             = useState(null);  // { id, email, role }

  const handleLogin = (role, user) => {
    setUserRole(role);
    setUserInfo(user);
    if (role === "admin") {
      setActiveTab("monitor");
      setScreen("dashboard");
    } else {
      setScreen("citizenRoutes");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ts_user");
    setScreen("login");
    setUserRole(null);
    setUserInfo(null);
    setActiveTab("");
    setSelectedCamera(null);
  };

  // ── Login ──────────────────────────────────────────
  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── CITIZEN: Full screen Routes (no sidebar) ───────
  if (screen === "citizenRoutes") {
    return (
      <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
        <button style={logoutStyle} onClick={handleLogout}>Logout</button>
        <RoutesMap
          onSelectCamera={(cam) => {
            setSelectedCamera(cam);
            setScreen("citizenAnalytics");
          }}
        />
      </div>
    );
  }

  // ── CITIZEN: Route Analytics (no sidebar) ─────────
  if (screen === "citizenAnalytics") {
    return (
      <div style={{ height: "100vh", overflow: "hidden" }}>
        <RouteAnalytics
          camera={selectedCamera}
          onBack={() => setScreen("citizenRoutes")}
        />
      </div>
    );
  }

  // ── ADMIN: Add Camera ──────────────────────────────
  if (screen === "addCamera") {
    return (
      <div style={layout.app}>
        <Sidebar activeTab="cameras" onTabChange={(tab) => { setActiveTab(tab); setScreen("dashboard"); }} onLogout={handleLogout} role={userRole} />
        <div style={layout.main}>
          <AddNewCamera
            onBack={() => { setActiveTab("cameras"); setScreen("dashboard"); }}
            onAdd={()  => { setActiveTab("cameras"); setScreen("dashboard"); }}
          />
        </div>
      </div>
    );
  }

  // ── ADMIN: Route Analytics from Live Monitoring ────
  if (screen === "analyticsFromMonitor") {
    return (
      <div style={layout.app}>
        <Sidebar activeTab="monitor" onTabChange={(tab) => { setActiveTab(tab); setScreen("dashboard"); }} onLogout={handleLogout} role={userRole} />
        <div style={layout.main}>
          <RouteAnalytics
            camera={selectedCamera}
            onBack={() => { setActiveTab("monitor"); setScreen("dashboard"); }}
          />
        </div>
      </div>
    );
  }

  // ── ADMIN: Main Dashboard ──────────────────────────
  return (
    <div style={layout.app}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        role={userRole}
      />
      <div style={layout.main}>
        {activeTab === "monitor" && (
          <LiveMonitoring
            onRouteAnalytics={(cam) => {
              setSelectedCamera(cam);
              setScreen("analyticsFromMonitor");
            }}
          />
        )}
        {activeTab === "cameras" && (
          <CameraFleet onAddCamera={() => setScreen("addCamera")} />
        )}
      </div>
    </div>
  );
}

const layout = {
  app:  { display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f5f5ec" },
  main: { flex: 1, overflowY: "auto", height: "100vh" },
};

const logoutStyle = {
  position: "absolute",
  top: "16px",
  right: "20px",
  zIndex: 50,
  padding: "8px 18px",
  backgroundColor: "#6a9e6e",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  fontFamily: "'Segoe UI', sans-serif",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
};

export default App;
