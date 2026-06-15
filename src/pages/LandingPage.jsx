import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="landing-layout">
      <Navbar />
      
      <header className="hero-section">
        <div className="container hero-container">
          <h1 className="hero-title">
            Unlock Smarter <span className="text-teal animate-gradient">Learning Assessments</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive, secure, and modern quiz management platform built for teachers and students. Track progress, design interactive examinations, and view real-time analytics.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose LearnLike LMS?</h2>
          
          <div className="grid grid-3">
            <div className="card feature-card">
              <div className="feature-icon bg-indigo-soft text-indigo">📝</div>
              <h3>Quiz Management</h3>
              <p>Create and edit multiple-choice exams dynamically. Manage marks, duration, and custom questions through an administrative dashboard.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon bg-teal-soft text-teal">🎓</div>
              <h3>Student Tracking</h3>
              <p>Keep a clear record of enrollment details, departments, classes, and contact numbers. Easily perform CRUD management on students.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon bg-success-soft text-success">📊</div>
              <h3>Performance Analytics</h3>
              <p>Students can review their average score and completion percentage. Admins can view averages, participant lists, and leaderboard sheets.</p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon bg-warning-soft text-warning">🔒</div>
              <h3>Secure Authentication</h3>
              <p>Rest assured with role-based JWT Authentication. Route guards protect pages, and student questions hide correct answers on active exams.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} LearnLike Quiz Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
