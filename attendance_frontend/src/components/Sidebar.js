import React from "react";

// PUBLIC_INTERFACE
function Sidebar({ nav, current, onNav, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-title">Attendance</div>
      <ul>
        {nav.map((item) => (
          <li key={item.key}>
            <button
              className={current === item.key ? "active" : ""}
              onClick={() => onNav(item.key)}
              tabIndex={0}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-bottom">
        <button className="btn-outline" onClick={onLogout}>
          Logout
        </button>
        <span className="sidebar-powered">
          Powered by <b>KAVIA</b>
        </span>
      </div>
    </nav>
  );
}

export default Sidebar;
