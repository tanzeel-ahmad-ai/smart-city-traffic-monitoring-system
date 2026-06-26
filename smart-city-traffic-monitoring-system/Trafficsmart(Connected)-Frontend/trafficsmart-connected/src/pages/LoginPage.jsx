import React, { useState } from "react";
import { login } from "../api";

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password, role);
      // Optionally store user info
      if (keepLogged) {
        localStorage.setItem("ts_user", JSON.stringify({ id: data.user_id, email: data.email, role: data.role }));
      }
      onLogin(data.role, { id: data.user_id, email: data.email, role: data.role });
    } catch (err) {
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div style={s.page}>
      <div style={s.logoSection}>
        <div style={s.logoBox}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="2" width="10" height="20" rx="3" fill="#fff" opacity="0.3" />
            <rect x="7" y="2" width="10" height="20" rx="3" stroke="#fff" strokeWidth="1.8" />
            <circle cx="12" cy="7" r="2" fill="#e74c3c" />
            <circle cx="12" cy="12" r="2" fill="#f1c40f" />
            <circle cx="12" cy="17" r="2" fill="#fff" />
          </svg>
        </div>
        <p style={s.appName}>TrafficSmart</p>
        <p style={s.appSub}>Intelligent Urban Mobility</p>
      </div>

      <div style={s.card}>
        <p style={s.cardTitle}>Login</p>
        <div style={s.divider} />

        <p style={s.accessLabel}>ACCESS LEVEL</p>
        <div style={s.toggleRow}>
          <button
            style={{ ...s.toggleBtn, ...(role === "citizen" ? s.toggleActive : s.toggleInactive) }}
            onClick={() => { setRole("citizen"); setError(""); }}
          >
            👤 Citizen
          </button>
          <button
            style={{ ...s.toggleBtn, ...(role === "admin" ? s.toggleActive : s.toggleInactive) }}
            onClick={() => { setRole("admin"); setError(""); }}
          >
            ⚙️ Admin
          </button>
        </div>

        <p style={s.fieldLabel}>Email Address</p>
        <div style={s.inputRow}>
          <span>✉️</span>
          <input
            style={s.input}
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
          <p style={s.fieldLabel}>Password</p>

        </div>
        <div style={s.inputRow}>
          <span>🔒</span>
          <input
            style={s.input}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && (
          <div style={s.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <button style={{ ...s.loginBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      </div>
    </div>
  );
};

const s = {
  page: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#e8eddf", fontFamily: "'Segoe UI', sans-serif", padding: "24px" },
  logoSection: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" },
  logoBox: { width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#7a9e6e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" },
  appName: { margin: 0, fontSize: "24px", fontWeight: "800", color: "#1a1a1a" },
  appSub: { margin: "4px 0 0", fontSize: "13px", color: "#777" },
  card: { backgroundColor: "#f0f3e8", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  cardTitle: { margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "#1a1a1a", textAlign: "center" },
  divider: { width: "100%", height: "1.5px", backgroundColor: "#c5cdb8", marginBottom: "20px" },
  accessLabel: { margin: "0 0 10px", fontSize: "11px", fontWeight: "700", letterSpacing: "1.2px", color: "#555" },
  toggleRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  toggleBtn: { flex: 1, padding: "11px", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  toggleActive: { backgroundColor: "#7a9e6e", color: "#fff" },
  toggleInactive: { backgroundColor: "#dde4d4", color: "#666" },
  fieldLabel: { margin: "0 0 7px", fontSize: "13px", fontWeight: "600", color: "#333" },
  inputRow: { display: "flex", alignItems: "center", backgroundColor: "#fff", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", gap: "10px" },
  input: { flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#333", backgroundColor: "transparent", fontFamily: "inherit" },
  loginBtn: { width: "100%", padding: "15px", backgroundColor: "#7a9e6e", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" },
  errorBox: { backgroundColor: "#fde8e8", border: "1px solid #f5b7b7", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#c0392b", fontWeight: "500" },
};

export default LoginPage;
