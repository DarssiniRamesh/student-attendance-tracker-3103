import React from "react";

// PUBLIC_INTERFACE
function AppBar({ title, onTheme, theme, username }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>{title}</span>
      </div>
      <div className="topbar-actions">
        <button
          className="theme-toggle"
          onClick={onTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {username && (
          <div className="topbar-user" title="Logged in">
            👤 {username}
          </div>
        )}
      </div>
    </header>
  );
}

export default AppBar;
