import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageQuiz from './pages/ManageQuiz';
import CreateQuiz from './pages/CreateQuiz';
import AttemptQuiz from './pages/AttemptQuiz';
import Results from './pages/Results';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quiz/create"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quiz/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/attempt/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AttemptQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Unified Results View (accessible by both authenticated students and admins) */}
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
