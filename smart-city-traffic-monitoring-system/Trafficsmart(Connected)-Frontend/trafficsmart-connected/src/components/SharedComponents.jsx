import React from "react";

export const SearchBar = ({ placeholder = "Search...", value, onChange }) => (
  <div style={sbStyles.wrapper}>
    <svg style={sbStyles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input style={sbStyles.input} type="text" placeholder={placeholder} value={value} onChange={onChange} />
  </div>
);
const sbStyles = {
  wrapper: { display: "flex", alignItems: "center", backgroundColor: "#f0f3e8", borderRadius: "10px", padding: "10px 14px", gap: "10px" },
  icon: { flexShrink: 0 },
  input: { border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "#555", width: "100%", fontFamily: "inherit" },
};

export const SectionLabel = ({ title }) => (
  <h2 style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1.2px", color: "#777", margin: "0 0 12px", textTransform: "uppercase" }}>{title}</h2>
);

export const StatCard = ({ label, value }) => (
  <div style={{ backgroundColor: "#f0f3e8", borderRadius: "12px", padding: "16px 20px", textAlign: "center" }}>
    <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", letterSpacing: "1px", color: "#888", textTransform: "uppercase" }}>{label}</p>
    <p style={{ margin: "6px 0 0", fontSize: "32px", fontWeight: "700", color: "#1a1a1a" }}>{value}</p>
  </div>
);

export const StatusBadge = ({ status = "NORMAL" }) => {
  const colors = {
    NORMAL: { bg: "#e6f4ea", text: "#2e7d32", border: "#a5d6a7" },
    LOW: { bg: "#e6f4ea", text: "#2e7d32", border: "#a5d6a7" },
    WARNING: { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" },
    MODERATE: { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" },
    CRITICAL: { bg: "#fdecea", text: "#c62828", border: "#ef9a9a" },
    HIGH: { bg: "#fdecea", text: "#c62828", border: "#ef9a9a" },
  };
  const c = colors[status] || colors.NORMAL;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "20px", padding: "5px 12px", backgroundColor: c.bg, border: `1.5px solid ${c.border}` }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      <span style={{ fontSize: "12px", fontWeight: "700", color: c.text }}>{status}</span>
    </div>
  );
};

export const FormField = ({ label, placeholder, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
    <label style={{ fontSize: "13px", fontWeight: "500", color: "#333" }}>{label}</label>
    <input style={{ border: "1.5px solid #ddd", borderRadius: "10px", padding: "13px 14px", fontSize: "14px", color: "#333", outline: "none", backgroundColor: "#fff", fontFamily: "inherit" }}
      type="text" placeholder={placeholder} value={value} onChange={onChange} />
  </div>
);

export const PageHeader = ({ title, onBack }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
    <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", backgroundColor: "#f0f3e8" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#1a1a1a" }}>{title}</h2>
  </div>
);

export const VehicleStatCard = ({ label, count, fullWidth = false }) => (
  <div style={{ backgroundColor: "#f0f3e8", borderRadius: "10px", padding: "16px 18px", gridColumn: fullWidth ? "1 / -1" : "span 1" }}>
    <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{label}</p>
    <p style={{ margin: "6px 0 0", fontSize: "30px", fontWeight: "700", color: "#2a6ebb" }}>{count}</p>
  </div>
);

export const TrafficLegend = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "8px", padding: "10px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
    {[{ label: "SMOOTH", color: "#4caf50" }, { label: "MODERATE", color: "#f1c40f" }, { label: "HEAVY", color: "#e53935" }].map(({ label, color }) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "22px", height: "4px", borderRadius: "2px", backgroundColor: color }} />
        <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.8px", color: "#333" }}>{label}</span>
      </div>
    ))}
  </div>
);

export const TrafficTimeline = ({ liveTime = "14:45 PM" }) => {
  const [value, setValue] = React.useState(50);
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "20px 18px 18px" }}>
      <p style={{ margin: "0 0 18px", fontSize: "17px", fontWeight: "700", color: "#1a1a1a" }}>Traffic Volume</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Live Data</span>
        <span style={{ fontSize: "13px", color: "#777" }}>{liveTime}</span>
      </div>
      <div style={{ position: "relative", marginBottom: "6px" }}>
        <input type="range" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))} style={{ width: "100%" }} />
        <div style={{ position: "absolute", top: "4px", left: `${value}%`, width: "2px", height: "28px", backgroundColor: "#2a6ebb", borderRadius: "2px", transform: "translateX(-50%)", pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        {["08:00", "12:00", "16:00", "20:00", "00:00"].map((t) => (
          <span key={t} style={{ fontSize: "11px", color: t === "16:00" ? "#2a6ebb" : "#aaa", fontWeight: t === "16:00" ? "700" : "400" }}>{t}</span>
        ))}
      </div>
    </div>
  );
};
