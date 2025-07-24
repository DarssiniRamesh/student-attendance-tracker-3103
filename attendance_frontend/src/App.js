import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Sidebar,
  AppBar,
  Auth,
  StudentList,
  MarkAttendance,
  AttendanceHistory,
} from "./components";

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
