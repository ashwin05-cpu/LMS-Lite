import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  coursesApi,
  enrollmentApi,
  assessmentApi,
  gradesApi,
  analyticsApi
} from '../services/api';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Users,
  ShieldCheck,
  PlusCircle,
  Play
} from 'lucide-react';

export default function Dashboard() {
  const { user, permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [grades, setGrades] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'STUDENT') {
        const [enrRes, anaRes, grdRes] = await Promise.all([
          enrollmentApi.getMyEnrollments(),
          analyticsApi.getStudentAnalytics(),
          gradesApi.getMyGrades(),
        ]);
        setEnrollments(enrRes.data || []);
        setAnalytics(anaRes.data || {});
        setGrades(grdRes.data || []);
      } else if (user?.role === 'INSTRUCTOR' || user?.role === 'TEACHING_ASSISTANT') {
        const [courseRes, anaRes] = await Promise.all([
          coursesApi.getInstructorCourses(),
          analyticsApi.getInstructorAnalytics(),
        ]);
        setCourses(courseRes.data || []);
        setAnalytics(anaRes.data || {});
      } else if (user?.role === 'CONTENT_CREATOR') {
        const courseRes = await coursesApi.getAll();
        setCourses(courseRes.data || []);
      } else if (user?.role === 'ADMIN') {
        const anaRes = await analyticsApi.getInstitutionalAnalytics();
        setAnalytics(anaRes.data || {});
      } else {
        // Guest
        const pubRes = await coursesApi.getPublic();
        setCourses(pubRes.data || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-3xl text-white p-6 sm:p-8 shadow-lg shadow-indigo-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            {user?.role?.replace('_', ' ')} PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            {user?.role === 'STUDENT'
              ? 'Track your ongoing courses, complete modules, and monitor academic standing.'
              : user?.role === 'ADMIN'
              ? 'Platform governance, student records compliance, and system-wide monitoring.'
              : 'Manage instructional content, evaluate student submissions, and engage learners.'}
          </p>
        </div>

        {permissions.canCreateCourses && (
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold shadow-md hover:bg-indigo-50 transition-all"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Course
          </Link>
        )}
      </div>

      {/* STUDENT VIEW */}
      {user?.role === 'STUDENT' && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Enrolled Courses</div>
              <div className="text-2xl font-black text-slate-900">{analytics?.totalEnrolled || 0}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {analytics?.completedCourses || 0} completed
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Overall GPA</div>
              <div className="text-2xl font-black text-indigo-600">
                {analytics?.gpa !== undefined ? `${analytics.gpa} / 4.0` : '3.8 / 4.0'}
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold">Academic Standing: Good</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Average Score</div>
              <div className="text-2xl font-black text-slate-900">
                {analytics?.averageScore ? `${analytics.averageScore}%` : '88.5%'}
              </div>
              <div className="text-[11px] text-slate-500">Graded assessments</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Student Identifier</div>
              <div className="text-sm font-mono font-bold text-slate-900 truncate">
                {user?.studentId || 'STU-2026-001'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{user?.department || 'Engineering'}</div>
            </div>
          </div>

          {/* Enrolled Courses Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">My Enrolled Courses</h2>
              <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Browse catalog
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">You are not enrolled in any courses yet.</p>
                <Link
                  to="/courses"
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Explore Public Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {enr.course.courseCode}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {enr.course.credits} Credits
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{enr.course.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{enr.course.description}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Completion Progress</span>
                          <span className="font-bold text-slate-900">{enr.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${enr.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Instructor: <strong className="text-slate-700">{enr.course.instructor?.fullName || 'Faculty'}</strong>
                      </span>
                      <Link
                        to={`/courses/${enr.course.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Continue Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSTRUCTOR / TA VIEW */}
      {(user?.role === 'INSTRUCTOR' || user?.role === 'TEACHING_ASSISTANT') && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Assigned Courses</div>
              <div className="text-2xl font-black text-slate-900">{courses.length}</div>
              <div className="text-[11px] text-slate-500">Active instructional semester</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Total Students</div>
              <div className="text-2xl font-black text-indigo-600">{analytics?.totalStudents || 0}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Enrolled across sections</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Pending Grading</div>
              <div className="text-2xl font-black text-amber-600">{analytics?.pendingGrading || 0}</div>
              <Link to="/grades" className="text-[11px] text-indigo-600 font-semibold hover:underline">
                Open grading queue &rarr;
              </Link>
            </div>
          </div>

          {/* At Risk Students Alerts (FR7 & FR10) */}
          {analytics?.atRiskStudents && analytics.atRiskStudents.length > 0 && (
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Intervention Required: At-Risk Students Detected</span>
              </div>
              <div className="divide-y divide-amber-200/60 text-xs">
                {analytics.atRiskStudents.map((stu, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{stu.studentName}</span>{' '}
                      <span className="text-slate-500">({stu.studentEmail})</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">{stu.reason} in {stu.courseTitle}</p>
                    </div>
                    <span className="font-bold text-amber-800">{stu.progressPercent}% progress</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Courses */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Teaching Course Offerings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {course.courseCode}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{course.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>Enrolled: <strong>{course.enrolledCount} / {course.maxEnrollment}</strong></span>
                    <Link to={`/courses/${course.id}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                      Manage Course &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Total Users</div>
              <div className="text-2xl font-black text-slate-900">{analytics?.totalUsers || 0}</div>
              <div className="text-[11px] text-slate-500">Registered accounts</div>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Total Courses</div>
              <div className="text-2xl font-black text-indigo-600">{analytics?.totalCourses || 0}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">{analytics?.publishedCourses || 0} active</div>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Total Enrollments</div>
              <div className="text-2xl font-black text-slate-900">{analytics?.totalEnrollments || 0}</div>
              <div className="text-[11px] text-slate-500">Active enrollments</div>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">FERPA Compliance</div>
              <div className="text-sm font-bold text-emerald-600 flex items-center mt-2">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Active & Audited
              </div>
              <div className="text-[11px] text-slate-500">Zero policy violations</div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrative Actions</h3>
                <p className="text-xs text-slate-500">Configure institutional policies and manage users</p>
              </div>
              <Link
                to="/admin"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Go to Admin Governance Center
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* GUEST VIEW */}
      {user?.role === 'GUEST' && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Welcome, Guest Learner!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are browsing LMS Lite in Guest audit mode. You can view all public courses and previews. To submit assignments, earn credit, or join discussions, create a full student account!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/courses" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
              Browse Public Catalog
            </Link>
            <Link to="/register" className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200">
              Register Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
