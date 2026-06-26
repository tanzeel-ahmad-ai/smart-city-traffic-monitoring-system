import React from "react";

const ADMIN_NAV = [
  {
    key: "monitor",
    label: "Live Monitoring",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    key: "cameras",
    label: "Camera Fleet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="15" height="12" rx="2" />
        <path d="M17 10l5-3v10l-5-3" />
      </svg>
    ),
  },
];

const CITIZEN_NAV = [
  {
    key: "routes",
    label: "Routes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const Sidebar = ({ activeTab, onTabChange, onLogout, role }) => {
  const NAV_ITEMS = role === "admin" ? ADMIN_NAV : CITIZEN_NAV;

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="2" width="10" height="20" rx="3" fill="#fff" opacity="0.25" />
            <rect x="7" y="2" width="10" height="20" rx="3" stroke="#fff" strokeWidth="1.8" />
            <circle cx="12" cy="7"  r="2" fill="#e74c3c" />
            <circle cx="12" cy="12" r="2" fill="#f1c40f" />
            <circle cx="12" cy="17" r="2" fill="#fff" />
          </svg>
        </div>
        <div>
          <p style={styles.logoTitle}>TrafficSmart</p>
          <p style={styles.logoSub}>
            {role === "admin" ? "Admin Panel" : "Citizen Portal"}
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div style={styles.roleBadge}>
        <span style={{ ...styles.roleTag, backgroundColor: role === "admin" ? "#fff3e0" : "#e8f5e9", color: role === "admin" ? "#e65100" : "#2e7d32" }}>
          {role === "admin" ? "⚙️ Admin" : "👤 Citizen"}
        </span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
              onClick={() => onTabChange(item.key)}
            >
              <span style={{ ...styles.navIcon, color: active ? "#6a9e6e" : "#888" }}>
                {item.icon}
              </span>
              <span style={{ ...styles.navLabel, color: active ? "#1a1a1a" : "#666", fontWeight: active ? "600" : "400" }}>
                {item.label}
              </span>
              {active && <div style={styles.activeBar} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button style={styles.logoutBtn} onClick={onLogout}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#fff",
    borderRight: "1px solid #e8eddf",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px 16px",
    borderBottom: "1px solid #f0f3e8",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#6a9e6e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoTitle: { margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a1a" },
  logoSub:   { margin: 0, fontSize: "11px", color: "#999" },
  roleBadge: { padding: "12px 20px", borderBottom: "1px solid #f0f3e8" },
  roleTag:   { fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "20px" },
  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "none",
    background: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    position: "relative",
    transition: "background 0.15s",
    fontFamily: "inherit",
  },
  navItemActive: { backgroundColor: "#f0f5ef" },
  navIcon:       { flexShrink: 0 },
  navLabel:      { fontSize: "14px" },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    backgroundColor: "#6a9e6e",
    borderRadius: "3px 0 0 3px",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#e53935",
    fontSize: "14px",
    fontWeight: "500",
    borderTop: "1px solid #f0f3e8",
    fontFamily: "inherit",
  },
};

export default Sidebar;
