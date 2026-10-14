import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  coursesApi,
  contentApi,
  enrollmentApi,
  assessmentApi
} from '../services/api';
import {
  BookOpen,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  Play,
  FileText,
  Plus,
  ArrowLeft,
  Lock,
  Layers,
  HelpCircle,
  Clock,
  Video,
  FileCode,
  X
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user, permissions } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'assessments' | 'students'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add Content Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState({
    moduleName: 'Module 1: Getting Started',
    title: '',
    contentType: 'VIDEO',
    contentUrl: '',
    textContent: '',
    durationMinutes: 20,
    isDownloadable: true,
  });

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const [courseRes, contentRes, assessRes] = await Promise.all([
        coursesApi.getById(id),
        contentApi.getCourseContents(id),
        assessmentApi.getCourseAssessments(id),
      ]);
      setCourse(courseRes.data);
      setContents(contentRes.data || []);
      setAssessments(assessRes.data || []);

      if (['INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN'].includes(user?.role)) {
        const stuRes = await enrollmentApi.getCourseStudents(id);
        setStudents(stuRes.data || []);
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollmentApi.enroll(id);
      setMessage({ type: 'success', text: 'Successfully enrolled!' });
      loadCourseDetails();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleDrop = async () => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    try {
      await enrollmentApi.drop(id);
      setMessage({ type: 'success', text: 'Course dropped.' });
      loadCourseDetails();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await contentApi.addContent(id, newContent);
      setShowAddModal(false);
      setMessage({ type: 'success', text: 'Content added successfully!' });
      loadCourseDetails();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12 text-slate-500">Course not found.</div>;
  }

  // Group contents by moduleName
  const modulesGrouped = contents.reduce((acc, item) => {
    const mod = item.moduleName || 'General Modules';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Catalog
      </Link>

      {/* Course Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                {course.courseCode}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {course.difficulty}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                {course.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 min-w-[200px]">
            {course.isEnrolled ? (
              <div className="space-y-2 w-full">
                <Link
                  to={`/courses/${course.id}/learn`}
                  className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Learning</span>
                </Link>
                <div className="text-center text-[11px] text-emerald-600 font-semibold flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  You are Enrolled ({course.userProgress}% completed)
                </div>
                <button
                  onClick={handleDrop}
                  className="w-full text-center text-[11px] text-rose-500 hover:underline pt-1"
                >
                  Drop this course
                </button>
              </div>
            ) : permissions.canEnrollCourses ? (
              <button
                onClick={handleEnroll}
                disabled={course.enrolledCount >= course.maxEnrollment}
                className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
              >
                {course.enrolledCount >= course.maxEnrollment ? 'Course Full' : 'Enroll in this Course'}
              </button>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Instructor Mode: Full editing rights
              </div>
            )}
          </div>
        </div>

        {/* Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Instructor</span>
            <span className="font-bold text-slate-900">{course.instructorName || 'Faculty Staff'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Credits</span>
            <span className="font-bold text-slate-900">{course.credits} Semester Hours</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Schedule</span>
            <span className="font-bold text-slate-900">{course.startDate} to {course.endDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Enrollment Capacity</span>
            <span className="font-bold text-slate-900">{course.enrolledCount} / {course.maxEnrollment} students</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'modules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Modules ({contents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'assessments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assessments & Quizzes ({assessments.length})</span>
        </button>

        {students.length > 0 && (
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Students ({students.length})</span>
          </button>
        )}
      </div>

      {/* Modules List Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Learning Path & Modules</h2>
            {permissions.canManageContent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Lesson
              </button>
            )}
          </div>

          {Object.keys(modulesGrouped).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No lessons published yet for this course.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(modulesGrouped).map(([moduleName, lessons], mIdx) => (
                <div key={mIdx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>{moduleName}</span>
                    <span className="text-slate-400 font-normal">{lessons.length} lessons</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            {lesson.contentType === 'VIDEO' ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                            <span className="text-[11px] text-slate-500">
                              {lesson.contentType} • {lesson.durationMinutes} mins
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {lesson.isCompleted && (
                            <span className="text-emerald-600 text-[11px] font-bold flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                            </span>
                          )}
                          <Link
                            to={`/courses/${course.id}/learn`}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Course Assessments</h2>
            <Link
              to="/assessments"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Go to Assessments Center &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a) => (
              <div key={a.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {a.type}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{a.totalPoints} Points</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>
                <div className="pt-2 text-xs flex items-center justify-between border-t border-slate-100">
                  <span className="text-slate-500">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  <Link
                    to="/assessments"
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                  >
                    View in Assessment Center
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            Enrolled Students Roster
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{enr.student?.fullName}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{enr.student?.studentId || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {enr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">{enr.progressPercent}%</td>
                    <td className="px-4 py-3 font-mono">{enr.grade != null ? `${enr.grade}% (${enr.letterGrade})` : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Add Learning Module Lesson</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Module Name</label>
                <input
                  type="text"
                  required
                  value={newContent.moduleName}
                  onChange={(e) => setNewContent({ ...newContent, moduleName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Messaging with WebSockets"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Content Type</label>
                  <select
                    value={newContent.contentType}
                    onChange={(e) => setNewContent({ ...newContent, contentType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="VIDEO">Video Stream</option>
                    <option value="DOCUMENT">Document / PDF</option>
                    <option value="TEXT">Interactive Lecture Text</option>
                    <option value="PRESENTATION">Presentation Slides</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Mins</label>
                  <input
                    type="number"
                    value={newContent.durationMinutes}
                    onChange={(e) => setNewContent({ ...newContent, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Media URL (Video / Document Link)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/... or https://..."
                  value={newContent.contentUrl}
                  onChange={(e) => setNewContent({ ...newContent, contentUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Text Content (Markdown supported)</label>
                <textarea
                  rows="3"
                  placeholder="Enter detailed educational lecture notes..."
                  value={newContent.textContent}
                  onChange={(e) => setNewContent({ ...newContent, textContent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
