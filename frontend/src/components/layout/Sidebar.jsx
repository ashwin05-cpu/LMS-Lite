import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  MessagesSquare,
  BarChart3,
  ShieldAlert,
  Settings,
  HelpCircle,
  Library
} from 'lucide-react';

export default function Sidebar() {
  const { user, permissions } = useAuth();

  const links = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Course Catalog',
      to: '/courses',
      icon: Library,
      show: true,
    },
    {
      label: 'Assessments & Quizzes',
      to: '/assessments',
      icon: FileCheck2,
      show: permissions.canAccessCourseContent,
    },
    {
      label: user?.role === 'STUDENT' ? 'My Grades & GPA' : 'Gradebook & Grading',
      to: '/grades',
      icon: Award,
      show: permissions.canViewGrades,
    },
    {
      label: 'Discussions & Q&A',
      to: '/discussions',
      icon: MessagesSquare,
      show: permissions.canAccessCourseContent,
    },
    {
      label: 'Analytics & Insights',
      to: '/analytics',
      icon: BarChart3,
      show: permissions.canViewAnalytics,
    },
    {
      label: 'Admin Governance',
      to: '/admin',
      icon: ShieldAlert,
      show: permissions.canManageUsers,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Educational Navigation
          </div>
          <nav className="space-y-1">
            {links.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Institution
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {user.department || 'Academic Division'}
            </p>
            <p className="text-[11px] text-slate-500">
              Campus ID: {user.institutionId || 'INST-001'}
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
              isActive ? 'bg-slate-100 text-indigo-700' : ''
            }`
          }
        >
          <Settings className="w-4 h-4 mr-3 text-slate-400" />
          <span>Account Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
