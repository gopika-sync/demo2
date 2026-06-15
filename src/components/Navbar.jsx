import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="navbar-logo">
          <span className="logo-icon">🗲</span>
          <span className="logo-text">LearnLike<span className="logo-accent">LMS</span></span>
        </Link>

        {user ? (
          <div className="navbar-menu">
            <div className="user-profile-summary">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className={`user-role-badge badge-${user.role}`}>
                  {user.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>
            
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
