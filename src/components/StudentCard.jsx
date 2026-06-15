import React from 'react';

const StudentCard = ({ student, onEdit, onDelete }) => {
  const { name, email, department, year, phone } = student;

  return (
    <div className="card student-card">
      <div className="student-card-avatar-row">
        <div className="student-card-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="student-card-identity">
          <h3 className="student-card-name">{name}</h3>
          <span className="student-card-email">{email}</span>
        </div>
      </div>
      
      <hr className="divider" />
      
      <div className="student-card-details">
        <div className="detail-row">
          <span className="detail-icon">🏛</span>
          <span className="detail-text"><strong>Dept:</strong> {department}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <span className="detail-text"><strong>Year:</strong> {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon">📞</span>
          <span className="detail-text"><strong>Phone:</strong> {phone}</span>
        </div>
      </div>

      <div className="student-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(student)}>
          Edit Details
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(student.student_id)}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
