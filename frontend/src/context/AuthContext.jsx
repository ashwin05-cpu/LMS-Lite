import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  ADMIN: { username: 'admin', password: 'Admin@123', label: 'Arthur Pendleton (Admin)' },
  INSTRUCTOR: { username: 'instructor_alan', password: 'Instructor@123', label: 'Dr. Alan Turing (Instructor)' },
  CONTENT_CREATOR: { username: 'creator_sarah', password: 'Creator@123', label: 'Sarah Connor (Content Creator)' },
  TEACHING_ASSISTANT: { username: 'ta_michael', password: 'Teaching@123', label: 'Michael Chang (Teaching Assistant)' },
  STUDENT: { username: 'student_emma', password: 'Student@123', label: 'Emma Watson (Student)' },
  GUEST: { username: 'guest_user', password: 'Guest@123', label: 'Guest Explorer (Guest)' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (credential, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(credential, password);
      const data = res.data;
      localStorage.setItem('lms_token', data.accessToken);
      localStorage.setItem('lms_user', JSON.stringify(data));
      setToken(data.accessToken);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch (e) {
      // Ignore logout api failure and proceed with local clear
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      setToken(null);
      setUser(null);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      return await authApi.register(userData);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) return;
    return await login(creds.username, creds.password);
  };

  // Permission Matrix helpers based on Appendix A
  const permissions = {
    canViewPublicCourses: true, // all roles
    canCreateAccount: !user || user.role === 'ADMIN' || user.role === 'STUDENT' || user.role === 'GUEST',
    canEnrollCourses: user?.role === 'STUDENT' || user?.role === 'ADMIN',
    canAccessCourseContent: ['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN'].includes(user?.role),
    canSubmitAssignments: user?.role === 'STUDENT',
    canViewGrades: ['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'ADMIN'].includes(user?.role),
    canCreateCourses: ['INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN'].includes(user?.role),
    canGradeAssignments: ['TEACHING_ASSISTANT', 'INSTRUCTOR', 'ADMIN'].includes(user?.role),
    canManageContent: ['TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN'].includes(user?.role),
    canCreateAssessments: ['INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN'].includes(user?.role),
    canViewAnalytics: ['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN'].includes(user?.role),
    canManageUsers: user?.role === 'ADMIN',
    canConfigureSystem: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        switchDemoRole,
        permissions,
        isAuthenticated: !!token && !!user,
        role: user?.role || 'GUEST',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
