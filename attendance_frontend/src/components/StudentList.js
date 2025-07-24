import React, { useState } from "react";
import StudentForm from "./StudentForm";

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

export default StudentList;
