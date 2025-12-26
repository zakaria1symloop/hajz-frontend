'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, UtensilsCrossed } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import { getRestaurants, getCuisineTypes } from '@/lib/api';
import type { Restaurant } from '@/types';

export default function RestaurantsPage() {
  const t = useTranslations('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [cuisine, setCuisine] = useState('');

  useEffect(() => {
    loadRestaurants();
    getCuisineTypes().then(setCuisineTypes).catch(console.error);
  }, []);

  const loadRestaurants = async (filters?: Record<string, string>) => {
    setLoading(true);
    try {
      const data = await getRestaurants(filters);
      setRestaurants(data.data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters: Record<string, string> = {};
    if (city) filters.city = city;
    if (cuisine) filters.cuisine_type = cuisine;
    loadRestaurants(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-3">{t('title')}</h1>
          <p className="text-xl text-purple-100">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('cityPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('cuisineType')}</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">{t('allCuisines')}</option>
                {cuisineTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center space-x-2"
              >
                <Search size={18} />
                <span>{t('search')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-[380px] animate-pulse">
                <div className="h-52 bg-gray-100 rounded-t-2xl"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed size={56} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
