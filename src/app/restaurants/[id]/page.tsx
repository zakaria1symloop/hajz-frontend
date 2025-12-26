'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MapPin, Star, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { getRestaurant, createReservation } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Restaurant } from '@/types';

export default function RestaurantDetailPage() {
  const t = useTranslations('restaurants');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    if (params.id) {
      getRestaurant(Number(params.id))
        .then(setRestaurant)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!date || !time) {
      alert(t('selectDateTime'));
      return;
    }

    setBooking(true);
    try {
      const reservationDate = `${date}T${time}:00`;
      const result = await createReservation({
        type: 'restaurant',
        item_id: restaurant!.id,
        reservation_date: reservationDate,
        guests,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('notFound')}</p>
      </div>
    );
  }

  const totalPrice = restaurant.price_range * guests;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920'}
          alt={restaurant.name}
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
        <div className="absolute top-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium">
          {restaurant.cuisine_type}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <div className="flex items-center text-gray-500 mt-2">
                    <MapPin size={18} className="mr-1" />
                    <span>{restaurant.address}, {restaurant.city}</span>
                  </div>
                </div>
                <div className="flex items-center bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                  <Star className="text-yellow-500 fill-yellow-500 mr-1" size={18} />
                  <span className="font-semibold text-purple-700">{restaurant.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{restaurant.description}</p>

              {/* Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock size={20} className="text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-400">{t('hours')}</p>
                    <p className="font-medium">{restaurant.opening_time} - {restaurant.closing_time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users size={20} className="text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-400">{t('capacity')}</p>
                    <p className="font-medium">{restaurant.capacity} {t('seats')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star size={20} className="text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-400">{t('cuisine')}</p>
                    <p className="font-medium">{restaurant.cuisine_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-purple-600">
                  {restaurant.price_range.toLocaleString()} {tCommon('dzdCurrency')}
                </span>
                <span className="text-gray-500"> {t('perPerson')}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t('dateLabel')}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    {t('time')}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Users size={16} className="inline mr-1" />
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>{restaurant.price_range.toLocaleString()} {tCommon('dzdCurrency')} x {guests}</span>
                  <span>{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={booking || !date || !time}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? tCommon('processing') : t('bookTable')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
