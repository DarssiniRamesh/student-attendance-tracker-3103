import React, { useEffect, useState } from 'react';
import './App.css';

// --- Dummy seed data (for first load) ---
const DEMO_STUDENTS = [
  { id: 101, name: "Olivia Turner", roll: "A1001" },
  { id: 102, name: "Maxwell Reed", roll: "A1002" },
  { id: 103, name: "Sophia Kim", roll: "B1003" },
  { id: 104, name: "Liam Chen", roll: "B1004" },
  { id: 105, name: "Ava Patel", roll: "C1005" },
  { id: 106, name: "Lucas Becker", roll: "C1006" },
  { id: 107, name: "Emma Rivera", roll: "C1007" }
];
// Attendance for 7 days, mix of present/absent (dates: recent 7 days)
function demoAttendance(students) {
  const today = new Date();
  const recs = [];
  for (let day = 0; day < 7; ++day) {
    const d = new Date(today);
    d.setDate(today.getDate() - day);
    const date = d.toISOString().slice(0, 10);

    students.forEach((student, sIdx) => {
      // Stagger attendance: first four students almost always present, some diversity after
      let status;
      if (sIdx <= 3) { // mostly present
        status = day === 2 && sIdx === 2 ? "absent" : "present";
      } else {
        // Day 0: present, days 3/6: absent, rest: present
        status = (day === 3 && sIdx === 4) || (day === 6 && sIdx === 6)
          ? "absent"
          : "present";
      }
      // Skip 1-2 records to make the demo less mechanical
      if ((student.id === 106 && day === 5) || (student.id === 107 && day === 1)) return;
      recs.push({ studentId: student.id, date, status });
    });
  }
  return recs;
}

