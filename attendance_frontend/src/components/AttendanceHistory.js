import React from "react";
import StatisticsPanel from "./StatisticsPanel";

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

export default AttendanceHistory;
