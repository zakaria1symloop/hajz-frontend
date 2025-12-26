import axios from 'axios';
import type { Hotel, Flight, Restaurant, Reservation, PaginatedResponse, User } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post<{ user: User; token: string }>('/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, password_confirmation: string) => {
  const response = await api.post<{ user: User; token: string }>('/register', {
    name, email, password, password_confirmation
  });
  return response.data;
};

export const logout = async () => {
  await api.post('/logout');
};

export const getUser = async () => {
  const response = await api.get<User>('/user');
  return response.data;
};

// Hotels
export const getHotels = async (params?: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<Hotel>>('/hotels', { params });
  return response.data;
};

export const getFeaturedHotels = async () => {
  const response = await api.get<Hotel[]>('/hotels/featured');
  return response.data;
};

export const getHotel = async (id: number) => {
  const response = await api.get<Hotel>(`/hotels/${id}`);
  return response.data;
};

export const searchHotels = async (params: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<Hotel>>('/hotels/search', { params });
  return response.data;
};

// Flights
export const getFlights = async (params?: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<Flight>>('/flights', { params });
  return response.data;
};

export const getFeaturedFlights = async () => {
  const response = await api.get<Flight[]>('/flights/featured');
  return response.data;
};

export const getFlight = async (id: number) => {
  const response = await api.get<Flight>(`/flights/${id}`);
  return response.data;
};

export const searchFlights = async (params: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<Flight>>('/flights/search', { params });
  return response.data;
};

// Restaurants
export const getRestaurants = async (params?: Record<string, string>) => {
  const response = await api.get<PaginatedResponse<Restaurant>>('/restaurants', { params });
  return response.data;
};

export const getFeaturedRestaurants = async () => {
  const response = await api.get<Restaurant[]>('/restaurants/featured');
  return response.data;
};

export const getRestaurant = async (id: number) => {
  const response = await api.get<Restaurant>(`/restaurants/${id}`);
  return response.data;
};

export const getCuisineTypes = async () => {
  const response = await api.get<string[]>('/restaurants/cuisine-types');
  return response.data;
};

// Reservations
export const getReservations = async () => {
  const response = await api.get<PaginatedResponse<Reservation>>('/reservations');
  return response.data;
};

export const createReservation = async (data: {
  type: 'hotel' | 'flight' | 'restaurant';
  item_id: number;
  check_in?: string;
  check_out?: string;
  reservation_date?: string;
  guests: number;
  special_requests?: string;
}) => {
  const response = await api.post<{ reservation: Reservation; checkout_url: string }>('/reservations', data);
  return response.data;
};

export const getReservation = async (id: number) => {
  const response = await api.get<Reservation>(`/reservations/${id}`);
  return response.data;
};

export const cancelReservation = async (id: number) => {
  const response = await api.post(`/reservations/${id}/cancel`);
  return response.data;
};

export default api;