// PUBLIC_INTERFACE
function App() {
  // SEED DEMO DATA: only if localStorage has none yet
  React.useEffect(() => {
    if (
      !localStorage.getItem('students') ||
      JSON.parse(localStorage.getItem('students')).length === 0
    ) {
      localStorage.setItem('students', JSON.stringify(DEMO_STUDENTS));
      localStorage.setItem('attendance', JSON.stringify(demoAttendance(DEMO_STUDENTS)));
    }
    // Optional: Seed a demo user for polished login
    if (
      !localStorage.getItem('auth')
    ) {
      localStorage.setItem('auth', JSON.stringify({ loggedIn: false, user: null }));
    }
  }, []);

  // App-wide state
  const [auth, setAuth] = useState(() => {
    // Simulate logged-out by default
    return JSON.parse(localStorage.getItem('auth')) || { loggedIn: false, user: null };
  });
  const [students, setStudents] = useState(() => {
    return JSON.parse(localStorage.getItem('students')) || [];
  });
  const [attendance, setAttendance] = useState(() => {
    return JSON.parse(localStorage.getItem('attendance')) || [];
  });
  const [route, setRoute] = useState('dashboard'); // dashboard | students | mark | stats | login
  const [sidebarOpen, setSidebarOpen] = useState(false); // For responsive

  // Effect: persist any changes to local storage
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  // PUBLIC_INTERFACE
  const handleLogin = (user) => {
    setAuth({ loggedIn: true, user });
    setRoute('dashboard');
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    setAuth({ loggedIn: false, user: null });
    setRoute('login');
  };

  // PUBLIC_INTERFACE
  const addStudent = (student) => {
    setStudents([...students, { ...student, id: Date.now() }]);
  };

  // PUBLIC_INTERFACE
  const updateStudent = (id, changes) => {
    setStudents(students.map(s => (s.id === id ? { ...s, ...changes } : s)));
  };

  // PUBLIC_INTERFACE
  const deleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
    setAttendance(attendance.filter(a => a.studentId !== id));
  };

  // PUBLIC_INTERFACE
  const markAttendance = (studentId, status) => {
    const today = new Date().toISOString().slice(0, 10);
    setAttendance([
      ...attendance.filter(
        (a) => !(a.studentId === studentId && a.date === today)
      ),
      { studentId, date: today, status },
    ]);
  };

  // PUBLIC_INTERFACE
  const changeRoute = (r) => {
    setRoute(r);
    setSidebarOpen(false);
  };

  // MAIN RENDER
  if (!auth.loggedIn) {
    return (
      <div className="login-bg">
        <TopBar loggedIn={false} />
        <div className="login-container">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Sidebar
        route={route}
        setRoute={changeRoute}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={auth.user}
      />
      <div className="content-area">
        <TopBar loggedIn={true} user={auth.user} logout={handleLogout} toggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="content-scroll">
          {/* Page Switching */}
          {route === 'dashboard' ? (
            <Dashboard students={students} attendance={attendance} />
          ) : route === 'students' ? (
            <StudentManager
              students={students}
              onAdd={addStudent}
              onEdit={updateStudent}
              onDelete={deleteStudent}
            />
          ) : route === 'mark' ? (
            <AttendanceMarker students={students} attendance={attendance} onMark={markAttendance} />
          ) : route === 'stats' ? (
            <AttendanceStats students={students} attendance={attendance} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// COMPONENTS

// Sidebar navigation
function Sidebar({ route, setRoute, sidebarOpen, setSidebarOpen, user }) {
  return (
    <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
      <div className="sidebar-title">📝 Tracker</div>
      <div className="sidebar-user">
        <div className="avatar" aria-label="user">{user?.name?.[0] || "U"}</div>
        <span>{user?.name || "No Name"}</span>
      </div>
      <ul className="sidebar-nav">
        <li className={route === 'dashboard' ? "active" : ""} onClick={() => setRoute('dashboard')}>Dashboard</li>
        <li className={route === 'students' ? "active" : ""} onClick={() => setRoute('students')}>Students</li>
        <li className={route === 'mark' ? "active" : ""} onClick={() => setRoute('mark')}>Mark Attendance</li>
        <li className={route === 'stats' ? "active" : ""} onClick={() => setRoute('stats')}>History & Stats</li>
      </ul>
      <div className="sidebar-credits">
        <span>Attendance Tracker</span>
        <span style={{ fontSize: "0.75em", color: "#ba1b1b" }}>Red & White Theme</span>
      </div>
    </nav>
  );
}

// Top navigation bar
function TopBar({ loggedIn, user, logout, toggleSidebar }) {
  return (
    <header className="topbar">
      <button className="sidebar-toggle-btn" aria-label="Menu" onClick={toggleSidebar}>☰</button>
      <span className="topbar-title">Student Attendance Tracker</span>
      <div className="topbar-actions">
        {loggedIn ? (
          <>
            <span className="topbar-user">{user?.name}</span>
            <button className="logout-btn" onClick={logout} aria-label="Sign out">Sign out</button>
          </>
        ) : null}
      </div>
    </header>
  );
}

// DashBoard overview
function Dashboard({ students, attendance }) {
  // Compute attendance rate
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = students.length ? students.map(s => {
    const r = attendance.find(a => a.studentId === s.id && a.date === today);
    return r ? (r.status === 'present' ? 1 : 0) : 0;
  }).reduce((a, b) => a + b, 0) : 0;
  return (
    <div className="dashboard">
      <h1>Welcome</h1>
      <div className="dashboard-summary">
        <div className="dash-card">
          <span className="dash-num" style={{ color: "#ba1b1b" }}>{students.length}</span>
          <span className="dash-label">Students</span>
        </div>
        <div className="dash-card">
          <span className="dash-num" style={{ color:"#ba1b1b" }}>{todayCount}/{students.length}</span>
          <span className="dash-label">Present Today</span>
        </div>
        <div className="dash-card">
          <span className="dash-num" style={{ color: "#ba1b1b" }}>{attendance.length}</span>
          <span className="dash-label">Total Marked</span>
        </div>
      </div>
      <div className="dashboard-note">
        <p>Use the sidebar to manage students or record attendance. Red and white modern layout with full local storage. All data is saved on your browser.</p>
      </div>
    </div>
  );
}

// Student Management (add/edit/delete)
function StudentManager({ students, onAdd, onEdit, onDelete }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", roll: "" });
  useEffect(() => {
    if (editId) {
      const s = students.find(s => s.id === editId);
      setForm({ name: s.name, roll: s.roll });
    } else {
      setForm({ name: "", roll: "" });
    }
  }, [editId, students]);
  return (
    <div className="student-mgr">
      <h2>Student List</h2>
      <div className="student-form">
        <label>{editId ? "Edit Student" : "Add Student"}</label>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={32}
        />
        <input
          type="text"
          placeholder="Roll Number"
          value={form.roll}
          onChange={e => setForm(f => ({ ...f, roll: e.target.value }))}
          maxLength={12}
        />
        <div>
          <button
            className="primary-btn"
            onClick={() => {
              if (!form.name || !form.roll)
                return;
              if (editId) {
                onEdit(editId, form);
                setEditId(null);
              } else {
                onAdd(form);
              }
              setForm({ name: "", roll: "" });
            }}
          >
            {editId ? "Save" : "Add"}
          </button>
          {editId && (
            <button className="ghost-btn" onClick={() => setEditId(null)}>
              Cancel
            </button>
          )}
        </div>
      </div>
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#b1b1b1' }}>No students added.</td>
            </tr>
          )}
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.roll}</td>
              <td>
                <button className="ghost-btn small" onClick={() => setEditId(s.id)}>Edit</button>
              </td>
              <td>
                <button
                  className="danger-btn small"
                  onClick={() => window.confirm('Remove this student?') && onDelete(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Attendance Marker UI
function AttendanceMarker({ students, attendance, onMark }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="attendance-marker">
      <h2>Mark Attendance ({today})</h2>
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan={3}>No students to mark.</td>
            </tr>
          )}
          {students.map(s => {
            const statusRec = attendance.find(a => a.studentId === s.id && a.date === today);
            return (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.roll}</td>
                <td>
                  <button
                    disabled={statusRec?.status === 'present'}
                    className={"primary-btn tiny" + (statusRec?.status === 'present' ? " selected" : "")}
                    onClick={() => onMark(s.id, 'present')}
                  >
                    Present
                  </button>{" "}
                  <button
                    disabled={statusRec?.status === 'absent'}
                    className={"danger-btn tiny" + (statusRec?.status === 'absent' ? " selected" : "")}
                    onClick={() => onMark(s.id, 'absent')}
                  >
                    Absent
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Attendance stats and history
function AttendanceStats({ students, attendance }) {
  // Reduce attendance records to summary per student
  const stats = students.map(s => {
    const sRecs = attendance.filter(a => a.studentId === s.id);
    const present = sRecs.filter(a => a.status === "present").length;
    const absent = sRecs.filter(a => a.status === "absent").length;
    return {
      ...s,
      present,
      absent,
      total: sRecs.length,
    };
  });
  // List visible dates
  const allDates = Array.from(new Set(attendance.map(a => a.date))).sort();

  return (
    <div className="attendance-stats">
      <h2>Attendance History & Stats</h2>
      <h3>Per Student Summary</h3>
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Total</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {stats.length === 0 && (
            <tr>
              <td colSpan={5}>No students.</td>
            </tr>
          )}
          {stats.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.present}</td>
              <td>{s.absent}</td>
              <td>{s.total}</td>
              <td>
                {s.total === 0 ? "-" : ((s.present / s.total) * 100).toFixed(0) + "%"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Attendance Records</h3>
      <table className="student-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 && (
            <tr>
              <td colSpan={3}>No records yet.</td>
            </tr>
          )}
          {attendance
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((a, idx) => {
              const student = students.find(s => s.id === a.studentId);
              return (
                <tr key={idx}>
                  <td>{a.date}</td>
                  <td>{student?.name || "?"}</td>
                  <td style={{ color: a.status === "present" ? "#ba1b1b" : "#b1b1b1" }}>
                    {a.status[0].toUpperCase() + a.status.slice(1)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

// Login form (mocked authentication)
function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ name: "", password: "" });
  return (
    <form
      className="login-form"
      tabIndex={-1}
      autoComplete="off"
      onSubmit={e => {
        e.preventDefault();
        if (!form.name || !form.password) return;
        onLogin({ name: form.name });
      }}
    >
      <h1>Sign In</h1>
      <input
        className="login-input"
        type="text"
        placeholder="Username"
        autoFocus
        maxLength={64}
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
      />
      <input
        className="login-input"
        type="password"
        placeholder="Password"
        maxLength={64}
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
      />
      <button className="primary-btn" type="submit">Sign In</button>
      <p className="login-note">No signup required. This is a mock login for demo purposes.</p>
    </form>
  );
}

export default App;
