import React from 'react';

const QuizCard = ({ quiz, role, onStart, onEdit, onDelete, completedAttempt }) => {
  const { title, description, total_marks, duration } = quiz;

  return (
    <div className="card quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-card-title">{title}</h3>
        <span className="badge badge-info">{duration} Mins</span>
      </div>
      <p className="quiz-card-description">{description || 'No description provided.'}</p>
      
      <div className="quiz-card-meta">
        <div className="meta-item">
          <span className="meta-label">Total Marks:</span>
          <span className="meta-value">{total_marks}</span>
        </div>
        {completedAttempt && (
          <div className="meta-item">
            <span className="meta-label">Your Score:</span>
            <span className="meta-value text-teal">{completedAttempt.score}/{quiz.total_marks}</span>
          </div>
        )}
      </div>

      <div className="quiz-card-actions">
        {role === 'admin' ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(quiz)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(quiz.quiz_id)}>
              Delete
            </button>
          </>
        ) : (
          <>
            {completedAttempt ? (
              <button className="btn btn-success btn-sm w-full" disabled>
                ✓ Completed
              </button>
            ) : (
              <button className="btn btn-primary btn-sm w-full" onClick={() => onStart(quiz.quiz_id)}>
                Start Quiz
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
