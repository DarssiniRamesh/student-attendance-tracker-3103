import React from "react";

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

export default MarkAttendance;
