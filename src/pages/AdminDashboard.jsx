import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_quizzes: 0,
    completed_quizzes: 0,
    average_score: 0
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Admin analytics stats
        const statsResponse = await api.get('/results/admin-stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">LearnLike LMS platform overview & analysis</p>
            </div>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* Analytics Cards Grid */}
              <div className="grid grid-4 stats-grid">
                <div className="card stat-card border-left-indigo">
                  <div className="stat-icon text-indigo">🎓</div>
                  <div className="stat-data">
                    <span className="stat-number">{stats.total_students}</span>
                    <span className="stat-label">Total Students</span>
                  </div>
                </div>

                <div className="card stat-card border-left-teal">
                  <div className="stat-icon text-teal">📝</div>
                  <div className="stat-data">
                    <span className="stat-number">{stats.total_quizzes}</span>
                    <span className="stat-label">Total Quizzes</span>
                  </div>
                </div>

                <div className="card stat-card border-left-success">
                  <div className="stat-icon text-success">✓</div>
                  <div className="stat-data">
                    <span className="stat-number">{stats.completed_quizzes}</span>
                    <span className="stat-label">Quizzes Completed</span>
                  </div>
                </div>

                <div className="card stat-card border-left-warning">
                  <div className="stat-icon text-warning">📈</div>
                  <div className="stat-data">
                    <span className="stat-number">{stats.average_score}%</span>
                    <span className="stat-label">Average Score</span>
                  </div>
                </div>
              </div>

              {/* Administrative Overview Info Panel */}
              <div className="card content-card mt-6">
                <h3>System Activities</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Welcome to the control center of LearnLike LMS. Use the sidebar to perform operations:
                </p>
                <ul className="info-bullets" style={{ marginTop: '1rem' }}>
                  <li><strong>Students:</strong> Register new students, update their class department/contact, and delete student credentials.</li>
                  <li><strong>Quizzes:</strong> Build multiple-choice tests, configure timings, configure mark weightages, and delete quizzes.</li>
                  <li><strong>Quiz Results:</strong> Click on "Quiz Results" to inspect details of completed quiz sheets, score distributions, and individual rankings.</li>
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
