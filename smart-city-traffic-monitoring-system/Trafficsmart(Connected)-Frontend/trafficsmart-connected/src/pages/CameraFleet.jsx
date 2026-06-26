import React, { useState, useEffect } from "react";
import { SearchBar, SectionLabel } from "../components/SharedComponents";
import { getCameras, searchCameras } from "../api";

const CameraListItem = ({ id, location, onEdit }) => (
  <div style={s.listCard}>
    <div style={s.listRow}>
      <div style={s.iconBox}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a8f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="15" height="12" rx="2" />
          <path d="M17 10l5-3v10l-5-3" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p style={s.camId}>{id}</p>
        <p style={s.camLoc}>{location}</p>
      </div>
      <button style={s.editBtn} onClick={onEdit}>Edit</button>
    </div>
  </div>
);

const CameraFleet = ({ onAddCamera }) => {
  const [cameras, setCameras] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load cameras on mount
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCameras();
      setCameras(data.cameras || []);
    } catch (err) {
      setError("Failed to load cameras: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Live search against API
  useEffect(() => {
    if (!search.trim()) {
      fetchCameras();
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await searchCameras(search.trim());
        setCameras(data.cameras || []);
      } catch (err) {
        setError("Search failed: " + err.message);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Build OSM URL with all camera markers
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=73.0%2C33.5%2C73.15%2C33.65&layer=mapnik";

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="2" width="10" height="20" rx="3" fill="#6a8f5e" opacity="0.2" />
              <rect x="7" y="2" width="10" height="20" rx="3" stroke="#6a8f5e" strokeWidth="1.5" />
              <circle cx="12" cy="7" r="2" fill="#e74c3c" />
              <circle cx="12" cy="12" r="2" fill="#f1c40f" />
              <circle cx="12" cy="17" r="2" fill="#6a8f5e" />
            </svg>
          </div>
          <div>
            <h1 style={s.title}>Camera Fleet</h1>
            <p style={s.subtitle}>Traffic Monitoring System</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button style={s.refreshBtn} onClick={fetchCameras} title="Refresh">↺</button>
          <button style={s.addBtn} onClick={onAddCamera}>+ Add Camera</button>
        </div>
      </div>

      <div style={s.twoCol}>
        {/* Left - Map */}
        <div style={s.mapCard}>
          <p style={s.mapLabel}>📍 Camera Locations — Rawalpindi</p>
          <div style={s.mapWrapper}>
            <iframe
              title="Fleet Map"
              src={mapSrc}
              style={{ width: "100%", height: "100%", border: "none" }}
              scrolling="no"
            />
          </div>
          <div style={s.totalBox}>
            <p style={s.totalLabel}>TOTAL CAMERAS</p>
            <p style={s.totalVal}>{loading ? "…" : cameras.length}</p>
          </div>
        </div>

        {/* Right - Camera List */}
        <div style={s.listSection}>
          <div style={{ marginBottom: "16px" }}>
            <SearchBar
              placeholder="Search by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <SectionLabel title="Active Cameras" />

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          <div style={s.listScroll}>
            {loading ? (
              <div style={s.loadingBox}>Loading cameras…</div>
            ) : cameras.length === 0 ? (
              <div style={s.emptyBox}>No cameras found.</div>
            ) : (
              cameras.map((cam) => (
                <CameraListItem
                  key={cam.camera_id}
                  id={cam.camera_id}
                  location={cam.camera_name}
                  onEdit={() => {}}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: "32px 36px", height: "100%", overflowY: "auto", backgroundColor: "#f5f5ec", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#e8eddf", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { margin: 0, fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  subtitle: { margin: "2px 0 0", fontSize: "12px", color: "#888" },
  addBtn: { padding: "10px 20px", backgroundColor: "#6a9e6e", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  refreshBtn: { padding: "10px 14px", backgroundColor: "#e8eddf", color: "#555", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },
  mapCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  mapLabel: { margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#555" },
  mapWrapper: { width: "100%", height: "300px", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" },
  totalBox: { backgroundColor: "#f0f3e8", borderRadius: "10px", padding: "14px", textAlign: "center" },
  totalLabel: { margin: 0, fontSize: "11px", fontWeight: "700", letterSpacing: "1px", color: "#888", textTransform: "uppercase" },
  totalVal: { margin: "6px 0 0", fontSize: "32px", fontWeight: "700", color: "#1a1a1a" },
  listSection: { backgroundColor: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  listScroll: { maxHeight: "420px", overflowY: "auto" },
  listCard: { backgroundColor: "#f8faf5", borderRadius: "10px", padding: "14px 16px", marginBottom: "10px", border: "1px solid #eef2ee" },
  listRow: { display: "flex", alignItems: "center", gap: "12px" },
  iconBox: { width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#e8eddf", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  camId: { margin: 0, fontSize: "14px", fontWeight: "700", color: "#1a1a1a" },
  camLoc: { margin: "2px 0 0", fontSize: "12px", color: "#888" },
  editBtn: { background: "none", border: "1px solid #ddd", color: "#555", fontSize: "12px", fontWeight: "500", cursor: "pointer", padding: "5px 12px", borderRadius: "6px", fontFamily: "inherit" },
  errorBox: { backgroundColor: "#fde8e8", border: "1px solid #f5b7b7", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "13px", color: "#c0392b" },
  loadingBox: { textAlign: "center", padding: "32px", color: "#888", fontSize: "14px" },
  emptyBox: { textAlign: "center", padding: "32px", color: "#aaa", fontSize: "14px" },
};

export default CameraFleet;
