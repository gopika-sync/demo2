import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: '1',
    phone: '',
    password: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!user || user.role !== 'student') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch student specifics by student_id
        const res = await api.get(`/students?id=${user.student_id}`);
        if (res.data.success) {
          const student = res.data.data;
          setFormData({
            name: student.name,
            email: student.email,
            department: student.department,
            year: String(student.year),
            phone: student.phone,
            password: '' // Keep password empty
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setUpdating(true);

    try {
      const res = await api.put(`/students?id=${user.student_id}`, formData);
      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        
        // Update global user context state
        updateProfile({
          name: formData.name,
          email: formData.email
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (user?.role !== 'student') {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-container">
          <Sidebar />
          <main className="dashboard-main">
            <div className="card text-center" style={{ padding: '3rem' }}>
              <p>Profile management is only available for Student accounts.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">Profile Management</h1>
              <p className="page-subtitle">Inspect or modify your personal department details and phone numbers.</p>
            </div>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="card content-card mt-4" style={{ maxWidth: '700px' }}>
              <h3>My Profile Information</h3>
              <form onSubmit={handleSubmit} className="profile-form mt-4">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Year of Study</label>
                    <select
                      name="year"
                      className="form-control"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="profile-actions mt-4">
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    {updating ? 'Updating profile...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
