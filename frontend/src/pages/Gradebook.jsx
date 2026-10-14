import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  coursesApi,
  gradesApi,
  assessmentApi
} from '../services/api';
import {
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  Edit3,
  X
} from 'lucide-react';

export default function Gradebook() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Grading Modal State
  const [gradingModal, setGradingModal] = useState({ open: false, submission: null });
  const [gradeInput, setGradeInput] = useState({ score: 95, feedback: '' });

  useEffect(() => {
    loadInitialData();
  }, [user?.role]);

  useEffect(() => {
    if (selectedCourseId && user?.role !== 'STUDENT') {
      loadCourseGradesAndSubmissions(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'STUDENT') {
        const res = await gradesApi.getMyGrades();
        setGrades(res.data || []);
      } else {
        const cRes = await coursesApi.getPublic();
        const list = cRes.data || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseGradesAndSubmissions = async (courseId) => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        gradesApi.getCourseGrades(courseId),
        assessmentApi.getCourseSubmissions(courseId),
      ]);
      setGrades(gRes.data || []);
      setSubmissions(sRes.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setGradingModal({ open: true, submission: sub });
    setGradeInput({
      score: sub.score != null ? sub.score : 85,
      feedback: sub.feedback || 'Good effort. Clearly demonstrates understanding of core architecture.',
    });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (gradeInput.score < 0 || gradeInput.score > 100) {
      alert('Score must be between 0-100');
      return;
    }
    try {
      await gradesApi.gradeSubmission(gradingModal.submission.id, gradeInput.score, gradeInput.feedback);
      setMessage({ type: 'success', text: 'Grade and rubric evaluation saved successfully!' });
      setGradingModal({ open: false, submission: null });
      loadCourseGradesAndSubmissions(selectedCourseId);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          {user?.role === 'STUDENT' ? 'My Academic Gradebook & GPA' : 'Instructional Gradebook & Grading Center'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {user?.role === 'STUDENT'
            ? 'Detailed record of your graded assessments, feedback, and academic standing'
            : 'Evaluate student submissions, assign rubric scores (0-100), and publish official grades'}
        </p>
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

      {/* STUDENT VIEW */}
      {user?.role === 'STUDENT' && (
        <div className="space-y-6">
          {loading ? (
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : grades.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No grades posted yet</h3>
              <p className="text-xs text-slate-500">As your instructors grade your submissions, your scores will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Official Transcript Records</span>
                <span className="text-indigo-600 font-mono">{grades.length} Recorded Grades</span>
              </div>

              <div className="divide-y divide-slate-100">
                {grades.map((g) => (
                  <div key={g.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {g.courseTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          g.letterGrade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Grade: {g.letterGrade}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{g.assessmentTitle}</h4>
                      {g.feedback && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                          "{g.feedback}"
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black text-slate-900">
                        {g.points} <span className="text-xs font-normal text-slate-400">/ {g.maxPoints}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Graded {new Date(g.gradedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INSTRUCTOR / TA / ADMIN VIEW */}
      {user?.role !== 'STUDENT' && (
        <div className="space-y-6">
          {/* Course Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
              <span>Select Course:</span>
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
            <span className="text-xs font-mono text-slate-400">
              {submissions.length} Submissions • {grades.length} Recorded Grades
            </span>
          </div>

          {/* Student Submissions Grading Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
            <h2 className="text-base font-bold text-slate-900">Submissions Queue & Rubric Grading</h2>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No student submissions recorded for this course.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Artifact / Text</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{sub.studentCode || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{sub.assessmentTitle}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(sub.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              Link
                            </a>
                          ) : (
                            <span className="text-slate-500 truncate block">{sub.submissionText || 'Completed'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          {sub.score != null ? `${sub.score}/100` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'GRADED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Grade Student Submission</h3>
              <button
                onClick={() => setGradingModal({ open: false, submission: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
              <p>Student: <strong>{gradingModal.submission?.studentName}</strong></p>
              <p>Assessment: <strong>{gradingModal.submission?.assessmentTitle}</strong></p>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rubric Score (0 - 100) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={gradeInput.score}
                  onChange={(e) => setGradeInput({ ...gradeInput, score: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qualitative Feedback & Rubric Notes
                </label>
                <textarea
                  rows="4"
                  value={gradeInput.feedback}
                  onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                  placeholder="Provide constructive feedback on requirements completion, code quality, or recommendations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingModal({ open: false, submission: null })}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
