import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
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
  } catch (error) {
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

// Auth endpoints
export async function loginUser(username, password) {

  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  
  const response = await API.post('/users/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export async function registerUser(userData) {
  const response = await API.post('/users/register', userData);
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
  const response = await API.get('/appointments/my');
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

export default API;