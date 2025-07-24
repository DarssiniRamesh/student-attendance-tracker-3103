import React from "react";

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

export default StatisticsPanel;
