import React, { useState, useRef, useEffect } from "react";
import { SearchBar, SectionLabel } from "../components/SharedComponents";
import { getCameras, getCameraDetections } from "../api";

// Placeholder images for cameras without a real stream
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80",
  "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=400&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80",
  "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=400&q=80",
];

const CameraCard = ({ camera, onRouteAnalytics, onChooseUpload, onVideoUpload }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={s.card}>
      <div style={s.imageWrapper}>
        <img src={camera.image} alt={camera.camera_id} style={s.image} />
        <div style={s.badge}>
          <span style={s.dot} />
          <span style={s.badgeText}>ONLINE</span>
        </div>
        <div ref={menuRef} style={s.menuWrapper}>
          <button style={s.addBtn} onClick={() => setMenuOpen(!menuOpen)}>+</button>
          {menuOpen && (
            <div style={s.dropdown}>
              <button style={s.dropdownItem} onClick={() => { setMenuOpen(false); onChooseUpload(camera); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload from Gallery
              </button>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          id={`upload-${camera.camera_id}`}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            onVideoUpload(camera, file);
            e.target.value = "";
          }}
        />
      </div>
      <div style={s.info}>
        <p style={s.cameraId}>{camera.camera_id}</p>
        <p style={s.location}>{camera.camera_name}</p>
      </div>
    </div>
  );
};
// Detection count badge for a camera
const DetectionBadge = ({ count }) => (
  <div style={s.detBadge}>{count} detections today</div>
);

const LiveMonitoring = ({ onRouteAnalytics }) => {
  const [cameras, setCameras] = useState([]);
  const [search, setSearch] = useState("");
  const [streamCamera, setStreamCamera] = useState(null);
  const [streamDetections, setStreamDetections] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    if (!processing || processing.status !== "processing") return undefined;

    const timer = setInterval(() => {
      setProcessing((current) => {
        if (!current || current.status !== "processing") return current;
        const progress = current.progress < 90 ? current.progress + 3 : current.progress < 96 ? current.progress + 1 : current.progress;
        return { ...current, progress };
      });
    }, 900);

    return () => clearInterval(timer);
  }, [processing?.status]);

  const fetchCameras = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCameras();
      // Attach placeholder images
      const enriched = (data.cameras || []).map((cam, i) => ({
        ...cam,
        image: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
      }));
      setCameras(enriched);
    } catch (err) {
      setError("Failed to load cameras: " + err.message);
    } finally {
      setLoading(false);
    }
  };
