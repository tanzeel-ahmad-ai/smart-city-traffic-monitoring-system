import React from "react";

const ITEMS = [
  { label: "SMOOTH",   color: "#4caf50" },
  { label: "MODERATE", color: "#f1c40f" },
  { label: "HEAVY",    color: "#e53935" },
];

const TrafficLegend = () => (
  <div style={s.wrapper}>
    {ITEMS.map(({ label, color }) => (
      <div key={label} style={s.item}>
        <div style={{ width: "22px", height: "4px", borderRadius: "2px", backgroundColor: color }} />
        <span style={s.label}>{label}</span>
      </div>
    ))}
  </div>
);

const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: "5px", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "8px", padding: "10px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  item:    { display: "flex", alignItems: "center", gap: "8px" },
  label:   { fontSize: "10px", fontWeight: "700", letterSpacing: "0.8px", color: "#333" },
};

export default TrafficLegend;
