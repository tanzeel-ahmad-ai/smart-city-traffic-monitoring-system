import React, { useState } from "react";
import { PageHeader, FormField } from "../components/SharedComponents";
import { addCamera, geocode } from "../api";

const CoordBox = ({ latitude, longitude, onConnect, connecting }) => (
  <div style={s.coordWrapper}>
    <div style={s.coordRow}>
      <div style={s.coordBox}>
        <p style={s.coordLabel}>LATITUDE</p>
        <p style={s.coordVal}>{latitude || "—"}</p>
      </div>
      <div style={s.coordBox}>
        <p style={s.coordLabel}>LONGITUDE</p>
        <p style={s.coordVal}>{longitude || "—"}</p>
      </div>
    </div>
    <button style={{ ...s.connectBtn, opacity: connecting ? 0.6 : 1 }} onClick={onConnect} disabled={connecting}>
      {connecting ? "Fetching…" : "📡 Connect Camera"}
    </button>
  </div>
);

const AddNewCamera = ({ onBack, onAdd }) => {
  const [cameraName, setCameraName] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Geocode the camera name to get lat/lon
  const handleConnect = async () => {
  if (!cameraName.trim()) {
    setError("Enter a Camera Name/Location first.");
    return;
  }
  setError("");
  setConnecting(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cameraName.trim() + ", Pakistan")}&format=json&limit=1`,
      { headers: { "User-Agent": "trafficsmart-app" } }
    );
    const data = await res.json();
    if (!data || data.length === 0) {
      setError("Location not found. Try a shorter name.");
    } else {
      setLatitude(parseFloat(data[0].lat).toFixed(6));
      setLongitude(parseFloat(data[0].lon).toFixed(6));
    }
  } catch (err) {
    setError("Geocoding failed: " + err.message);
  } finally {
    setConnecting(false);
  }
};
      

  // Step 2: POST /cameras
  const handleAdd = async () => {
    setError("");
    if (!cameraName.trim() || !cameraId.trim()) {
      setError("Camera Name and Camera ID are required.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Click 'Connect Camera' to fetch coordinates first.");
      return;
    }
    setSaving(true);
    try {
      await addCamera(cameraId.trim(), cameraName.trim(), parseFloat(latitude), parseFloat(longitude));
      setSuccess("Camera added successfully!");
      setTimeout(() => {
        if (onAdd) onAdd({ id: cameraId.trim(), location: cameraName.trim() });
      }, 1000);
    } catch (err) {
      setError("Failed to add camera: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Dynamic OSM iframe URL based on coordinates
  const mapSrc = latitude && longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude) - 0.05}%2C${parseFloat(latitude) - 0.05}%2C${parseFloat(longitude) + 0.05}%2C${parseFloat(latitude) + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "https://www.openstreetmap.org/export/embed.html?bbox=73.0%2C33.5%2C73.15%2C33.65&layer=mapnik";

  return (
    <div style={s.page}>
      <PageHeader title="Add New Camera" onBack={onBack} />

      <div style={s.twoCol}>
        {/* Left - Form */}
        <div style={s.card}>
          <FormField
            label="Camera Name / Location"
            placeholder="e.g. Faizabad, Rawalpindi"
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
          />
          <FormField
            label="Camera ID"
            placeholder="e.g. RCC-02"
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
          />

          <p style={s.pinLabel}>📍 PIN LOCATION</p>
          <div style={s.mapWrapper}>
            <iframe
              title="Pin Location"
              src={mapSrc}
              style={{ width: "100%", height: "100%", border: "none" }}
              scrolling="no"
            />
          </div>

          <CoordBox
            latitude={latitude}
            longitude={longitude}
            onConnect={handleConnect}
            connecting={connecting}
          />

          {error && <div style={s.errorBox}>⚠️ {error}</div>}
          {success && <div style={s.successBox}>✅ {success}</div>}

          <button style={{ ...s.addBtn, opacity: saving ? 0.7 : 1 }} onClick={handleAdd} disabled={saving}>
            {saving ? "SAVING…" : "ADD CAMERA"}
          </button>
        </div>

        {/* Right - Info Panel */}
        <div style={s.infoPanel}>
          <div style={s.infoPanelIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6a9e6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="15" height="12" rx="2" />
              <path d="M17 10l5-3v10l-5-3" />
            </svg>
          </div>
          <h3 style={s.infoPanelTitle}>How to Add a Camera</h3>
          <div style={s.steps}>
            {[
              { num: "1", text: "Enter a descriptive Camera Name including location" },
              { num: "2", text: "Enter a unique Camera ID (e.g. RCC-02)" },
              { num: "3", text: "Click 'Connect Camera' to auto-fetch coordinates from OpenStreetMap" },
              { num: "4", text: "Verify the pin appears on the map" },
              { num: "5", text: "Click ADD CAMERA to save to database" },
            ].map((step) => (
              <div key={step.num} style={s.step}>
                <div style={s.stepNum}>{step.num}</div>
                <p style={s.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: "32px 36px", height: "100%", overflowY: "auto", backgroundColor: "#f5f5ec", fontFamily: "'Segoe UI', sans-serif" },
  twoCol: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" },
  card: { backgroundColor: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  pinLabel: { margin: "0 0 10px", fontSize: "12px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", color: "#333" },
  mapWrapper: { width: "100%", height: "220px", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" },
  coordWrapper: { backgroundColor: "#f0f3e8", borderRadius: "12px", padding: "14px", marginBottom: "20px" },
  coordRow: { display: "flex", gap: "10px", marginBottom: "12px" },
  coordBox: { flex: 1, backgroundColor: "#e8eddf", borderRadius: "8px", padding: "10px 12px" },
  coordLabel: { margin: 0, fontSize: "10px", fontWeight: "600", letterSpacing: "1px", color: "#888", textTransform: "uppercase" },
  coordVal: { margin: "4px 0 0", fontSize: "14px", fontWeight: "700", color: "#1a1a1a" },
  connectBtn: { width: "100%", padding: "11px", borderRadius: "8px", border: "1.5px solid #bbb", backgroundColor: "transparent", fontSize: "13px", fontWeight: "500", color: "#555", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" },
  addBtn: { width: "100%", padding: "15px", backgroundColor: "#6a9e6e", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit" },
  infoPanel: { backgroundColor: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  infoPanelIcon: { width: "60px", height: "60px", borderRadius: "14px", backgroundColor: "#e8eddf", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  infoPanelTitle: { margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  steps: { display: "flex", flexDirection: "column", gap: "14px" },
  step: { display: "flex", alignItems: "flex-start", gap: "12px" },
  stepNum: { width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#6a9e6e", color: "#fff", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepText: { margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.5" },
  errorBox: { backgroundColor: "#fde8e8", border: "1px solid #f5b7b7", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#c0392b" },
  successBox: { backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#2e7d32" },
};

export default AddNewCamera;
