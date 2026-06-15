import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentCard from '../components/StudentCard';
import api from '../services/api';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '1',
    phone: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students list.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      year: '1',
      phone: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '', // Leave empty unless changing
      department: student.department,
      year: String(student.year),
      phone: student.phone
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (editingStudent) {
        // Update Student
        const res = await api.put(`/students?id=${editingStudent.student_id}`, formData);
        if (res.data.success) {
          setSuccessMsg('Student updated successfully!');
          fetchStudents();
          closeModal();
        }
      } else {
        // Add Student (must include password)
        if (!formData.password) {
          setError('Password is required for new accounts.');
          return;
        }
        const res = await api.post('/students', formData);
        if (res.data.success) {
          setSuccessMsg('Student added successfully!');
          fetchStudents();
          closeModal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Check details and try again.');
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student account? All their quiz attempt records will be deleted as well.')) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      const res = await api.delete(`/students?id=${studentId}`);
      if (res.data.success) {
        setSuccessMsg('Student account deleted successfully.');
        fetchStudents();
      }
    } catch (err) {
      setError('Failed to delete student account.');
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
              <h1 className="page-title">Manage Students</h1>
              <p className="page-subtitle">Track and configure student profiles and credentials.</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add Student
            </button>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No student records found. Add your first student above!</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {students.map(student => (
                <StudentCard 
                  key={student.student_id} 
                  student={student} 
                  onEdit={openEditModal} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Slide-in / Pop-up Overlay Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card modal-content animate-fade-in">
            <div className="modal-header">
              <h2>{editingStudent ? 'Edit Student Details' : 'Add New Student'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
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

              <div className="form-group">
                <label>{editingStudent ? 'Password (Leave empty to keep current)' : 'Password'}</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingStudent}
                  placeholder={editingStudent ? '••••••••' : 'Enter account password'}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-2">
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
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
