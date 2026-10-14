import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesApi, assessmentApi } from '../services/api';
import {
  FileCheck2,
  Clock,
  Award,
  Plus,
  AlertCircle,
  CheckCircle,
  Play,
  Upload,
  Calendar,
  X
} from 'lucide-react';

export default function Assessments() {
  const { user, permissions } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Assignment Submit Modal State
  const [submitModal, setSubmitModal] = useState({ open: false, assessment: null });
  const [submissionData, setSubmissionData] = useState({ fileUrl: '', submissionText: '' });

  // Create Assessment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'QUIZ',
    totalPoints: 100,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    timeLimit: 30,
    attempts: 2,
    passingScore: 60,
    questionsJson: `[
  {
    "id": "q1",
    "type": "MULTIPLE_CHOICE",
    "question": "What is the primary role of Spring Security FilterChain?",
    "options": ["Intercept and secure HTTP requests", "Render React DOM elements", "Manage SQL schema migrations", "Optimize garbage collection"],
    "correctAnswer": "Intercept and secure HTTP requests",
    "points": 50
  },
  {
    "id": "q2",
    "type": "TRUE_FALSE",
    "question": "JWT tokens are stateful and require server database lookup on every call.",
    "options": ["True", "False"],
    "correctAnswer": "False",
    "points": 50
  }
]`,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadAssessments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const res = await coursesApi.getPublic();
      const list = res.data || [];
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async (courseId) => {
    setLoading(true);
    try {
      const res = await assessmentApi.getCourseAssessments(courseId);
      setAssessments(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await assessmentApi.submit(submitModal.assessment.id, submissionData);
      setMessage({ type: 'success', text: 'Assignment submitted successfully for grading!' });
      setSubmitModal({ open: false, assessment: null });
      setSubmissionData({ fileUrl: '', submissionText: '' });
      loadAssessments(selectedCourseId);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      await assessmentApi.create({
        ...newAssessment,
        courseId: parseInt(selectedCourseId),
      });
      setMessage({ type: 'success', text: 'Assessment published successfully!' });
      setShowCreateModal(false);
      loadAssessments(selectedCourseId);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Assessment & Evaluation Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quizzes with automatic grading, assignment submission workflows, and grading rubrics
          </p>
        </div>

        {permissions.canCreateAssessments && (
          <button
            onClick={() => {
              setNewAssessment({ ...newAssessment, courseId: selectedCourseId });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Assessment
          </button>
        )}
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Course Selector Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
          <span>Filter by Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode}: {c.title}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs font-mono text-slate-400">{assessments.length} assessments</span>
      </div>

      {/* Assessment Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No assessments scheduled for this course</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    item.type === 'QUIZ'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {item.totalPoints} Total Points
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                <div className="pt-2 text-xs space-y-1 text-slate-600 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Due Date:</span>
                    <strong className="text-slate-800">{new Date(item.dueDate).toLocaleString()}</strong>
                  </div>
                  {item.timeLimit && (
                    <div className="flex items-center justify-between">
                      <span>Time Limit:</span>
                      <span>{item.timeLimit} minutes</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Attempts Allowed:</span>
                    <span>{item.attempts} attempts (Used: {item.userAttempts || 0})</span>
                  </div>
                </div>

                {item.isSubmitted && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Submitted
                    </span>
                    <span className="font-mono font-bold">
                      {item.userScore != null ? `Score: ${item.userScore} / ${item.totalPoints}` : 'Grading in progress'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {user?.role === 'STUDENT' ? (
                  item.type === 'QUIZ' ? (
                    <Link
                      to={`/assessments/${item.id}/quiz`}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{item.isSubmitted ? 'Retake Quiz' : 'Start Timed Quiz'}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSubmitModal({ open: true, assessment: item })}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{item.isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}</span>
                    </button>
                  )
                ) : (
                  <Link
                    to="/grades"
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold text-center"
                  >
                    View Submissions & Grade
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Submit Modal */}
      {submitModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Submit Assignment</h3>
              <button
                onClick={() => setSubmitModal({ open: false, assessment: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-indigo-700">{submitModal.assessment?.title}</p>

            <form onSubmit={handleAssignmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Repository / Archive Link (GitHub, Cloud URL)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or cloud share link"
                  value={submissionData.fileUrl}
                  onChange={(e) => setSubmissionData({ ...submissionData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Submission Notes / Text Solution
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe your design architecture, deliverables, or paste your solution..."
                  value={submissionData.submissionText}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmitModal({ open: false, assessment: null })}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Create Assessment for Course</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final Examination: Cloud Security"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newAssessment.type}
                    onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="QUIZ">Quiz (Automated)</option>
                    <option value="ASSIGNMENT">Assignment (Rubric)</option>
                    <option value="EXAM">Proctored Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Points</label>
                  <input
                    type="number"
                    value={newAssessment.totalPoints}
                    onChange={(e) => setNewAssessment({ ...newAssessment, totalPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssessment.dueDate}
                    onChange={(e) => setNewAssessment({ ...newAssessment, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Limit (Mins)</label>
                  <input
                    type="number"
                    value={newAssessment.timeLimit}
                    onChange={(e) => setNewAssessment({ ...newAssessment, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions / Description</label>
                <textarea
                  rows="2"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {newAssessment.type === 'QUIZ' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Questions JSON (Auto-grading schema)</label>
                  <textarea
                    rows="5"
                    value={newAssessment.questionsJson}
                    onChange={(e) => setNewAssessment({ ...newAssessment, questionsJson: e.target.value })}
                    className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
