import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesApi, enrollmentApi } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

export default function CourseList() {
  const { user, permissions } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    status: 'PUBLISHED',
    maxEnrollment: 30,
    difficulty: 'BEGINNER',
    category: 'Computer Science',
    syllabus: '',
    prerequisites: 'None',
  });

  useEffect(() => {
    loadCourses();
  }, [category, difficulty]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getPublic({
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
      });
      setCourses(res.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses();
  };

  const handleEnroll = async (courseId) => {
    setMessage({ type: '', text: '' });
    try {
      await enrollmentApi.enroll(courseId);
      setMessage({ type: 'success', text: 'Successfully enrolled in course!' });
      loadCourses();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const [modalError, setModalError] = useState('');

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setModalError('');
    setMessage({ type: '', text: '' });
    try {
      await coursesApi.create(newCourse);
      setMessage({ type: 'success', text: 'Course successfully created and published!' });
      setShowCreateModal(false);
      setNewCourse({
        courseCode: '',
        title: '',
        description: '',
        credits: 3,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        status: 'PUBLISHED',
        maxEnrollment: 30,
        difficulty: 'BEGINNER',
        category: 'Computer Science',
        syllabus: '',
        prerequisites: 'None',
      });
      loadCourses();
    } catch (e) {
      setModalError(e.message);
      setMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Academic Course Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse, filter, and enroll in institutional courses
          </p>
        </div>

        {permissions.canCreateCourses && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Course
          </button>
        )}
      </div>

      {/* Status Alerts */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-medium animate-in fade-in ${
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by code, title, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Data Science">Data Science</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {(search || category || difficulty) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); }}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No courses match your search criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {course.courseCode}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {course.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-2 text-xs space-y-1.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Instructor:</span>
                    <strong className="text-slate-800">{course.instructorName || 'Faculty Staff'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Credits & Schedule:</span>
                    <span>{course.credits} Credits ({course.startDate} to {course.endDate})</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Enrollment Capacity:</span>
                    <span className="font-semibold text-slate-900">
                      {course.enrolledCount} / {course.maxEnrollment} enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/courses/${course.id}`}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>

                {permissions.canEnrollCourses ? (
                  course.isEnrolled ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Enrolled ({course.userProgress}%)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={course.enrolledCount >= course.maxEnrollment}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      {course.enrolledCount >= course.maxEnrollment ? 'Course Full' : 'Enroll Now'}
                    </button>
                  )
                ) : user?.role === 'GUEST' ? (
                  <Link
                    to="/register"
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    Register to Enroll
                  </Link>
                ) : (
                  <Link
                    to={`/courses/${course.id}`}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                  >
                    Manage Course
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal (Appendix C Validation Rules) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create New Course Offering</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code * (3-20 chars, e.g. CS-101, CS101)
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[a-zA-Z0-9-_ ]{3,20}$"
                    placeholder="e.g. CS-101 or CS101"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Credits * (1-6)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title * (5-200 chars)
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={200}
                  placeholder="e.g. Scalable Distributed Systems"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Course overview, aims, and expected student learning outcomes..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newCourse.difficulty}
                    onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newCourse.maxEnrollment}
                    onChange={(e) => setNewCourse({ ...newCourse, maxEnrollment: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
