import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QuizCard from '../components/QuizCard';
import api from '../services/api';

const ManageQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load quiz list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuizRedirect = () => {
    navigate('/admin/quiz/create');
  };

  const handleEditQuizRedirect = (quiz) => {
    navigate(`/admin/quiz/edit/${quiz.quiz_id}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All corresponding questions and student attempt score records will be permanently removed.')) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      const res = await api.delete(`/quizzes?id=${quizId}`);
      if (res.data.success) {
        setSuccessMsg('Quiz deleted successfully.');
        fetchQuizzes();
      }
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        
        <main className="dashboard-main">
          <header className="dashboard-header flex-between">
            <div>
              <h1 className="page-title">Manage Quizzes</h1>
              <p className="page-subtitle">Add questions, set assessment limits, and edit current quizzes.</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateQuizRedirect}>
              + Create Quiz
            </button>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No quizzes found. Get started by designing your first quiz!</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {quizzes.map(quiz => (
                <QuizCard 
                  key={quiz.quiz_id} 
                  quiz={quiz} 
                  role="admin"
                  onEdit={handleEditQuizRedirect}
                  onDelete={handleDeleteQuiz}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageQuiz;
