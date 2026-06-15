import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AttemptQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores question_id => option ('A', 'B', 'C', 'D')
  
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quizzes?id=${id}`);
        if (res.data.success) {
          const quizData = res.data.data;
          setQuiz(quizData);
          setQuestions(quizData.questions || []);
          setTimeLeft(quizData.duration * 60); // convert minutes to seconds
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz. Please return to dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndQuestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Timer Countdown Logic
  useEffect(() => {
    if (loading || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(); // submit quiz automatically when timer hits zero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, quiz]);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const submitQuizData = async (answersPayload) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const res = await api.post('/results/submit', {
        quiz_id: parseInt(id),
        answers: answersPayload
      });

      if (res.data.success) {
        // Navigate to the results page, passing score metrics in history state
        navigate('/results', { state: { resultSummary: res.data.data, quizTitle: quiz.title } });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while submitting your answers.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Your quiz is being submitted automatically.");
    submitQuizData(answers);
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    let confirmMsg = 'Are you sure you want to submit your quiz?';
    if (unansweredCount > 0) {
      confirmMsg = `You have left ${unansweredCount} question(s) unanswered. Are you sure you want to submit?`;
    }
    
    if (window.confirm(confirmMsg)) {
      submitQuizData(answers);
    }
  };

  // Helper to format remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading quiz environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isQuestionAnswered = answers[currentQuestion?.question_id] !== undefined;

  return (
    <div className="quiz-attempt-layout">
      <Navbar />
      
      <div className="quiz-attempt-bar">
        <div className="container attempt-bar-container">
          <div className="attempt-quiz-info">
            <h2>{quiz.title}</h2>
            <span>Question {currentIdx + 1} of {questions.length}</span>
          </div>

          <div className={`attempt-timer ${timeLeft < 60 ? 'timer-danger animate-pulse' : ''}`}>
            <span className="timer-icon">⏳</span>
            <span className="timer-countdown">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <main className="quiz-attempt-main container">
        {submitting ? (
          <div className="card content-card text-center" style={{ padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <h3 style={{ marginTop: '1.5rem' }}>Calculating score & saving attempt...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Please do not close this window.</p>
          </div>
        ) : (
          <div className="attempt-workspace">
            {/* Main Question Panel */}
            <div className="card question-display-card">
              <div className="question-text-row">
                <span className="question-number-badge">{currentIdx + 1}</span>
                <p className="question-prompt">{currentQuestion.question_text}</p>
              </div>

              <div className="options-list">
                {['a', 'b', 'c', 'd'].map(opt => {
                  const key = `option_${opt}`;
                  const optionValue = opt.toUpperCase();
                  const isSelected = answers[currentQuestion.question_id] === optionValue;
                  
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(currentQuestion.question_id, optionValue)}
                    >
                      <span className="option-letter">{optionValue}</span>
                      <span className="option-content">{currentQuestion[key]}</span>
                    </button>
                  );
                })}
              </div>

              <hr className="divider" />

              <div className="question-card-navigation">
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                >
                  ← Previous
                </button>

                {currentIdx === questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={handleManualSubmit}>
                    Submit Quiz
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={handleNext}>
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* Right Question Grid Sidebar */}
            <div className="card quiz-nav-sidebar">
              <h3>Question Index</h3>
              <div className="question-grid">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.question_id] !== undefined;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                    <button
                      key={q.question_id}
                      className={`grid-num-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="grid-legend mt-4">
                <div className="legend-item"><span className="dot dot-current"></span> Current</div>
                <div className="legend-item"><span className="dot dot-answered"></span> Answered</div>
                <div className="legend-item"><span className="dot dot-unanswered"></span> Unanswered</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttemptQuiz;
