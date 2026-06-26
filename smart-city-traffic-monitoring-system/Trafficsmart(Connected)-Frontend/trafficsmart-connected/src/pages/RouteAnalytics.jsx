import React, { useEffect, useMemo, useState } from "react";
import { StatusBadge, VehicleStatCard } from "../components/SharedComponents";
import { getCameraDetections } from "../api";

const EMPTY_STATS = {
  totalVehicles: 0,
  car: 0,
  bus: 0,
  truck: 0,
  motorcycle: 0,
  rickshaw: 0,
  others: 0,
};

const TIME_WINDOWS = [15, 30, 60, 120, 180, 360];

const computeStats = (detections) => {
  const counts = { ...EMPTY_STATS };

  detections.forEach((d) => {
    const type = (d.vehicle_type || "").toLowerCase();
    if (counts[type] !== undefined && type !== "totalVehicles") {
      counts[type] += 1;
    } else {
      counts.others += 1;
    }
  });

  return {
    ...counts,
    totalVehicles: detections.length,
  };
};

const getCongestionLevel = (total, minutes) => {
  const vehiclesPerHour = minutes > 0 ? (total / minutes) * 60 : total;

  if (vehiclesPerHour >= 80) return "HIGH";
  if (vehiclesPerHour >= 40) return "MODERATE";
  return "LOW";
};

const getLatestTime = (detections) => {
  if (!detections.length) return null;

  return detections.reduce((latest, detection) => {
    const time = new Date(detection.detection_time).getTime();
    return Number.isFinite(time) && time > latest ? time : latest;
  }, 0);
};

const formatWindow = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
};

const getMostCommonVehicle = (stats) => {
  const sorted = Object.entries({
    car: stats.car,
    bus: stats.bus,
    truck: stats.truck,
    motorcycle: stats.motorcycle,
    rickshaw: stats.rickshaw,
    others: stats.others,
  }).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[1] > 0 ? sorted[0][0] : "-";
};

