'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Plane, Clock, Users, ArrowLeft, Calendar, Luggage } from 'lucide-react';
import { format } from 'date-fns';
import { getFlight, createReservation } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Flight } from '@/types';

export default function FlightDetailPage() {
  const t = useTranslations('flights');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    if (params.id) {
      getFlight(Number(params.id))
        .then(setFlight)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setBooking(true);
    try {
      const result = await createReservation({
        type: 'flight',
        item_id: flight!.id,
        guests: passengers,
      });
      window.location.href = result.checkout_url;
    } catch (error) {
      console.error('Booking failed:', error);
      alert(t('bookingFailed'));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('notFound')}</p>
      </div>
    );
  }

  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));
  const totalPrice = flight.price * passengers;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[300px]">
        <Image
          src={flight.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920'}
          alt={flight.airline}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 bg-white p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{flight.airline}</h1>
                  <p className="text-gray-500">{flight.flight_number}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 font-semibold capitalize">
                  {flight.class}
                </span>
              </div>

              {/* Flight Route */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{format(departureTime, 'HH:mm')}</p>
                    <p className="text-lg text-gray-500">{flight.departure_city}</p>
                    <p className="text-sm text-gray-400">{format(departureTime, 'EEE, MMM d, yyyy')}</p>
                  </div>
                  <div className="flex-1 px-8">
                    <div className="flex items-center justify-center">
                      <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                      <div className="bg-blue-600 text-white p-3 rounded-full mx-4">
                        <Plane size={24} />
                      </div>
                      <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                    </div>
                    <div className="flex items-center justify-center text-gray-500 mt-2">
                      <Clock size={16} className="mr-1" />
                      <span>{duration}{t('hourFlight')}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{format(arrivalTime, 'HH:mm')}</p>
                    <p className="text-lg text-gray-500">{flight.arrival_city}</p>
                    <p className="text-sm text-gray-400">{format(arrivalTime, 'EEE, MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                  <Luggage size={20} />
                  <span>{t('baggageIncluded')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                  <Calendar size={20} />
                  <span>{t('flexibleDates')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                  <Users size={20} />
                  <span>{flight.seats_available} {t('seatsLeft')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {flight.price.toLocaleString()} {tCommon('dzdCurrency')}
                </span>
                <span className="text-gray-500"> {t('perPerson')}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Users size={16} className="inline mr-1" />
                    {t('passengers')}
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: Math.min(flight.seats_available, 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n > 1 ? t('passengers') : t('passenger')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>{flight.price.toLocaleString()} {tCommon('dzdCurrency')} x {passengers}</span>
                  <span>{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={booking}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? tCommon('processing') : t('bookFlight')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
