import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Assessments from './pages/Assessments';
import QuizPlayer from './pages/QuizPlayer';
import Gradebook from './pages/Gradebook';
import Discussions from './pages/Discussions';
import DiscussionDetail from './pages/DiscussionDetail';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />

          <div className="flex-1 flex overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/courses" element={<CourseList />} />
                  <Route path="/courses/:id" element={<CourseDetail />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/courses/:id/learn"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN']}>
                        <CoursePlayer />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/assessments"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN']}>
                        <Assessments />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/assessments/:id/quiz"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                        <QuizPlayer />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/grades"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'ADMIN']}>
                        <Gradebook />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/discussions"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN']}>
                        <Discussions />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/discussions/:id"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN']}>
                        <DiscussionDetail />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'TEACHING_ASSISTANT', 'INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN']}>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
