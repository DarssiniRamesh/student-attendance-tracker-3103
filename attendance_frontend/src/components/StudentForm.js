import React, { useState } from "react";

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

export default StudentForm;
