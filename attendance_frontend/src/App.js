import React, { useState, useEffect } from "react";
import "./App.css";

// ---- Helper functions for Local Storage ----
const LS_KEY_USERS = "attendance_users";
const LS_KEY_ATTENDANCE = "attendance_records";
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

// ------------------- Auth ----------------------
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

// ----------------- Sidebar -------------------
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
        <span className="sidebar-powered">Powered by <b>KAVIA</b></span>
      </div>
    </nav>
  );
}

// ----------------- App Bar -------------------
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

// ------------------- Student List CRUD -------------
// PUBLIC_INTERFACE
function StudentList({ students, onAdd, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // PUBLIC_INTERFACE
  function onEditClick(student) {
    setEditing(student);
    setShowForm(true);
  }

  const sortedStudents = [...students].sort((a, b) =>
    a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );

  return (
    <div className="content-card">
      <div className="card-header">
        <h2>Students</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Add Student
        </button>
      </div>
      {showForm && (
        <StudentForm
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={(student) => {
            editing ? onEdit(student) : onAdd(student);
            setShowForm(false);
          }}
          editStudent={editing}
        />
      )}
      {students.length === 0 ? (
        <div className="empty-note">No students yet. Add your first student.</div>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.lastName}, {s.firstName}</td>
                <td>{s.studentId}</td>
                <td>
                  <button className="btn-icon" title="Edit" onClick={() => onEditClick(s)}>✎</button>
                  <button
                    className="btn-icon danger"
                    title="Delete"
                    onClick={() => onDelete(s.id)}
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --------------- Student Form ---------------
function StudentForm({ onSubmit, onClose, editStudent }) {
  const [firstName, setFirstName] = useState(editStudent?.firstName || "");
  const [lastName, setLastName] = useState(editStudent?.lastName || "");
  const [studentId, setStudentId] = useState(editStudent?.studentId || "");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !lastName || !studentId) {
      setError("All fields required");
      return;
    }
    onSubmit({
      id: editStudent?.id ?? (Date.now().toString(36) + "_" + Math.random().toString(36).substr(2)),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studentId: studentId.trim(),
    });
  }

  return (
    <div className="modal-bg">
      <form className="student-form" onSubmit={handleSubmit} aria-modal="true">
        <h3>{editStudent ? "Edit Student" : "Add Student"}</h3>
        {error && <div className="form-error">{error}</div>}
        <input
          placeholder="First Name"
          value={firstName}
          autoFocus
          onChange={e => setFirstName(e.target.value)}
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
        <input
          placeholder="Student ID"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
        <div className="form-actions">
          <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn-primary" type="submit">{editStudent ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}

// ---------------- Attendance Marking ----------
// PUBLIC_INTERFACE
function MarkAttendance({ students, todayAttendance, onMark, onSave, todayStr }) {
  return (
    <div className="content-card">
      <div className="card-header">
        <h2>Mark Attendance</h2>
        <span className="muted-label">Date: <b>{todayStr}</b></span>
        <button className="btn-primary" onClick={onSave}>Save</button>
      </div>
      {students.length === 0 ? (
        <div className="empty-note">Add students to mark attendance.</div>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.lastName}, {s.firstName}</td>
                <td>{s.studentId}</td>
                <td>
                  <select
                    value={todayAttendance[s.id]?.status || ""}
                    onChange={e => onMark(s.id, e.target.value)}
                    aria-label={`Attendance status for ${s.firstName} ${s.lastName}`}
                  >
                    <option value="">--</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </td>
                <td>
                  <input
                    value={todayAttendance[s.id]?.note || ""}
                    onChange={e => onMark(s.id, todayAttendance[s.id]?.status || "", e.target.value)}
                    placeholder="(optional)"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ----------------- Attendance History and Statistics ------------
// PUBLIC_INTERFACE
function AttendanceHistory({ students, attendance }) {
  // attendance: { "2023-06-10": { studentId1: {status: 'present', note} ... } }
  // Build array: [{date, student, status, note}, ...]
  const events = [];
  Object.entries(attendance).forEach(([date, records]) => {
    Object.entries(records).forEach(([sid, rec]) => {
      const s = students.find(x => x.id === sid);
      if (s) {
        events.push({
          date,
          student: s,
          status: rec.status,
          note: rec.note || "",
        });
      }
    });
  });
  const sortedEvents = events.sort((a, b) =>
    b.date.localeCompare(a.date) ||
    a.student.lastName.localeCompare(b.student.lastName)
  );

  // Statistics
  const stat = {};
  students.forEach((s) => {
    stat[s.id] = { present: 0, absent: 0, total: 0 };
  });
  Object.values(attendance).forEach(records => {
    Object.entries(records).forEach(([sid, rec]) => {
      if (stat[sid]) {
        if (rec.status === "present") stat[sid].present += 1;
        else if (rec.status === "absent") stat[sid].absent += 1;
        stat[sid].total += 1;
      }
    });
  });
  return (
    <div className="content-card">
      <div className="card-header">
        <h2>Attendance History</h2>
      </div>
      {events.length === 0 ? <div className="empty-note">No attendance records yet.</div> : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((ev, idx) => (
              <tr key={ev.date + "_" + ev.student.id + idx}>
                <td>{ev.date}</td>
                <td>{ev.student.lastName}, {ev.student.firstName}</td>
                <td>
                  {ev.status === "present" && <b className="present">Present</b>}
                  {ev.status === "absent" && <span className="absent">Absent</span>}
                </td>
                <td>{ev.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <StatisticsPanel students={students} stat={stat} />
    </div>
  );
}

// PUBLIC_INTERFACE
function StatisticsPanel({ students, stat }) {
  if (!students.length) return null;

  const statsRows = students.map(s => ({
    name: `${s.lastName}, ${s.firstName}`,
    present: stat[s.id]?.present || 0,
    absent: stat[s.id]?.absent || 0,
    total: stat[s.id]?.total || 0,
    percent:
      (stat[s.id]?.total ?? 0) > 0
        ? Math.round((stat[s.id].present / stat[s.id].total) * 100)
        : "-",
  }));

  return (
    <div className="statistics-panel">
      <h3>Statistics</h3>
      <table className="student-table small">
        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Total</th>
            <th>% Present</th>
          </tr>
        </thead>
        <tbody>
          {statsRows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.name}</td>
              <td>{r.present}</td>
              <td>{r.absent}</td>
              <td>{r.total}</td>
              <td>{typeof r.percent === "number" ? `${r.percent}%` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------ Main App ---------------
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

// PUBLIC_INTERFACE
function App() {
  // Auth
  const [username, setUsername] = useState(() =>
    loadFromStorage(LS_KEY_AUTH, null)?.username || null
  );
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // KAVIA theme override (light always by default, demo only)
    document.documentElement.style.setProperty("--primary", "#1976d2");
    document.documentElement.style.setProperty("--accent", "#ffb300");
    document.documentElement.style.setProperty("--secondary", "#64b5f6");
  }, [theme]);

  // Locally persisted state
  const [students, setStudents] = useState(() =>
    loadFromStorage(LS_KEY_USERS, [])
  );
  const [attendance, setAttendance] = useState(() =>
    loadFromStorage(LS_KEY_ATTENDANCE, {})
  );

  // UI state
  const [view, setView] = useState("studentList");

  // Attendance for today (in-memory)
  const todayStr = getTodayStr();
  const [todayAttendance, setTodayAttendance] = useState(() => {
    // Draft record for today, not yet saved to full attendance object
    return {};
  });

  // --- CRUD actions ---
  function handleAddStudent(student) {
    const arr = [...students, student];
    setStudents(arr);
    saveToStorage(LS_KEY_USERS, arr);
  }
  function handleEditStudent(student) {
    const arr = students.map((s) => (s.id === student.id ? student : s));
    setStudents(arr);
    saveToStorage(LS_KEY_USERS, arr);
  }
  function handleDeleteStudent(id) {
    if (
      // eslint-disable-next-line no-restricted-globals
      window.confirm("Are you sure you want to delete this student?")
    ) {
      const arr = students.filter((s) => s.id !== id);
      setStudents(arr);
      saveToStorage(LS_KEY_USERS, arr);
      // Also remove any attendance for deleted student
      const newAttendance = {};
      Object.entries(attendance).forEach(([date, recs]) => {
        const newRec = { ...recs };
        if (id in newRec) delete newRec[id];
        newAttendance[date] = newRec;
      });
      setAttendance(newAttendance);
      saveToStorage(LS_KEY_ATTENDANCE, newAttendance);
    }
  }

  // Attendance marking handler
  function handleMarkAttendance(studentId, status, note = "") {
    setTodayAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        note: status ? (note || prev[studentId]?.note || "") : "",
      },
    }));
  }
  function handleSaveAttendance() {
    if (!Object.keys(todayAttendance).length) return;
    // Store for today
    const newAtt = {
      ...attendance,
      [todayStr]: {
        ...(attendance[todayStr] || {}),
        ...todayAttendance,
      },
    };
    setAttendance(newAtt);
    saveToStorage(LS_KEY_ATTENDANCE, newAtt);
    setTodayAttendance({});
    alert("Attendance saved for today.");
  }

  // -------- Navigation ---------
  const navConfig = [
    { key: "studentList", label: "Students", icon: "🧑‍🎓" },
    { key: "markAttendance", label: "Mark Attendance", icon: "📝" },
    { key: "history", label: "History & Stats", icon: "📊" },
  ];

  // Logout option
  function handleLogout() {
    setUsername(null);
    // Optionally clear username storage for full logout: localStorage.removeItem(LS_KEY_AUTH);
  }

  // PUBLIC_INTERFACE
  if (!username) {
    return <Auth onAuth={(u) => setUsername(u)} />;
  }

  return (
    <div className="app-root">
      <Sidebar
        nav={navConfig}
        current={view}
        onNav={setView}
        onLogout={handleLogout}
      />
      <div className="main-area">
        <AppBar
          title={
            view === "studentList"
              ? "Student Manager"
              : view === "markAttendance"
              ? "Mark Attendance"
              : view === "history"
              ? "Attendance History & Statistics"
              : ""
          }
          theme={theme}
          onTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          username={username}
        />
        <main>
          {view === "studentList" && (
            <StudentList
              students={students}
              onAdd={handleAddStudent}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          )}
          {view === "markAttendance" && (
            <MarkAttendance
              students={students}
              todayAttendance={todayAttendance}
              onMark={(id, status, note) => handleMarkAttendance(id, status, note)}
              onSave={handleSaveAttendance}
              todayStr={todayStr}
            />
          )}
          {view === "history" && (
            <AttendanceHistory students={students} attendance={attendance} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