const RouteAnalytics = ({ camera, onBack }) => {
  const [detections, setDetections] = useState([]);
  const [timeWindow, setTimeWindow] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cameraId = camera?.camera_id || camera?.id || "-";
  const location = camera?.camera_name || camera?.location || "-";

  useEffect(() => {
    if (!cameraId || cameraId === "-") return;
    fetchDetections();
  }, [cameraId]);

  const filteredDetections = useMemo(() => {
    const latestTime = getLatestTime(detections);
    if (!latestTime) return [];

    const cutoff = latestTime - timeWindow * 60 * 1000;
    return detections.filter((d) => {
      const time = new Date(d.detection_time).getTime();
      return Number.isFinite(time) && time >= cutoff && time <= latestTime;
    });
  }, [detections, timeWindow]);

  const stats = useMemo(() => computeStats(filteredDetections), [filteredDetections]);
  const congestionLevel = useMemo(
    () => getCongestionLevel(stats.totalVehicles, timeWindow),
    [stats.totalVehicles, timeWindow]
  );

  const latestDetectionTime = useMemo(() => {
    const latest = getLatestTime(filteredDetections);
    return latest ? new Date(latest).toLocaleTimeString() : "-";
  }, [filteredDetections]);

  const fetchDetections = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCameraDetections(cameraId, 500);
      setDetections(data.detections || []);
    } catch (err) {
      setError("Failed to load detection data: " + err.message);
      setDetections([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.topHeader}>
        <button onClick={onBack} style={s.backBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div style={s.headerTitle}>
          <p style={s.headerMain}>ROUTE ANALYTICS</p>
          <p style={s.headerSub}><span style={{ color: "#2a6ebb" }}>●</span> LIVE MONITORING</p>
        </div>
        <button style={s.refreshSmall} onClick={fetchDetections} title="Refresh data">Refresh</button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <div style={s.loadingBox}>Loading detection data...</div>
      ) : (
        <div style={s.twoCol}>
          <div>
            <div style={s.card}>
              <div style={s.topRow}>
                <div>
                  <p style={s.cameraId}>{cameraId}</p>
                  <p style={s.location}>{location}</p>
                  {camera?.latitude && (
                    <p style={s.coords}>
                      {parseFloat(camera.latitude).toFixed(4)}, {parseFloat(camera.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
                <StatusBadge status={congestionLevel} />
              </div>

              {/* <div style={s.congestionPanel}>
                <p style={s.panelLabel}>Congestion Level</p>
                <p style={{ ...s.congestionValue, color: levelColors[congestionLevel] }}>
                  {congestionLevel}
                </p>
                <p style={s.panelMeta}>
                  {stats.totalVehicles} detections in the last {formatWindow(timeWindow)}
                </p>
              </div> */}

              <div style={s.statsGrid}>
                <VehicleStatCard label="Total Vehicles" count={stats.totalVehicles} fullWidth />
                <VehicleStatCard label="Car" count={stats.car} />
                <VehicleStatCard label="Bus" count={stats.bus} />
                <VehicleStatCard label="Truck" count={stats.truck} />
                <VehicleStatCard label="Motorcycle" count={stats.motorcycle} />
                <VehicleStatCard label="Rickshaw" count={stats.rickshaw} />
                <VehicleStatCard label="Others" count={stats.others} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={s.sliderCard}>
              <div style={s.sliderHead}>
                <div>
                  <p style={s.summaryTitle}>Time Window</p>
                  <p style={s.sliderSub}>Move the slider to recalculate congestion.</p>
                </div>
                <span style={s.windowPill}>{formatWindow(timeWindow)}</span>
              </div>

              <input
                type="range"
                min={0}
                max={TIME_WINDOWS.length - 1}
                step={1}
                value={TIME_WINDOWS.indexOf(timeWindow)}
                onChange={(e) => setTimeWindow(TIME_WINDOWS[Number(e.target.value)])}
                style={s.slider}
              />

              <div style={s.sliderTicks}>
                {TIME_WINDOWS.map((minutes) => (
                  <span key={minutes} style={minutes === timeWindow ? s.activeTick : s.tick}>
                    {formatWindow(minutes)}
                  </span>
                ))}
              </div>
            </div>

            {/* <div style={s.summaryCard}>
              <p style={s.summaryTitle}>Traffic Summary</p>
              <div style={s.summaryGrid}>
                {[
                  { label: "Congestion", value: congestionLevel },
                  { label: "Total Detections", value: stats.totalVehicles },
                  { label: "Most Common", value: getMostCommonVehicle(stats) },
                  { label: "Last Detection", value: latestDetectionTime },
                ].map((item) => (
                  <div key={item.label} style={s.summaryItem}>
                    <p style={s.summaryLabel}>{item.label}</p>
                    <p style={s.summaryVal}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div> */}

            {/* {filteredDetections.length > 0 && (
              <div style={s.recentCard}>
                <p style={s.summaryTitle}>Recent Detections</p>
                <div style={s.recentScroll}>
                  {filteredDetections.slice(0, 8).map((d) => (
                    <div key={d.detection_id} style={s.recentRow}>
                      <span style={s.recentType}>{d.vehicle_type}</span>
                      <span style={s.recentTime}>{new Date(d.detection_time).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

const levelColors = {
  LOW: "#2e7d32",
  MODERATE: "#b7791f",
  HIGH: "#c62828",
};

const s = {
  page: { padding: "32px 36px", height: "100%", overflowY: "auto", backgroundColor: "#f5f5ec", fontFamily: "'Segoe UI', sans-serif" },
  topHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", padding: "8px 14px", fontSize: "13px", fontWeight: "500", color: "#333", fontFamily: "inherit", backgroundColor: "#fff" },
  refreshSmall: { padding: "8px 14px", backgroundColor: "#e8eddf", color: "#555", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  headerTitle: { textAlign: "center" },
  headerMain: { margin: 0, fontSize: "14px", fontWeight: "700", letterSpacing: "1.2px", color: "#1a1a1a" },
  headerSub: { margin: "3px 0 0", fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", color: "#2a6ebb" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },
  card: { backgroundColor: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" },
  cameraId: { margin: 0, fontSize: "26px", fontWeight: "800", color: "#1a1a1a" },
  location: { margin: "4px 0 0", fontSize: "13px", color: "#888" },
  coords: { margin: "2px 0 0", fontSize: "11px", color: "#aaa", fontFamily: "monospace" },
  congestionPanel: { backgroundColor: "#f8faf5", borderRadius: "10px", padding: "16px 18px", marginBottom: "14px" },
  panelLabel: { margin: 0, fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700" },
  congestionValue: { margin: "6px 0 0", fontSize: "34px", lineHeight: 1, fontWeight: "800" },
  panelMeta: { margin: "8px 0 0", fontSize: "13px", color: "#666" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  sliderCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sliderHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" },
  sliderSub: { margin: "4px 0 0", fontSize: "12px", color: "#888" },
  windowPill: { flexShrink: 0, backgroundColor: "#e8eddf", color: "#46624a", borderRadius: "999px", padding: "7px 12px", fontSize: "12px", fontWeight: "700" },
  slider: { width: "100%" },
  sliderTicks: { display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "8px" },
  tick: { fontSize: "11px", color: "#aaa", whiteSpace: "nowrap" },
  activeTick: { fontSize: "11px", color: "#2a6ebb", fontWeight: "700", whiteSpace: "nowrap" },
  summaryCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  recentCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  summaryTitle: { margin: "0 0 16px", fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  summaryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  summaryItem: { backgroundColor: "#f8faf5", borderRadius: "8px", padding: "12px 14px" },
  summaryLabel: { margin: 0, fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" },
  summaryVal: { margin: "4px 0 0", fontSize: "14px", fontWeight: "600", color: "#1a1a1a", textTransform: "capitalize" },
  recentScroll: { display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" },
  recentRow: { display: "flex", justifyContent: "space-between", backgroundColor: "#f8faf5", borderRadius: "6px", padding: "8px 12px" },
  recentType: { fontSize: "13px", fontWeight: "600", color: "#1a1a1a", textTransform: "capitalize" },
  recentTime: { fontSize: "12px", color: "#888" },
  errorBox: { backgroundColor: "#fde8e8", border: "1px solid #f5b7b7", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#c0392b" },
  loadingBox: { textAlign: "center", padding: "80px", color: "#888", fontSize: "14px" },
};

export default RouteAnalytics;
