import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { coursesApi } from '../services/api';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  Search,
  Clock,
  Laptop
} from 'lucide-react';

export default function Landing() {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicCourses();
  }, []);

  const loadPublicCourses = async () => {
    try {
      const res = await coursesApi.getPublic();
      setCourses(res.data || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleKey) => {
    await switchDemoRole(roleKey);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learning Management System (LMS) Lite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Empowering Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">Higher Education</span> & Seamless Delivery
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive, secure, and intuitive educational platform featuring role-based workflows for Students, Instructors, Teaching Assistants, Content Creators, and Administrators.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/courses"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Explore Course Catalog
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 backdrop-blur-md transition-all"
              >
                Create Student Account
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 1-Click Role Exploration Station (SRS Appendix A) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Instant Role Demo Station</h2>
            <p className="text-xs text-slate-500">Test all 6 roles specified in the SRS with pre-seeded sample data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              role: 'ADMIN',
              name: 'Arthur Pendleton',
              desc: 'Full system governance, user status toggling, course auditing & FERPA logs',
              color: 'border-purple-200 bg-purple-50/50 hover:border-purple-300',
              badge: 'bg-purple-100 text-purple-700',
            },
            {
              role: 'INSTRUCTOR',
              name: 'Dr. Alan Turing',
              desc: 'Course management, assessment creation, student submissions grading & analytics',
              color: 'border-blue-200 bg-blue-50/50 hover:border-blue-300',
              badge: 'bg-blue-100 text-blue-700',
            },
            {
              role: 'TEACHING_ASSISTANT',
              name: 'Michael Chang',
              desc: 'Assigned grading queue, student rubric feedback & discussion moderation',
              color: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
              badge: 'bg-amber-100 text-amber-700',
            },
            {
              role: 'CONTENT_CREATOR',
              name: 'Sarah Connor',
              desc: 'Multimedia learning content authoring, interactive video modules & curriculum',
              color: 'border-pink-200 bg-pink-50/50 hover:border-pink-300',
              badge: 'bg-pink-100 text-pink-700',
            },
            {
              role: 'STUDENT',
              name: 'Emma Watson',
              desc: 'Interactive lesson viewer, quiz taking with timer, assignment submission & GPA tracking',
              color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300',
              badge: 'bg-emerald-100 text-emerald-700',
            },
            {
              role: 'GUEST',
              name: 'Guest Explorer',
              desc: 'Public catalog auditing, trial modules exploration with zero-friction browsing',
              color: 'border-slate-200 bg-slate-50 hover:border-slate-300',
              badge: 'bg-slate-200 text-slate-700',
            },
          ].map((item) => (
            <div
              key={item.role}
              className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${item.color}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.badge}`}>
                    {item.role.replace('_', ' ')}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{item.desc}</p>
              </div>

              <button
                onClick={() => handleQuickDemoLogin(item.role)}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-semibold shadow-sm transition-all"
              >
                Log In as {item.role.replace('_', ' ')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Public Courses</h2>
            <p className="text-xs text-slate-500">Accredited curriculum ready for immediate student enrollment</p>
          </div>
          <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
            View all courses <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {course.courseCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                    <span>Instructor: <strong className="text-slate-700">{course.instructorName || 'Faculty Staff'}</strong></span>
                    <span className="font-semibold text-indigo-600">{course.enrolledCount} enrolled</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                    {course.difficulty}
                  </span>
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Core Capabilities from SRS 1.2 & 2.2 */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900">Comprehensive Educational Capabilities</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built strictly in accordance with IEEE SRS specifications for secure online learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Secured RBAC & JWT</h4>
            <p className="text-xs text-slate-500">
              Stateless multi-credential authentication (username, email, or Student ID) with token blacklisting.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Multimedia Content</h4>
            <p className="text-xs text-slate-500">
              Integrated video streaming player, PDF lecture notes, downloadable slides, and lesson progress tracking.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Automated & Rubric Grading</h4>
            <p className="text-xs text-slate-500">
              Instant auto-scoring for quizzes alongside instructor/TA subjective rubric evaluation and gradebook records.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Collaborative Forums</h4>
            <p className="text-xs text-slate-500">
              Threaded course discussions, Q&A boards, announcements with banners, and real-time deadline notifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
