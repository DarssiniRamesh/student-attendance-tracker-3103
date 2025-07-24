import React, { useState, useEffect } from "react";

const LS_KEY_AUTH = "attendance_auth_user";
function saveToStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
function loadFromStorage(key, fallback) {
  const v = window.localStorage.getItem(key);
  if (!v) return fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
function Auth({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);

  // For demo: fixed username/password, or auto-register on first use
  const DEMO_USER = "teacher";
  const DEMO_PASS = "kavia123";
  useEffect(() => {
    // For demo, pre-register if not present
    if (!window.localStorage.getItem(LS_KEY_AUTH)) {
      saveToStorage(LS_KEY_AUTH, { username: DEMO_USER, password: DEMO_PASS });
    }
  }, []);

  // PUBLIC_INTERFACE
  function handleLogin(e) {
    e.preventDefault();
    const auth = loadFromStorage(LS_KEY_AUTH, {});
    if (
      (username === auth.username && password === auth.password) ||
      // developer shortcut (for demo/demo)
      (username === "demo" && password === "demo")
    ) {
      onAuth(auth.username ?? username);
    } else {
      setInvalid(true);
    }
  }

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={handleLogin} autoComplete="off">
        <h2>Attendance App Login</h2>
        <input
          className="auth-input"
          autoFocus
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="Username"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
        />
        {invalid && <div className="auth-error">Invalid credentials</div>}
        <button className="btn-primary" type="submit">
          Login
        </button>
        <div className="auth-demo-tip">
          <small>
            <b>Demo user:</b> <code>teacher</code> / <code>kavia123</code>
            <br />
            or <code>demo/demo</code>
          </small>
        </div>
      </form>
    </div>
  );
}

export default Auth;
