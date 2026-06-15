import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Results = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If redirected from a successful quiz submission, the location state contains results
  const resultSummary = location.state?.resultSummary;
  const quizTitle = location.state?.quizTitle;

  // General state for direct navigation mode
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If not in instant score report mode, load historical records
    if (!resultSummary) {
      if (user?.role === 'admin') {
        fetchQuizzes();
      } else if (user?.role === 'student') {
        fetchStudentHistory();
      }
    }
  }, [resultSummary, user]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedQuizId(res.data.data[0].quiz_id);
          fetchQuizAttempts(res.data.data[0].quiz_id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async (quizId) => {
    try {
      setLoading(true);
      const res = await api.get(`/results/quiz?quiz_id=${quizId}`);
      if (res.data.success) {
        setQuizAttempts(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quiz attempt records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results/student');
      if (res.data.success) {
        setStudentHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load your quiz attempt history.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    setSelectedQuizId(quizId);
    fetchQuizAttempts(quizId);
  };

  // --- Rendering Functions ---

  // 1. Render instant score review after submitting a quiz
  const renderInstantScoreCard = () => {
    const { score, total_marks, correct_count, total_questions, detailed_results } = resultSummary;
    const percentage = Math.round((score / total_marks) * 100);
    
    return (
      <div className="container mt-8" style={{ maxWidth: '800px' }}>
        <div className="card result-scorecard text-center border-left-teal">
          <div className="scorecard-badge">📊 Quiz Results</div>
          <h2>{quizTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Assessment Completed Successfully</p>

          <div className="score-circle-container mt-6">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-divider">/</span>
              <span className="score-total">{total_marks}</span>
            </div>
            <div className="score-percentage">{percentage}% Score</div>
          </div>

          <div className="grid grid-3 scorecard-metrics mt-6">
            <div className="metric">
              <span className="metric-label">Total Questions</span>
              <span className="metric-value">{total_questions}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Correct Answers</span>
              <span className="metric-value text-teal">{correct_count}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Wrong Answers</span>
              <span className="metric-value text-danger">{total_questions - correct_count}</span>
            </div>
          </div>

          <div className="scorecard-actions mt-6">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="mt-8">
          <h2 className="section-title">Review Answers</h2>
          {detailed_results.map((item, idx) => {
            const isCorrect = item.is_correct;
            
            return (
              <div key={idx} className={`card review-question-card mt-4 ${isCorrect ? 'review-correct' : 'review-incorrect'}`}>
                <div className="flex-between">
                  <h4>Question #{idx + 1}</h4>
                  <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="review-question-text mt-2">{item.question_text}</p>
                
                <div className="review-options mt-4">
                  <div className={`review-option-pill ${item.submitted_answer === 'A' ? (isCorrect ? 'correct' : 'incorrect') : (item.correct_answer === 'A' ? 'correct' : '')}`}>
                    <strong>A:</strong> {item.option_a}
                  </div>
                  <div className={`review-option-pill ${item.submitted_answer === 'B' ? (isCorrect ? 'correct' : 'incorrect') : (item.correct_answer === 'B' ? 'correct' : '')}`}>
                    <strong>B:</strong> {item.option_b}
                  </div>
                  <div className={`review-option-pill ${item.submitted_answer === 'C' ? (isCorrect ? 'correct' : 'incorrect') : (item.correct_answer === 'C' ? 'correct' : '')}`}>
                    <strong>C:</strong> {item.option_c}
                  </div>
                  <div className={`review-option-pill ${item.submitted_answer === 'D' ? (isCorrect ? 'correct' : 'incorrect') : (item.correct_answer === 'D' ? 'correct' : '')}`}>
                    <strong>D:</strong> {item.option_d}
                  </div>
                </div>

                <div className="review-summary-footer mt-4">
                  <span>Your Answer: <strong className={isCorrect ? 'text-teal' : 'text-danger'}>{item.submitted_answer || 'Skipped'}</strong></span>
                  {!isCorrect && <span>Correct Answer: <strong className="text-teal">{item.correct_answer}</strong></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Render student historical score list
  const renderStudentHistory = () => {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <Sidebar />
          <main className="dashboard-main">
            <header className="dashboard-header">
              <div>
                <h1 className="page-title">My Assessment History</h1>
                <p className="page-subtitle">Inspect your completed exams, scores, and dates.</p>
              </div>
            </header>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="flex-center" style={{ height: '200px' }}>
                <div className="spinner"></div>
              </div>
            ) : studentHistory.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You haven't attempted any quizzes yet.</p>
                <Link to="/dashboard" className="btn btn-primary mt-4">Take a Quiz</Link>
              </div>
            ) : (
              <div className="card table-card mt-4">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quiz Name</th>
                      <th>Marks Scored</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                      <th>Completion Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentHistory.map((attempt) => {
                      const percentage = Math.round((attempt.score / attempt.quiz_total_marks) * 100);
                      
                      return (
                        <tr key={attempt.attempt_id}>
                          <td><strong>{attempt.quiz_title}</strong></td>
                          <td>{attempt.score}</td>
                          <td>{attempt.quiz_total_marks}</td>
                          <td>
                            <span className={`badge ${percentage >= 75 ? 'badge-success' : percentage >= 40 ? 'badge-info' : 'badge-danger'}`}>
                              {percentage}%
                            </span>
                          </td>
                          <td>{new Date(attempt.completed_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  // 3. Render Admin overall grades lookup
  const renderAdminResults = () => {
    const selectedQuiz = quizzes.find(q => q.quiz_id === parseInt(selectedQuizId));
    
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <Sidebar />
          <main className="dashboard-main">
            <header className="dashboard-header flex-between">
              <div>
                <h1 className="page-title">Quiz Results</h1>
                <p className="page-subtitle">Track individual student submissions and score distributions.</p>
              </div>
              
              {quizzes.length > 0 && (
                <div className="form-group select-quiz-control">
                  <label htmlFor="quizSelect">Choose Quiz:</label>
                  <select
                    id="quizSelect"
                    className="form-control"
                    value={selectedQuizId}
                    onChange={handleQuizChange}
                    style={{ minWidth: '220px' }}
                  >
                    {quizzes.map(q => (
                      <option key={q.quiz_id} value={q.quiz_id}>{q.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </header>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="flex-center" style={{ height: '200px' }}>
                <div className="spinner"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No quizzes created yet. Create a quiz to review metrics.</p>
              </div>
            ) : quizAttempts.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No student attempts recorded for this quiz yet.</p>
              </div>
            ) : (
              <>
                <div className="quiz-summary-row card mt-4 border-left-indigo">
                  <h4>Selected Quiz details: {selectedQuiz?.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Total Marks: {selectedQuiz?.total_marks} | Duration: {selectedQuiz?.duration} mins
                  </p>
                </div>

                <div className="card table-card mt-6">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAttempts.map((attempt, index) => {
                        const pct = Math.round((attempt.score / attempt.quiz_total_marks) * 100);
                        
                        return (
                          <tr key={attempt.attempt_id}>
                            <td><strong>#{index + 1}</strong></td>
                            <td>{attempt.student_name}</td>
                            <td>{attempt.department}</td>
                            <td>Year {attempt.year}</td>
                            <td>{attempt.score} / {attempt.quiz_total_marks}</td>
                            <td>
                              <span className={`badge ${pct >= 75 ? 'badge-success' : pct >= 40 ? 'badge-info' : 'badge-danger'}`}>
                                {pct}%
                              </span>
                            </td>
                            <td>{new Date(attempt.completed_at).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    );
  };

  // Dispatch rendering based on context conditions
  if (resultSummary) {
    return renderInstantScoreCard();
  }

  if (user?.role === 'admin') {
    return renderAdminResults();
  }

  return renderStudentHistory();
};

export default Results;
