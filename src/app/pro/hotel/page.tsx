'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useProAuth } from '@/context/ProAuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlinePhotograph, HiOutlinePlus, HiOutlineTrash, HiOutlineStar, HiOutlineLocationMarker, HiOutlineClock, HiOutlinePhone, HiOutlineMail, HiOutlineGlobe, HiOutlineUpload } from 'react-icons/hi';
import { BsBriefcase } from 'react-icons/bs';
import { useTranslations } from 'next-intl';

interface HotelImage {
  id: number;
  image_path: string;
  url?: string;
  is_primary: boolean;
}

export default function MyHotelPage() {
  const router = useRouter();
  const { hotelOwner, hotel, loading, refreshHotel } = useProAuth();
  const t = useTranslations('proHotel');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hotelImages, setHotelImages] = useState<HotelImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    star_rating: 3,
    phone: '',
    email: '',
    website: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
    amenities: [] as string[],
  });

  useEffect(() => {
    if (!loading && !hotelOwner) {
      router.push('/pro/login');
    }
    if (!loading && !hotel) {
      router.push('/pro/hotel/create');
    }
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        state: hotel.state || '',
        star_rating: hotel.star_rating || 3,
        phone: (hotel as any).phone || '',
        email: (hotel as any).email || '',
        website: (hotel as any).website || '',
        check_in_time: (hotel as any).check_in_time || '14:00',
        check_out_time: (hotel as any).check_out_time || '12:00',
        amenities: (hotel as any).amenities || [],
      });
      // Load hotel images
      if ((hotel as any).images) {
        setHotelImages((hotel as any).images);
      }
    }
  }, [loading, hotelOwner, hotel, router]);

  const getImageUrl = (image: HotelImage) => {
    if (image.url) return image.url;
    if (image.image_path?.startsWith('http')) return image.image_path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${image.image_path}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files - must be landscape (width > height)
    for (const file of Array.from(files)) {
      const img = document.createElement('img');
      const objectUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          if (img.width < img.height) {
            toast.error(t('landscapeOnly'));
            reject();
          } else {
            resolve();
          }
        };
        img.src = objectUrl;
      }).catch(() => {
        return;
      });
    }

    setUploadingImages(true);
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('images[]', file);
    }

    try {
      const token = localStorage.getItem('pro_token');
      const response = await api.post('/hotel-owner/hotel/images', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(t('imagesUploaded'));
      await refreshHotel();
      if (response.data.images) {
        setHotelImages(response.data.images);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('uploadFailed'));
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm(t('confirmDeleteImage'))) return;

    try {
      const token = localStorage.getItem('pro_token');
      await api.delete(`/hotel-owner/hotel/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t('imageDeleted'));
      setHotelImages(hotelImages.filter(img => img.id !== imageId));
      await refreshHotel();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('deleteFailed'));
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      const token = localStorage.getItem('pro_token');
      await api.put(`/hotel-owner/hotel/images/${imageId}/primary`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t('primarySet'));
      setHotelImages(hotelImages.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      await refreshHotel();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('updateFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('pro_token');
      await api.put('/hotel-owner/hotel', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('hotelUpdated'));
      await refreshHotel();
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2FB7EC]"></div>
      </div>
    );
  }

  if (!hotel) return null;

  const statusColor = hotel.status === 'verified' ? 'bg-green-100 text-green-700' :
                      hotel.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pro/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <HiOutlineArrowLeft size={20} className="rtl:rotate-180" />
              {t('dashboard')}
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2FB7EC] rounded-lg flex items-center justify-center">
                <BsBriefcase size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">{t('myHotel')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {hotel.status}
            </span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2FB7EC] text-white rounded-lg hover:bg-[#26a5d8] transition-colors"
              >
                <HiOutlinePencil size={16} />
                {t('edit')}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          {/* Hotel Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            {/* Hotel Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <HiOutlineLocationMarker size={16} />
                    <span>{hotel.city}, {hotel.state}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={!editing}
                      onClick={() => editing && setFormData({ ...formData, star_rating: star })}
                      className={`${editing ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <HiOutlineStar
                        size={24}
                        className={`${(editing ? formData.star_rating : hotel.star_rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] resize-none"
                  />
                ) : (
                  <p className="text-gray-600">{hotel.description || t('noDescription')}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('address')}</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                  />
                ) : (
                  <p className="text-gray-600">{hotel.address}</p>
                )}
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    />
                  ) : (
                    <p className="text-gray-600">{hotel.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('state')}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    />
                  ) : (
                    <p className="text-gray-600">{hotel.state}</p>
                  )}
                </div>
              </div>

              {/* Check-in/out Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineClock className="inline me-1" size={16} />
                    {t('checkIn')}
                  </label>
                  {editing ? (
                    <input
                      type="time"
                      value={formData.check_in_time}
                      onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.check_in_time}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineClock className="inline me-1" size={16} />
                    {t('checkOut')}
                  </label>
                  {editing ? (
                    <input
                      type="time"
                      value={formData.check_out_time}
                      onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.check_out_time}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiOutlinePhone className="inline me-1" size={16} />
                  {t('phone')}
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                    placeholder="+213 XXX XXX XXX"
                  />
                ) : (
                  <p className="text-gray-600">{formData.phone || t('notProvided')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiOutlineMail className="inline me-1" size={16} />
                  {t('email')}
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC]"
                  />
                ) : (
                  <p className="text-gray-600">{formData.email || t('notProvided')}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2FB7EC] text-white rounded-lg hover:bg-[#26a5d8] transition-colors disabled:opacity-50"
                >
                  {saving ? t('saving') : (
                    <>
                      <HiOutlineCheck size={18} />
                      {t('saveChanges')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Hotel Images Section */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <HiOutlinePhotograph size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('hotelImages')}</h2>
                    <p className="text-sm text-gray-500">{t('uploadLandscapeImages')}</p>
                  </div>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hotel-images"
                  />
                  <label
                    htmlFor="hotel-images"
                    className={`flex items-center gap-2 px-4 py-2.5 bg-[#2FB7EC] text-white rounded-lg hover:bg-[#26a5d8] transition-colors cursor-pointer ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingImages ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('uploading')}
                      </>
                    ) : (
                      <>
                        <HiOutlineUpload size={18} />
                        {t('uploadImages')}
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6">
              {hotelImages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <HiOutlinePhotograph size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">{t('noImages')}</p>
                  <p className="text-sm text-gray-400">{t('uploadLandscapeHint')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hotelImages.map((image) => (
                    <div key={image.id} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(image)}
                        alt="Hotel"
                        className="w-full h-full object-cover"
                      />
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {t('primary')}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(image.id)}
                            className="p-2 bg-white rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            title={t('setPrimary')}
                          >
                            <HiOutlineStar size={20} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title={t('deleteImage')}
                        >
                          <HiOutlineTrash size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/pro/rooms"
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#2FB7EC] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <HiOutlinePlus size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('manageRooms')}</h3>
              <p className="text-sm text-gray-500">{t('addEditRooms')}</p>
            </Link>

            <Link
              href="/pro/reservations"
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#2FB7EC] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <HiOutlineCheck size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('viewReservations')}</h3>
              <p className="text-sm text-gray-500">{t('manageBookings')}</p>
            </Link>

            <Link
              href="/pro/wallet"
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#2FB7EC] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <span className="text-purple-600 font-bold">DZD</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('wallet')}</h3>
              <p className="text-sm text-gray-500">{t('viewEarnings')}</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
