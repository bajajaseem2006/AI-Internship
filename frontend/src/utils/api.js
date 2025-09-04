/**
 * API utility functions for PM Internship Scheme frontend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || 'admin123';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API instance with admin key
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_API_KEY,
  },
});

// API functions
export const apiService = {
  // Health check
  healthCheck: () => api.get('/api/health'),

  // Student operations
  createStudent: (studentData) => api.post('/api/student', studentData),
  getStudentMatches: (studentId, k = 5, strategy = 'boost') => 
    api.get(`/api/match/student/${studentId}?k=${k}&strategy=${strategy}`),
  getAllStudents: () => api.get('/api/students'),

  // Company operations
  createInternship: (internshipData) => api.post('/api/company', internshipData),
  getAllInternships: () => api.get('/api/internships'),

  // Allocation operations
  getInternshipAllocations: (internshipId) => 
    api.get(`/api/allocations/internship/${internshipId}`),
  getAllAllocations: () => api.get('/api/allocations'),

  // Admin operations (protected)
  seedDatabase: (seedConfig = {}) => adminApi.post('/api/seed', seedConfig),
  trainModel: (trainingConfig) => adminApi.post('/api/admin/train', trainingConfig),
  runBatchAllocation: (allocationConfig) => adminApi.post('/api/match/batch', allocationConfig),
  evaluateModel: () => adminApi.post('/api/admin/evaluate'),
  getSystemStats: () => api.get('/api/admin/stats'),
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || 'An error occurred';
    const details = error.response.data?.details || [];
    return { message, details, status: error.response.status };
  } else if (error.request) {
    // Request made but no response
    return { 
      message: 'No response from server. Please check if the backend is running.',
      details: [],
      status: 0
    };
  } else {
    // Something else happened
    return { 
      message: error.message || 'An unexpected error occurred',
      details: [],
      status: -1
    };
  }
};

// Success notification utility
export const showSuccess = (message) => {
  console.log('Success:', message);
  // You can integrate with a toast library here
};

// Error notification utility
export const showError = (error) => {
  console.error('Error:', error);
  // You can integrate with a toast library here
};

export default api;