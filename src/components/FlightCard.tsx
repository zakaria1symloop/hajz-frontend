'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plane, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { Flight } from '@/types';

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const t = useTranslations('flights');
  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const duration = Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));

  return (
    <Link href={`/flights/${flight.id}`}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 group hover:-translate-y-1">
        {/* Header */}
        <div className="bg-amber-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Plane className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{flight.airline}</p>
                <p className="text-amber-200 text-sm font-medium">{flight.flight_number}</p>
              </div>
            </div>
            <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold capitalize backdrop-blur-sm">
              {flight.class}
            </span>
          </div>
        </div>

        {/* Flight Route */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">
                {format(departureTime, 'HH:mm')}
              </p>
              <p className="text-sm font-bold text-gray-500 mt-1">{flight.departure_city}</p>
            </div>

            <div className="flex-1 px-6">
              <div className="flex items-center justify-center">
                <div className="h-0.5 bg-amber-200 flex-1"></div>
                <div className="mx-3 p-2.5 bg-amber-100 rounded-full">
                  <Plane className="text-amber-500 rotate-90" size={18} />
                </div>
                <div className="h-0.5 bg-amber-200 flex-1"></div>
              </div>
              <div className="flex items-center justify-center text-xs text-amber-600 font-bold mt-2">
                <Clock size={14} className="mr-1" />
                {duration}h {t('flight')}
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">
                {format(arrivalTime, 'HH:mm')}
              </p>
              <p className="text-sm font-bold text-gray-500 mt-1">{flight.arrival_city}</p>
            </div>
          </div>

          {/* Date */}
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-100 px-4 py-2 rounded-full font-medium">
              {format(departureTime, 'EEEE, MMM d, yyyy')}
            </span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">
                  {flight.price.toLocaleString()}
                </span>
                <span className="text-gray-400 font-bold">DZD</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Sparkles size={14} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">{flight.seats_available} {t('seatsLeft')}</span>
              </div>
            </div>
            <button className="bg-amber-500 group-hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/30">
              {t('bookFlight')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
