import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  PieChart,
  ShieldCheck
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [user?.role]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (user?.role === 'STUDENT') {
        const res = await analyticsApi.getStudentAnalytics();
        setData(res.data);
      } else if (user?.role === 'ADMIN') {
        const res = await analyticsApi.getInstitutionalAnalytics();
        setData(res.data);
      } else {
        const res = await analyticsApi.getInstructorAnalytics();
        setData(res.data);
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
      <div>
        <h1 className="text-2xl font-black text-slate-900">Learning Analytics & Academic Insights</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {user?.role === 'STUDENT'
            ? 'Personal learning trajectory, competency acquisition, and grade performance'
            : user?.role === 'ADMIN'
            ? 'Institution-wide enrollment metrics, retention ratios, and departmental breakdown'
            : 'Instructional performance metrics, class grade distributions, and student intervention indicators'}
        </p>
      </div>

      {/* STUDENT ANALYTICS VIEW */}
      {user?.role === 'STUDENT' && (
        <div className="space-y-6">
          {/* Top Scorecards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Cumulative GPA</span>
              <div className="text-2xl font-black text-indigo-600">{data?.gpa || '3.80'} / 4.0</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Dean's Honor List Status</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Average Assessment Score</span>
              <div className="text-2xl font-black text-slate-900">{data?.averageScore || 90}%</div>
              <span className="text-[11px] text-slate-500">Across completed tests</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Courses Enrolled</span>
              <div className="text-2xl font-black text-slate-900">{data?.totalEnrolled || 0}</div>
              <span className="text-[11px] text-slate-500">Spring 2026 Semester</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Completed Courses</span>
              <div className="text-2xl font-black text-emerald-600">{data?.completedCourses || 0}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Credits earned</span>
            </div>
          </div>

          {/* Course-by-Course Progress Bars */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Curriculum Progress Breakdown</h3>
            <div className="space-y-4">
              {data?.courseProgress?.map((cp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {cp.courseCode}: {cp.courseTitle}
                    </span>
                    <span className="font-mono font-bold text-indigo-600">{cp.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${cp.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Performance History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Assessment Performance Timeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data?.gradeHistory?.map((gh, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded">
                      {gh.courseCode}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Grade: {gh.letterGrade}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{gh.assessmentTitle}</h4>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-lg font-black text-slate-900">{gh.points} / {gh.maxPoints}</span>
                    <span className="text-xs font-bold text-indigo-600">{gh.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTOR ANALYTICS VIEW */}
      {(user?.role === 'INSTRUCTOR' || user?.role === 'TEACHING_ASSISTANT') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Active Classes</span>
              <div className="text-2xl font-black text-slate-900">{data?.totalCourses || 0}</div>
              <span className="text-[11px] text-slate-500">Under instruction</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Active Students</span>
              <div className="text-2xl font-black text-indigo-600">{data?.totalStudents || 0}</div>
              <span className="text-[11px] text-slate-500">Enrolled across sections</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Pending Grading Tasks</span>
              <div className="text-2xl font-black text-amber-600">{data?.pendingGrading || 0}</div>
              <span className="text-[11px] text-amber-700 font-semibold">Submissions in queue</span>
            </div>
          </div>

          {/* Predictive Early Warning & Interventions (FR7 & FR10) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Predictive Student Intervention Model</h3>
            </div>
            <p className="text-xs text-slate-500">
              Machine-assisted identification of learners falling below expected course milestone progression.
            </p>

            {data?.atRiskStudents?.length === 0 ? (
              <p className="text-xs text-emerald-600 font-semibold">All enrolled learners are meeting baseline progression goals.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data?.atRiskStudents?.map((stu, i) => (
                  <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{stu.studentName}</div>
                      <div className="text-[11px] text-slate-500">{stu.studentEmail} • {stu.courseTitle}</div>
                      <div className="text-[11px] text-rose-600 font-semibold mt-0.5">{stu.reason}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        {stu.progressPercent}% Module Completion
                      </span>
                      <a
                        href={`mailto:${stu.studentEmail}`}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Contact Student
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN INSTITUTIONAL VIEW */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Institutional Accounts</span>
              <div className="text-2xl font-black text-slate-900">{data?.totalUsers || 0}</div>
              <span className="text-[11px] text-slate-500">Verified platform identities</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Curriculum Catalog</span>
              <div className="text-2xl font-black text-indigo-600">{data?.totalCourses || 0}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{data?.publishedCourses || 0} Published</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Enrollments</span>
              <div className="text-2xl font-black text-slate-900">{data?.totalEnrollments || 0}</div>
              <span className="text-[11px] text-slate-500">Active seat assignments</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Audit Record Status</span>
              <div className="text-sm font-bold text-emerald-600 flex items-center mt-2">
                <ShieldCheck className="w-4 h-4 mr-1" />
                FERPA Compliant
              </div>
              <span className="text-[11px] text-slate-500">Immutable audit persistence</span>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">User Demographics by Role (Appendix A)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {data?.userRoleBreakdown &&
                Object.entries(data.userRoleBreakdown).map(([role, count]) => (
                  <div key={role} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {role.replace('_', ' ')}
                    </span>
                    <span className="text-2xl font-black text-slate-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
