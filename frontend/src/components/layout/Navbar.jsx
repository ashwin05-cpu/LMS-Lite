import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data || []);
      const unread = (res.data || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const handleRoleSwitch = async (roleKey) => {
    await switchDemoRole(roleKey);
    setProfileOpen(false);
    navigate('/dashboard');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'INSTRUCTOR': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CONTENT_CREATOR': return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'TEACHING_ASSISTANT': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Demo Bar for Easy Testing of all 6 Roles */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-slate-300">Quick Demo Role Switcher:</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {Object.keys(DEMO_CREDENTIALS).map((rk) => {
            const active = user?.role === rk;
            return (
              <button
                key={rk}
                onClick={() => handleRoleSwitch(rk)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {rk.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  LMS Lite
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Learning Management System
                </span>
              </div>
            </Link>
          </div>

          {/* Right Navigation & Profile */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Role Pill Badge */}
                <div className={`hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user?.role)}`}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {user?.role?.replace('_', ' ')}
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications right now
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                                !n.isRead ? 'bg-indigo-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-slate-800">{n.type}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {user?.fullName ? user.fullName.charAt(0) : 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-semibold leading-tight text-slate-900">{user?.fullName || user?.username}</div>
                      <div className="text-[11px] text-slate-500">{user?.email}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        {user?.studentId && (
                          <p className="text-[10px] font-mono text-indigo-600 mt-0.5">ID: {user.studentId}</p>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        My Profile & Settings
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); navigate('/login'); }}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
