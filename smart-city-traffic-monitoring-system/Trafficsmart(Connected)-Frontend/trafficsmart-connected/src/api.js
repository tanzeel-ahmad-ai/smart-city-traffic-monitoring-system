// =============================================
// TrafficSmart API Service
// Base URL: http://localhost:8000
// =============================================

const BASE_URL = "http://localhost:8000";

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "API error");
  }
  return data;
};

// ── Auth ──────────────────────────────────────
export const login = (email, password, role) =>
  request("POST", "/login", { email, password, role });

export const register = (email, password, role) =>
  request("POST", "/register", { email, password, role });

// ── Cameras ──────────────────────────────────
export const getCameras = () => request("GET", "/cameras");
export const searchCameras = (q) => request("GET", `/cameras/search?q=${encodeURIComponent(q)}`);
export const getCameraById = (id) => request("GET", `/cameras/${id}`);
export const addCamera = (camera_id, camera_name, latitude, longitude) =>
  request("POST", "/cameras", { camera_id, camera_name, latitude, longitude });
export const geocode = (location) =>
  request("GET", `/geocode?location=${encodeURIComponent(location)}`);

// ── Detections ────────────────────────────────
export const getDetections = (limit = 100) =>
  request("GET", `/detections?limit=${limit}`);
export const getCameraDetections = (camera_id, limit = 50) =>
  request("GET", `/detections/${encodeURIComponent(camera_id)}?limit=${limit}`);

// ── Statistics ────────────────────────────────
export const getStatistics = () => request("GET", "/statistics");

// ── Vehicles ─────────────────────────────────
export const getVehicles = () => request("GET", "/vehicles");
