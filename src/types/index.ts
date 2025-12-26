export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price_per_night: number;
  rating: number;
  image: string | null;
  amenities: string[] | null;
  rooms_available: number;
  is_active: boolean;
}

export interface Flight {
  id: number;
  airline: string;
  flight_number: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  seats_available: number;
  class: string;
  image: string | null;
  is_active: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  cuisine_type: string;
  price_range: number;
  rating: number;
  image: string | null;
  opening_time: string;
  closing_time: string;
  capacity: number;
  is_active: boolean;
}

export interface Reservation {
  id: number;
  user_id: number;
  reservable_type: string;
  reservable_id: number;
  check_in: string | null;
  check_out: string | null;
  reservation_date: string | null;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string | null;
  reservable?: Hotel | Flight | Restaurant;
  payment?: Payment;
}

export interface Payment {
  id: number;
  reservation_id: number;
  user_id: number;
  checkout_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
