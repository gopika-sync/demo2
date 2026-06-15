import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-name">Portal Menu</span>
      </div>

      <nav className="sidebar-nav">
        {user.role === 'admin' ? (
          // Admin Links
          <>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </NavLink>
            <NavLink 
              to="/admin/students" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🎓</span>
              <span className="sidebar-text">Students</span>
            </NavLink>
            <NavLink 
              to="/admin/quizzes" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📝</span>
              <span className="sidebar-text">Quizzes</span>
            </NavLink>
            <NavLink 
              to="/admin/results" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🏆</span>
              <span className="sidebar-text">Quiz Results</span>
            </NavLink>
          </>
        ) : (
          // Student Links
          <>
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🏡</span>
              <span className="sidebar-text">Dashboard</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-text">My Profile</span>
            </NavLink>
          </>
        )}

        <button onClick={handleLogout} className="sidebar-link sidebar-logout-btn">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
