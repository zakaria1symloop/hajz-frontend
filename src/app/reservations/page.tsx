'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Users, Clock, Building2, Plane, UtensilsCrossed, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getReservations, cancelReservation } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Reservation } from '@/types';

const typeIcons = {
  'App\\Models\\Hotel': <Building2 size={20} />,
  'App\\Models\\Flight': <Plane size={20} />,
  'App\\Models\\Restaurant': <UtensilsCrossed size={20} />,
};

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ReservationsPage() {
  const t = useTranslations('reservations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadReservations();
    }
  }, [user, authLoading, router]);

  const loadReservations = async () => {
    try {
      const data = await getReservations();
      setReservations(data.data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('cancelConfirm'))) return;

    try {
      await cancelReservation(id);
      loadReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert(t('cancelFailed'));
    }
  };

  const getTypeName = (type: string) => {
    if (type.includes('Hotel')) return t('hotelReservation');
    if (type.includes('Flight')) return t('flightReservation');
    if (type.includes('Restaurant')) return t('restaurantReservation');
    return 'Unknown';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-3">{t('title')}</h1>
          <p className="text-xl text-blue-100">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('noReservations')}</h2>
            <p className="text-gray-500 mb-6">{t('startExploring')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/hotels" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                {t('browseHotels')}
              </Link>
              <Link href="/flights" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                {t('findFlights')}
              </Link>
              <Link href="/restaurants" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition">
                {t('discoverRestaurants')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                        {typeIcons[reservation.reservable_type as keyof typeof typeIcons] || <Calendar size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getTypeName(reservation.reservable_type)}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[reservation.status]}`}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          {reservation.check_in && reservation.check_out && (
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-1" />
                              <span>
                                {format(new Date(reservation.check_in), 'MMM d')} - {format(new Date(reservation.check_out), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          {reservation.reservation_date && (
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1" />
                              <span>{format(new Date(reservation.reservation_date), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users size={16} className="mr-1" />
                            <span>{reservation.guests} Guest{reservation.guests > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {reservation.total_price.toLocaleString()} {tCommon('dzdCurrency')}
                        </p>
                        {reservation.payment && (
                          <p className={`text-sm ${reservation.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {t('payment')}: {reservation.payment.status}
                          </p>
                        )}
                      </div>
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                          title={t('cancel')}
                        >
                          <XCircle size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
