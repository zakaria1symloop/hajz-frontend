'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MapPin, Star, Clock, Users, ArrowRight } from 'lucide-react';
import type { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const t = useTranslations('restaurants');

  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-300 group hover:-translate-y-1">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Cuisine badge */}
          <div className="absolute top-4 left-4 bg-rose-500 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-lg">
            {restaurant.cuisine_type}
          </div>

          {/* Rating badge */}
          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
            <Star className="text-amber-500 fill-amber-500" size={16} />
            <span className="text-sm font-black text-gray-800">{restaurant.rating}</span>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{restaurant.price_range.toLocaleString()}</span>
              <span className="text-gray-500 font-bold text-sm">DZD{t('perPerson')}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-black text-xl text-gray-900 group-hover:text-rose-600 transition-colors mb-3 line-clamp-1">
            {restaurant.name}
          </h3>

          <div className="flex items-center text-gray-500 text-sm mb-4">
            <div className="p-1.5 bg-rose-100 rounded-lg mr-2">
              <MapPin size={14} className="text-rose-600" />
            </div>
            <span className="truncate font-medium">{restaurant.city}</span>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
              <Clock size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-gray-600">{restaurant.opening_time} - {restaurant.closing_time}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
              <Users size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-gray-600">{restaurant.capacity} {t('seats')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-rose-500 group-hover:bg-rose-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30">
            {t('bookTable')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Link>
  );
}