const handleUploadClick = (camera) => {
  const input = document.getElementById(`upload-${camera.camera_id}`);
  if (input) input.click();
};

  const handleVideoUpload = async (camera, file) => {
    const formData = new FormData();
    formData.append("camera_id", camera.camera_id);
    formData.append("file", file);

    setProcessing({
      camera,
      fileName: file.name,
      progress: 8,
      status: "processing",
      message: "Uploading video and starting YOLO processing...",
      result: null,
      error: "",
    });

    try {
      const response = await fetch("http://localhost:8000/upload-video", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.detail || result.error || "Video processing failed");
      }

      setProcessing({
        camera,
        fileName: file.name,
        progress: 100,
        status: "done",
        message: "YOLO processing completed.",
        result,
        error: "",
      });
    } catch (err) {
      setProcessing({
        camera,
        fileName: file.name,
        progress: 100,
        status: "error",
        message: "Video processing failed.",
        result: null,
        error: err.message,
      });
    }
  };

  const closeProcessing = () => {
    setProcessing(null);
    fetchCameras();
  };
  const handleViewStream = async (camera) => {
    setStreamCamera(camera);
    setStreamDetections([]);
    try {
      const data = await getCameraDetections(camera.camera_id, 10);
      setStreamDetections(data.detections || []);
    } catch {
      // Silently fail — detections are bonus info
    }
  };

  const filtered = cameras.filter(
    (c) =>
      c.camera_id.toLowerCase().includes(search.toLowerCase()) ||
      c.camera_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      {/* Page Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a6186" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <h1 style={s.title}>Live Monitoring</h1>
        </div>
        <div style={s.statsRow}>
          <div style={s.statChip}>
            <span style={s.statDot} />
            Online: {loading ? "…" : cameras.length}
          </div>
          <button style={s.refreshBtn} onClick={fetchCameras} title="Refresh cameras">↺ Refresh</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <SearchBar
          placeholder="Search camera ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      <SectionLabel title="Control Room" />

      {/* Camera Grid */}
      {loading ? (
        <div style={s.loadingBox}>Loading cameras from server…</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyBox}>No cameras found.</div>
      ) : (
        <div style={s.grid}>
          {filtered.map((cam) => (
           <CameraCard
  key={cam.camera_id}
  camera={cam}
  onRouteAnalytics={onRouteAnalytics}
  onChooseUpload={handleUploadClick}
  onVideoUpload={handleVideoUpload}
/>
          ))}
        </div>
      )}

      {/* Video Processing Modal */}
      {processing && (
        <div style={s.processingOverlay}>
          <div style={s.processingModal}>
            <div style={s.processingHeader}>
              <div>
                <p style={s.processingTitle}>Video Processing</p>
                <p style={s.processingSub}>
                  {processing.camera.camera_id} - {processing.fileName}
                </p>
              </div>
              {processing.status !== "processing" && (
                <button style={s.modalClose} onClick={closeProcessing}>x</button>
              )}
            </div>

            <div style={s.progressTrack}>
              <div
                style={{
                  ...s.progressFill,
                  width: `${processing.progress}%`,
                  backgroundColor: processing.status === "error" ? "#c0392b" : "#3a6186",
                }}
              />
            </div>

            <div style={s.progressMeta}>
              <span>{processing.message}</span>
              <strong>{processing.progress}%</strong>
            </div>

            {processing.status === "processing" && (
              <p style={s.processingHint}>Keep this screen open while YOLO analyzes the video.</p>
            )}

            {processing.status === "done" && (
              <div style={s.processingResult}>
                <p style={s.resultMain}>Total vehicles counted: {processing.result?.total_counted ?? 0}</p>
                <button style={s.doneBtn} onClick={closeProcessing}>Done</button>
              </div>
            )}

            {processing.status === "error" && (
              <div style={s.processingResult}>
                <p style={s.errorText}>{processing.error}</p>
                <button style={s.doneBtn} onClick={closeProcessing}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stream Modal */}
      {streamCamera && (
        <div style={s.modalOverlay} onClick={() => setStreamCamera(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <p style={s.modalTitle}>{streamCamera.camera_id}</p>
                <p style={s.modalSub}>{streamCamera.camera_name}</p>
                {streamCamera.latitude && (
                  <p style={s.modalCoords}>
                    {parseFloat(streamCamera.latitude).toFixed(4)}°, {parseFloat(streamCamera.longitude).toFixed(4)}°
                  </p>
                )}
              </div>
              <button style={s.modalClose} onClick={() => setStreamCamera(null)}>✕</button>
            </div>
            <div style={{ position: "relative" }}>
              <img src={streamCamera.image} alt={streamCamera.camera_id} style={s.streamImg} />
              <div style={s.streamBadge}><span style={s.dot} /> LIVE</div>
            </div>
            {/* Recent detections */}
            {streamDetections.length > 0 && (
              <div style={s.detectionList}>
                <p style={s.detectionTitle}>Recent Detections</p>
                <div style={s.detectionScroll}>
                  {streamDetections.map((d) => (
                    <div key={d.detection_id} style={s.detectionRow}>
                      <span style={s.detectionType}>{d.vehicle_type}</span>
                      <span style={s.detectionTime}>
                        {new Date(d.detection_time).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding: "32px 36px", height: "100%", overflowY: "auto", backgroundColor: "#f5f5ec", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#1a1a1a" },
  statsRow: { display: "flex", gap: "10px", alignItems: "center" },
  statChip: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#e6f4ea", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: "600", color: "#2e7d32" },
  statDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4caf50", display: "inline-block" },
  refreshBtn: { padding: "6px 12px", backgroundColor: "#e8eddf", color: "#555", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  card: { backgroundColor: "#e8eddf", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer" },
  imageWrapper: { position: "relative", width: "100%", aspectRatio: "16/9" },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  badge: { position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(30,30,30,0.65)", borderRadius: "20px", padding: "3px 8px", display: "flex", alignItems: "center", gap: "5px" },
  dot: { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#4caf50", display: "inline-block" },
  badgeText: { color: "#fff", fontSize: "10px", fontWeight: "600", letterSpacing: "0.5px" },
  menuWrapper: { position: "absolute", top: "10px", right: "10px" },
  addBtn: { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#6a8f5e", border: "none", color: "#fff", fontSize: "20px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", paddingBottom: "2px" },
  dropdown: { position: "absolute", top: "36px", right: 0, backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 100, minWidth: "160px" },
  dropdownItem: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "11px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#333", fontFamily: "inherit", textAlign: "left" },
  info: { padding: "10px 12px 12px" },
  cameraId: { margin: 0, fontSize: "14px", fontWeight: "700", color: "#222" },
  location: { margin: "2px 0 0", fontSize: "12px", color: "#777" },
  detBadge: { backgroundColor: "#e8eddf", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "#555", marginTop: "4px", display: "inline-block" },
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { backgroundColor: "#fff", borderRadius: "16px", width: "90%", maxWidth: "640px", overflow: "hidden", position: "relative", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1a1a" },
  modalSub: { margin: "2px 0 0", fontSize: "13px", color: "#888" },
  modalCoords: { margin: "2px 0 0", fontSize: "11px", color: "#aaa", fontFamily: "monospace" },
  modalClose: { background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#888", padding: "4px" },
  streamImg: { width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" },
  streamBadge: { position: "absolute", bottom: "16px", left: "16px", backgroundColor: "rgba(30,30,30,0.7)", borderRadius: "20px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontSize: "12px", fontWeight: "700" },
  detectionList: { padding: "16px 20px" },
  detectionTitle: { margin: "0 0 10px", fontSize: "14px", fontWeight: "700", color: "#1a1a1a" },
  detectionScroll: { display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" },
  detectionRow: { display: "flex", justifyContent: "space-between", backgroundColor: "#f8faf5", borderRadius: "6px", padding: "8px 12px" },
  detectionType: { fontSize: "13px", fontWeight: "600", color: "#1a1a1a", textTransform: "capitalize" },
  detectionTime: { fontSize: "12px", color: "#888" },
  errorBox: { backgroundColor: "#fde8e8", border: "1px solid #f5b7b7", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#c0392b" },
  loadingBox: { textAlign: "center", padding: "60px", color: "#888", fontSize: "14px" },
  emptyBox: { textAlign: "center", padding: "60px", color: "#aaa", fontSize: "14px" },
  processingOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "20px" },
  processingModal: { width: "100%", maxWidth: "520px", backgroundColor: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 12px 40px rgba(0,0,0,0.24)" },
  processingHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "18px" },
  processingTitle: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#1a1a1a" },
  processingSub: { margin: "4px 0 0", fontSize: "13px", color: "#777", wordBreak: "break-word" },
  progressTrack: { height: "12px", width: "100%", backgroundColor: "#e8eddf", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "999px", transition: "width 0.35s ease" },
  progressMeta: { display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "10px", fontSize: "13px", color: "#555" },
  processingHint: { margin: "14px 0 0", fontSize: "12px", color: "#888" },
  processingResult: { marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  resultMain: { margin: 0, fontSize: "14px", fontWeight: "700", color: "#2e7d32" },
  errorText: { margin: 0, fontSize: "14px", fontWeight: "700", color: "#c0392b" },
  doneBtn: { padding: "8px 16px", backgroundColor: "#3a6186", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
};

export default LiveMonitoring;
