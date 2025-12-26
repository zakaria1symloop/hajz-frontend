'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MapPin, Star, Wifi, Car, Dumbbell, UtensilsCrossed, Waves, Shield, Calendar, Users, ArrowLeft } from 'lucide-react';
import { getHotel, createReservation } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Hotel } from '@/types';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={20} />,
  parking: <Car size={20} />,
  gym: <Dumbbell size={20} />,
  restaurant: <UtensilsCrossed size={20} />,
  pool: <Waves size={20} />,
  spa: <Shield size={20} />,
};

export default function HotelDetailPage() {
  const t = useTranslations('hotels');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (params.id) {
      getHotel(Number(params.id))
        .then(setHotel)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      alert(t('selectDates'));
      return;
    }

    setBooking(true);
    try {
      const result = await createReservation({
        type: 'hotel',
        item_id: hotel!.id,
        check_in: checkIn,
        check_out: checkOut,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('notFound')}</p>
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights * hotel.price_per_night;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920'}
          alt={hotel.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                  <div className="flex items-center text-gray-500 mt-2">
                    <MapPin size={18} className="mr-1" />
                    <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
                  </div>
                </div>
                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                  <Star className="text-yellow-500 fill-yellow-500 mr-1" size={18} />
                  <span className="font-semibold text-blue-700">{hotel.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{hotel.description}</p>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('amenities')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        {amenityIcons[amenity] || <Shield size={20} />}
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {hotel.price_per_night.toLocaleString()} {tCommon('dzdCurrency')}
                </span>
                <span className="text-gray-500"> {t('perNight')}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t('checkIn')}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t('checkOut')}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    <Users size={16} className="inline mr-1" />
                    {t('guests')}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n > 1 ? t('guests') : t('guest')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>{hotel.price_per_night.toLocaleString()} {tCommon('dzdCurrency')} x {nights} {t('nights')}</span>
                    <span>{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('total')}</span>
                    <span className="text-blue-600">{totalPrice.toLocaleString()} {tCommon('dzdCurrency')}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={booking || !checkIn || !checkOut}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? tCommon('processing') : t('bookNow')}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                {hotel.rooms_available} {t('roomsAvailable')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
