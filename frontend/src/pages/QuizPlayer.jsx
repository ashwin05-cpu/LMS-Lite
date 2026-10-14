import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  Award
} from 'lucide-react';

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.getById(id);
      const data = res.data;
      setAssessment(data);
      if (data.questionsJson) {
        try {
          const parsed = JSON.parse(data.questionsJson);
          setQuestions(parsed);
        } catch (e) {
          setQuestions([]);
        }
      }
      setTimeLeft((data.timeLimit || 30) * 60);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmitQuiz = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const payload = {
        answersJson: JSON.stringify(answers),
        submissionText: `Completed in ${(assessment.timeLimit * 60 - timeLeft) / 60} mins`,
      };
      const res = await assessmentApi.submit(id, payload);
      setResult(res.data);
    } catch (e) {
      alert('Submission error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
            {assessment?.type} ASSESSMENT
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">{assessment?.title}</h1>
          <p className="text-xs text-slate-500">
            Total Points: {assessment?.totalPoints} • Passing Score: {assessment?.passingScore}%
          </p>
        </div>

        {/* Countdown Timer */}
        {!result && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-mono font-bold">{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Result Display Banner if finished */}
      {result ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-lg animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
          <p className="text-xs text-slate-500">
            Your objective answers have been automatically graded by the LMS assessment engine.
          </p>

          <div className="p-6 bg-slate-50 rounded-2xl max-w-sm mx-auto border border-slate-100 space-y-2">
            <div className="text-3xl font-black text-indigo-600">
              {result.score != null ? `${result.score}%` : 'Pending'}
            </div>
            <p className="text-xs text-slate-600">
              {result.score >= (assessment?.passingScore || 60)
                ? 'Passed! Congratulations on meeting the learning competency standard.'
                : 'Did not meet passing score. You may retake if attempts remain.'}
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/grades"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              View in Gradebook
            </Link>
            <Link
              to="/assessments"
              className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              Return to Assessments
            </Link>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          No questions defined for this quiz.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Question Pane (3 cols) */}
          <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-indigo-600">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{currentQ.points || 25} Points</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Answer Options */}
            {currentQ.options ? (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isChecked = answers[currentQ.id] === opt;
                  return (
                    <label
                      key={oIdx}
                      onClick={() => handleSelectAnswer(currentQ.id, opt)}
                      className={`w-full p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQ.id}
                        checked={isChecked}
                        onChange={() => {}}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Answer</label>
                <input
                  type="text"
                  placeholder="Enter short answer..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Assessment
                </button>
              )}
            </div>
          </div>

          {/* Question Grid Map (1 col) */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 space-y-4 shadow-sm">
            <span className="text-xs font-bold text-slate-700 block">Question Navigator</span>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
