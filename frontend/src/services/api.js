import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: clear token if needed
      // Do not auto-redirect if checking public routes
    }
    let message = error.response?.data?.message;
    if (!message && error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      message = error.response.data.errors.map(e => e.defaultMessage || e).join('; ');
    }
    if (!message && error.response?.data?.error) {
      message = error.response.data.error;
    }
    if (!message) {
      message = error.message || 'An error occurred';
    }
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credential, password) => api.post('/auth/login', { credential, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const coursesApi = {
  getPublic: (params) => api.get('/courses/public', { params }),
  getAll: () => api.get('/courses'),
  getInstructorCourses: () => api.get('/courses/instructor'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const contentApi = {
  getCourseContents: (courseId) => api.get(`/courses/${courseId}/content`),
  addContent: (courseId, data) => api.post(`/courses/${courseId}/content`, data),
  updateContent: (contentId, data) => api.put(`/courses/content/${contentId}`, data),
  deleteContent: (contentId) => api.delete(`/courses/content/${contentId}`),
  toggleCompletion: (contentId) => api.post(`/courses/content/${contentId}/toggle-completion`),
};

export const enrollmentApi = {
  enroll: (courseId) => api.post(`/enrollments/course/${courseId}`),
  drop: (courseId) => api.post(`/enrollments/course/${courseId}/drop`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  getCourseStudents: (courseId) => api.get(`/enrollments/course/${courseId}/students`),
};

export const assessmentApi = {
  getCourseAssessments: (courseId) => api.get(`/assessments/course/${courseId}`),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getSubmissions: (id) => api.get(`/assessments/${id}/submissions`),
  getCourseSubmissions: (courseId) => api.get(`/assessments/course/${courseId}/submissions`),
};

export const gradesApi = {
  getMyGrades: () => api.get('/grades/my'),
  getCourseGrades: (courseId) => api.get(`/grades/course/${courseId}`),
  gradeSubmission: (submissionId, score, feedback) => api.post(`/grades/grade-submission/${submissionId}`, { score, feedback }),
};

export const discussionApi = {
  getCourseDiscussions: (courseId) => api.get(`/discussions/course/${courseId}`),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  getPosts: (discussionId) => api.get(`/discussions/${discussionId}/posts`),
  addPost: (discussionId, data) => api.post(`/discussions/${discussionId}/posts`, data),
  toggleLock: (id) => api.post(`/discussions/${id}/lock`),
  togglePin: (id) => api.post(`/discussions/${id}/pin`),
  upvotePost: (postId) => api.post(`/discussions/posts/${postId}/upvote`),
};

export const analyticsApi = {
  getStudentAnalytics: () => api.get('/analytics/student'),
  getInstructorAnalytics: () => api.get('/analytics/instructor'),
  getInstitutionalAnalytics: () => api.get('/analytics/institutional'),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  toggleStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getSystemConfig: () => api.get('/admin/system-config'),
  saveSystemConfig: (data) => api.post('/admin/system-config', data),
};

export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
