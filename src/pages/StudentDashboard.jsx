import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QuizCard from '../components/QuizCard';
import api from '../services/api';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [progress, setProgress] = useState({
    total_quizzes: 0,
    attempted_quizzes: 0,
    pending_quizzes: 0,
    average_score: 0,
    completion_percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // Fetch all quizzes
        const quizRes = await api.get('/quizzes');
        // Fetch student's attempt records
        const attemptRes = await api.get('/results/student');
        // Fetch student's progress KPIs
        const progressRes = await api.get('/results/progress');

        if (quizRes.data.success) setQuizzes(quizRes.data.data);
        if (attemptRes.data.success) setAttempts(attemptRes.data.data);
        if (progressRes.data.success) setProgress(progressRes.data.data);
      } catch (err) {
        console.error("Error fetching student dashboard details:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/attempt/${quizId}`);
  };

  // Maps attempt records by quiz_id for quick lookups
  const attemptMap = attempts.reduce((acc, attempt) => {
    acc[attempt.quiz_id] = attempt;
    return acc;
  }, {});

  const completedQuizzes = quizzes.filter(q => attemptMap[q.quiz_id]);
  const pendingQuizzes = quizzes.filter(q => !attemptMap[q.quiz_id]);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">Student Dashboard</h1>
              <p className="page-subtitle">Welcome back! Keep learning and tracking your assessment records.</p>
            </div>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* Progress Summary Card with Progress Bar */}
              <div className="card progress-tracker-card border-left-indigo">
                <div className="progress-card-info-row">
                  <div>
                    <h3>Your Learning Progress</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Percentage of quizzes completed successfully</p>
                  </div>
                  <div className="progress-percentage-label">
                    {progress.completion_percentage}%
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill animate-progress"
                    style={{ width: `${progress.completion_percentage}%` }}
                  ></div>
                </div>

                <div className="grid grid-4 progress-substats">
                  <div className="substat">
                    <span className="substat-label">Total Quizzes</span>
                    <span className="substat-value">{progress.total_quizzes}</span>
                  </div>
                  <div className="substat">
                    <span className="substat-label">Completed</span>
                    <span className="substat-value text-teal">{progress.attempted_quizzes}</span>
                  </div>
                  <div className="substat">
                    <span className="substat-label">Pending</span>
                    <span className="substat-value text-indigo">{progress.pending_quizzes}</span>
                  </div>
                  <div className="substat">
                    <span className="substat-label">Avg. Score</span>
                    <span className="substat-value text-warning">{Math.round(progress.average_score)}%</span>
                  </div>
                </div>
              </div>

              {/* Pending Quizzes Grid */}
              <div className="mt-8">
                <h2 className="section-title">Available Quizzes ({pendingQuizzes.length})</h2>
                {pendingQuizzes.length === 0 ? (
                  <div className="card empty-state-card text-center">
                    <p>🎉 Excellent work! You have completed all available quizzes.</p>
                  </div>
                ) : (
                  <div className="grid grid-3">
                    {pendingQuizzes.map(quiz => (
                      <QuizCard 
                        key={quiz.quiz_id} 
                        quiz={quiz} 
                        role="student"
                        onStart={handleStartQuiz}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Quizzes List */}
              <div className="mt-8">
                <h2 className="section-title">Completed Quizzes ({completedQuizzes.length})</h2>
                {completedQuizzes.length === 0 ? (
                  <div className="card empty-state-card text-center">
                    <p>No completed quizzes yet. Complete your first assessment above!</p>
                  </div>
                ) : (
                  <div className="grid grid-3">
                    {completedQuizzes.map(quiz => (
                      <QuizCard 
                        key={quiz.quiz_id} 
                        quiz={quiz} 
                        role="student"
                        completedAttempt={attemptMap[quiz.quiz_id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
