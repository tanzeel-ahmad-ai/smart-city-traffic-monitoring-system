import React, { useState, useEffect } from "react";
import TrafficLegend from "../components/TrafficLegend";
import { getCameras, searchCameras } from "../api";

const RoutesMap = ({ onSelectCamera }) => {
  const [allCameras, setAllCameras] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all cameras on mount for the dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCameras();
        const cams = data.cameras || [];
        setAllCameras(cams);
        if (cams.length > 0) setSelectedCamera(cams[0]);
      } catch {
        // Silently fail for citizen view
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter locally (fast)
  const filtered = allCameras.filter((c) => {
    const q = search.toLowerCase();
    return c.camera_id.toLowerCase().includes(q) || c.camera_name.toLowerCase().includes(q);
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setShowResults(e.target.value.trim().length > 0);
  };

  const handleSelectResult = (cam) => {
    setSelectedCamera(cam);
    setSearch(cam.camera_id);
    setShowResults(false);
  };

  const handleClear = () => {
    setSearch("");
    setShowResults(false);
    if (allCameras.length > 0) setSelectedCamera(allCameras[0]);
  };

  // Build a dynamic OSM URL centered on selected camera
  const mapSrc = selectedCamera?.latitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selectedCamera.longitude) - 0.05}%2C${parseFloat(selectedCamera.latitude) - 0.05}%2C${parseFloat(selectedCamera.longitude) + 0.05}%2C${parseFloat(selectedCamera.latitude) + 0.05}&layer=mapnik&marker=${selectedCamera.latitude}%2C${selectedCamera.longitude}`
    : "https://www.openstreetmap.org/export/embed.html?bbox=72.9%2C33.55%2C73.2%2C33.75&layer=mapnik";

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="2" width="10" height="20" rx="3" fill="#fff" opacity="0.3"/>
            <rect x="7" y="2" width="10" height="20" rx="3" stroke="#fff" strokeWidth="1.8"/>
            <circle cx="12" cy="7"  r="2" fill="#e74c3c"/>
            <circle cx="12" cy="12" r="2" fill="#f1c40f"/>
            <circle cx="12" cy="17" r="2" fill="#fff"/>
          </svg>
        </div>
        <div>
          <p style={s.headerTitle}>Routes</p>
          <p style={s.headerSub}>Traffic Monitoring System</p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={s.searchWrapper}>
        <div style={s.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={s.searchInput}
            type="text"
            placeholder={loading ? "Loading routes…" : "Search Routes by ID or Name..."}
            value={search}
            onChange={handleSearch}
            disabled={loading}
          />
          {search && (
            <button style={s.clearBtn} onClick={handleClear}>✕</button>
          )}
        </div>

        {/* Dropdown */}
        {showResults && filtered.length > 0 && (
          <div style={s.dropdown}>
            {filtered.map((cam) => (
              <div key={cam.camera_id} style={s.dropdownItem} onClick={() => handleSelectResult(cam)}>
                <p style={s.dropId}>{cam.camera_id}</p>
                <p style={s.dropLoc}>{cam.camera_name}</p>
              </div>
            ))}
          </div>
        )}

        {showResults && filtered.length === 0 && !loading && (
          <div style={s.dropdown}>
            <div style={s.noResults}>No cameras found for "{search}"</div>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={s.mapWrapper}>
        <iframe
          key={mapSrc} // re-render iframe when camera changes
          title="Traffic Map"
          src={mapSrc}
          style={{ width: "100%", height: "100%", border: "none" }}
          scrolling="no"
        />
        <div style={s.legendOverlay}>
          <TrafficLegend />
        </div>

        {/* No cameras notice */}
        {!loading && allCameras.length === 0 && (
          <div style={s.noDataOverlay}>
            No cameras registered yet. Ask an admin to add cameras.
          </div>
        )}
      </div>

      {/* Bottom Camera Card */}
      {selectedCamera && (
        <div
          style={s.resultCard}
          onClick={() => onSelectCamera && onSelectCamera(selectedCamera)}
        >
          <div style={s.resultLeft}>
            <p style={s.resultId}>{selectedCamera.camera_id}</p>
            <p style={s.resultLoc}>{selectedCamera.camera_name}</p>
          </div>
          {selectedCamera.latitude && (
            <div style={s.resultRight}>
              <p style={s.resultCoords}>
                {parseFloat(selectedCamera.latitude).toFixed(4)}°
              </p>
              <p style={s.resultCoords}>
                {parseFloat(selectedCamera.longitude).toFixed(4)}°
              </p>
            </div>
          )}
          <div style={s.tapHint}>Tap for analytics →</div>
        </div>
      )}

      {!selectedCamera && !loading && (
        <div style={{ ...s.resultCard, opacity: 0.5, cursor: "default" }}>
          <p style={s.resultLoc}>No camera selected</p>
        </div>
      )}
    </div>
  );
};

const s = {
  page:         { display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f3e8", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" },
  header:       { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 10px", backgroundColor: "#f0f3e8", zIndex: 10, flexShrink: 0 },
  headerIcon:   { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#6a9e6e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle:  { margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1a1a" },
  headerSub:    { margin: "2px 0 0", fontSize: "11px", color: "#888" },
  searchWrapper:{ position: "relative", padding: "0 20px 10px", zIndex: 20, flexShrink: 0 },
  searchBox:    { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  searchInput:  { flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#333", fontFamily: "inherit", backgroundColor: "transparent" },
  clearBtn:     { background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "14px", padding: "0 2px" },
  dropdown:     { position: "absolute", top: "100%", left: "20px", right: "20px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" },
  dropdownItem: { padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f0f3e8" },
  dropId:       { margin: 0, fontSize: "14px", fontWeight: "700", color: "#2a6ebb" },
  dropLoc:      { margin: "2px 0 0", fontSize: "12px", color: "#888" },
  noResults:    { padding: "14px 16px", fontSize: "13px", color: "#aaa", textAlign: "center" },
  mapWrapper:   { flex: 1, position: "relative", overflow: "hidden" },
  legendOverlay:{ position: "absolute", top: "14px", left: "14px", zIndex: 5 },
  zoomBtns:     { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "4px", zIndex: 5 },
  zoomBtn:      { width: "36px", height: "36px", backgroundColor: "#fff", border: "none", borderRadius: "8px", fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" },
  noDataOverlay:{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(240,243,232,0.8)", fontSize: "14px", color: "#888", textAlign: "center", padding: "20px" },
  resultCard:   { flexShrink: 0, backgroundColor: "#e8eddf", padding: "16px 20px 20px", cursor: "pointer", borderTop: "2px solid #c5cdb8", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between" },
  resultLeft:   { flex: 1 },
  resultRight:  { textAlign: "right", marginRight: "12px" },
  resultId:     { margin: 0, fontSize: "20px", fontWeight: "800", color: "#2a6ebb" },
  resultLoc:    { margin: "4px 0 0", fontSize: "13px", color: "#555" },
  resultCoords: { margin: 0, fontSize: "11px", color: "#aaa", fontFamily: "monospace" },
  tapHint:      { fontSize: "12px", color: "#6a9e6e", fontWeight: "600", whiteSpace: "nowrap" },
};

export default RoutesMap;
