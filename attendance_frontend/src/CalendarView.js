import React, { useState } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * CalendarView displays a visual, professional calendar for tracking attendance history
 * for an individual student (present, absent, or unmarked).
 * - student: object { id, name, roll }
 * - attendance: array of { studentId, date, status }
 * - onClose: function to return to previous view
 */
function CalendarView({ student, attendance, onClose }) {
  // Generate calendar grid for the last 30 days
  const NUM_DAYS = 30;
  const today = new Date();
  const dates = [];
  for (let i = NUM_DAYS - 1; i >= 0; --i) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Map attendance records for this student
  const attMap = {};
  attendance.forEach(
    (rec) => {
      if (rec.studentId === student.id) {
        attMap[rec.date] = rec.status;
      }
    }
  );

  // For color legend
  const STATUS = {
    present: {
      label: "Present",
      class: "cal-cell-present",
    },
    absent: {
      label: "Absent",
      class: "cal-cell-absent",
    },
    unmarked: {
      label: "Unmarked",
      class: "cal-cell-unmarked",
    }
  };

  // Display in 5 rows * 7 columns (35 days; last grid may be empty)
  const ROWS = 5, COLS = 7;
  const paddedDates = dates.slice();
  while (paddedDates.length % COLS !== 0) paddedDates.unshift(null);

  // Render
  return (
    <div className="calendar-view">
      <h2>
        Attendance Calendar
        <span style={{ fontWeight: 400, fontSize: "1rem", color: "var(--text-muted)", marginLeft: 8 }}>
          {student.name} <span style={{ fontWeight: 300, fontSize: ".99em" }}>({student.roll})</span>
        </span>
      </h2>
      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-dot cal-cell-present"></span>Present
        <span className="cal-dot cal-cell-absent"></span>Absent
        <span className="cal-dot cal-cell-unmarked"></span>Unmarked
      </div>
      {/* Calendar Grid */}
      <div className="calendar-grid">
        {[...Array(ROWS)].map((_, rIdx) => (
          <div className="calendar-row" key={rIdx}>
            {[...Array(COLS)].map((_, cIdx) => {
              const idx = rIdx * COLS + cIdx;
              const date = paddedDates[idx];
              if (!date) {
                return <div className="calendar-cell cal-empty" key={idx}></div>;
              }
              let st = attMap[date];
              if (st !== "present" && st !== "absent") st = "unmarked";
              const cellClass = STATUS[st].class;
              // Tooltip with date and status
              return (
                <div className={`calendar-cell ${cellClass}`} key={idx} title={`${date}: ${STATUS[st].label}`}>
                  <span className="cal-cell-date">{parseInt(date.slice(-2))}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, textAlign: "center" }}>
        <button className="primary-btn" onClick={onClose} style={{ minWidth: 96 }}>
          Back
        </button>
      </div>
    </div>
  );
}

export default CalendarView;
