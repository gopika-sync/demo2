import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const CreateQuiz = () => {
  const { id } = useParams(); // Holds quiz ID if we are editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('10');
  const [totalMarks, setTotalMarks] = useState('10');
  
  // Questions array
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch quiz details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchQuizDetails = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/quizzes?id=${id}`);
          if (res.data.success) {
            const quiz = res.data.data;
            setTitle(quiz.title);
            setDescription(quiz.description);
            setDuration(String(quiz.duration));
            setTotalMarks(String(quiz.total_marks));
            
            if (quiz.questions && quiz.questions.length > 0) {
              setQuestions(quiz.questions);
            }
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load quiz details.');
        } finally {
          setLoading(false);
        }
      };
      fetchQuizDetails();
    }
  }, [id, isEditMode]);

  // Add a blank question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A'
      }
    ]);
  };

  // Remove a question
  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setError('A quiz must contain at least one question.');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // Handle updates to specific question field
  const handleQuestionFieldChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Client-side validations
    if (!title || !duration || !totalMarks) {
      setError('Please fill in all general quiz parameters.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d) {
        setError(`Please complete all fields for Question #${i + 1}.`);
        return;
      }
    }

    const payload = {
      title,
      description,
      duration: parseInt(duration),
      total_marks: parseInt(totalMarks),
      questions
    };

    try {
      setLoading(true);
      if (isEditMode) {
        const res = await api.put(`/quizzes?id=${id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Quiz and questions updated successfully!');
          setTimeout(() => navigate('/admin/quizzes'), 1500);
        }
      } else {
        const res = await api.post('/quizzes', payload);
        if (res.data.success) {
          setSuccessMsg('Quiz and questions created successfully!');
          setTimeout(() => navigate('/admin/quizzes'), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="page-title">{isEditMode ? 'Edit Quiz' : 'Create Quiz'}</h1>
              <p className="page-subtitle">Configure assessment details and input questions.</p>
            </div>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {loading && !isEditMode ? (
            <div className="flex-center" style={{ height: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="quiz-creation-form">
              {/* Quiz Parameters Panel */}
              <div className="card content-card">
                <h3>General Quiz Information</h3>
                <div className="form-group mt-4">
                  <label>Quiz Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Web Architecture Basics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Explain what the quiz covers..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Questions Setup Panel */}
              <div className="mt-8">
                <div className="flex-between">
                  <h2 className="section-title">Quiz Questions ({questions.length})</h2>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddQuestion}
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="card question-setup-card mt-4">
                    <div className="question-card-header flex-between">
                      <h4>Question #{idx + 1}</h4>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveQuestion(idx)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-group mt-4">
                      <label>Question Prompt</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter question text here..."
                        value={q.question_text}
                        onChange={(e) => handleQuestionFieldChange(idx, 'question_text', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-2">
                      <div className="form-group">
                        <label>Option A</label>
                        <input
                          type="text"
                          className="form-control"
                          value={q.option_a}
                          onChange={(e) => handleQuestionFieldChange(idx, 'option_a', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Option B</label>
                        <input
                          type="text"
                          className="form-control"
                          value={q.option_b}
                          onChange={(e) => handleQuestionFieldChange(idx, 'option_b', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Option C</label>
                        <input
                          type="text"
                          className="form-control"
                          value={q.option_c}
                          onChange={(e) => handleQuestionFieldChange(idx, 'option_c', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Option D</label>
                        <input
                          type="text"
                          className="form-control"
                          value={q.option_d}
                          onChange={(e) => handleQuestionFieldChange(idx, 'option_d', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mt-2">
                      <label>Correct Answer Key</label>
                      <select
                        className="form-control"
                        value={q.correct_answer}
                        onChange={(e) => handleQuestionFieldChange(idx, 'correct_answer', e.target.value)}
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions mt-8">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/quizzes')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving quiz...' : isEditMode ? 'Save Quiz Changes' : 'Create & Publish Quiz'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreateQuiz;
