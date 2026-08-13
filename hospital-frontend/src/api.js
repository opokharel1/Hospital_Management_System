// Writing Helper functions for API calls to the backend FastAPI server

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// JWT utilities
export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  } 
  catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getStoredAuth() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return { token, role };
}

export function setStoredAuth(token, role) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

// Login API call (OAuth2 Form Data format commonly used by FastAPI)
export async function loginUser(credentials) {
  // If your FastAPI endpoint uses OAuth2PasswordRequestForm:
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  const response = await API.post('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // If backend login endpoint accepts regular JSON instead of OAuth2 form data, we can simply do await API.post('/login', credentials) instead
  })
  return response.data
} 

export async function registerUser(userData) {
  const response = await API.post('/users/register', userData);
  return response.data;
}

export async function fetchAllUsers() {
  const response = await API.get('/users/');
  return response.data;
}

// Doctor endpoints
export async function fetchDoctors() {
  const response = await API.get('/doctors');
  return response.data;
}

export async function fetchDoctorAppointments(doctorId) {
  const response = await API.get(`/doctors/${doctorId}/appointments`);
  return response.data;
}

// Appointment endpoints
export async function fetchMyAppointments() {
  const response = await API.get('/appointments/me');
  return response.data;
}

export async function createAppointment(appointmentData) {
  const response = await API.post('/appointments', appointmentData);
  return response.data;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const response = await API.put(`/appointments/${appointmentId}`, { status });
  return response.data;
}


export async function fetchAdminAllAppointments() {
  const response = await API.get('/appointments/');
  return response.data;
}

export async function createDoctorProfile(doctorPayload) {
  const response = await API.post('/doctors/', doctorPayload);
  return response.data;
}

export default API;