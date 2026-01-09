'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowLeft } from 'react-icons/hi';
import { BsBriefcase, BsBuilding, BsShieldCheck } from 'react-icons/bs';
import { FaHotel, FaUtensils, FaCar } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useProAuth, BusinessType } from '@/context/ProAuthContext';

const businessTypes = [
  { id: 'hotel' as BusinessType, nameKey: 'hotel', icon: FaHotel, color: 'from-blue-500 to-blue-600' },
  { id: 'restaurant' as BusinessType, nameKey: 'restaurant', icon: FaUtensils, color: 'from-orange-500 to-orange-600' },
  { id: 'car_rental' as BusinessType, nameKey: 'carRental', icon: FaCar, color: 'from-green-500 to-green-600' },
];

export default function ProLoginPage() {
  const t = useTranslations('proAuth');
  const router = useRouter();
  const { owner, businessType: savedBusinessType, loading: authLoading, login, register } = useProAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<BusinessType>('hotel');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && owner && savedBusinessType) {
      router.push('/pro/dashboard');
    }
  }, [authLoading, owner, savedBusinessType, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password, selectedType);
      router.push('/pro/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message;
      setError(errorMsg ? translateError(errorMsg) : t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.password_confirmation) {
      setError(t('passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      await register({ ...registerData, type: selectedType });
      router.push('/pro/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message;
      setError(errorMsg ? translateError(errorMsg) : t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  }

  const selectedBusiness = businessTypes.find(b => b.id === selectedType)!;
  const selectedBusinessName = t(selectedBusiness.nameKey);

  // Helper to translate common backend error messages
  const translateError = (message: string) => {
    const errorMap: Record<string, string> = {
      'The provided credentials are incorrect.': t('invalidCredentials'),
      'Invalid credentials': t('invalidCredentials'),
      'These credentials do not match our records.': t('invalidCredentials'),
      'The email has already been taken.': t('emailTaken'),
      'The email field is required.': t('emailRequired'),
      'The password field is required.': t('passwordRequired'),
      'The password must be at least 8 characters.': t('passwordMinLength'),
      'Unauthenticated.': t('sessionExpired'),
      'Too many login attempts. Please try again later.': t('tooManyAttempts'),
    };
    return errorMap[message] || message;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2FB7EC]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <div className="absolute inset-0">
          <Image
            src={selectedType === 'hotel'
              ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
              : selectedType === 'restaurant'
              ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
              : "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80"
            }
            alt={selectedBusinessName}
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link
            href="/"
            className="absolute top-8 start-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <HiOutlineArrowLeft size={20} className="rtl:rotate-180" />
            {t('backToHajz')}
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${selectedBusiness.color} rounded-xl flex items-center justify-center`}>
                <selectedBusiness.icon size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('hajzPro')}</h1>
                <p className="text-white/60 text-sm">{t('forOwners', { business: selectedBusinessName })}</p>
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {t('manageYour', { business: selectedBusinessName })}
              <br />
              <span className="text-[#2FB7EC]">{t('likeAPro')}</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              {selectedType === 'hotel' && t('hotelDesc')}
              {selectedType === 'restaurant' && t('restaurantDesc')}
              {selectedType === 'car_rental' && t('carRentalDesc')}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <BsBuilding size={20} className="text-[#2FB7EC]" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedType === 'hotel' && t('completeHotelManagement')}
                  {selectedType === 'restaurant' && t('menuTableManagement')}
                  {selectedType === 'car_rental' && t('fleetManagement')}
                </p>
                <p className="text-sm text-white/60">
                  {selectedType === 'hotel' && t('roomsPricingAvailability')}
                  {selectedType === 'restaurant' && t('platsTablesReservations')}
                  {selectedType === 'car_rental' && t('carsPricingBookings')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <BsShieldCheck size={20} className="text-[#2FB7EC]" />
              </div>
              <div>
                <p className="font-medium">{t('securePayments')}</p>
                <p className="text-sm text-white/60">{t('directToWallet')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
              <HiOutlineArrowLeft size={20} className="rtl:rotate-180" />
              {t('backToHajz')}
            </Link>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-[#2FB7EC] rounded-xl flex items-center justify-center">
                <BsBriefcase size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('hajzPro')}</h1>
            </div>
          </div>

          {/* Business Type Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">{t('selectBusinessType')}</p>
            <div className="grid grid-cols-3 gap-3">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedType === type.id
                      ? `border-transparent bg-gradient-to-r ${type.color} text-white shadow-lg`
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <type.icon size={24} className="mb-2" />
                  <span className="text-xs font-medium">{t(type.nameKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('register', { business: selectedBusinessName })}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
                <div className="relative">
                  <HiOutlineMail className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full ps-12 pe-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent transition-all"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full ps-12 pe-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent transition-all"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${selectedBusiness.color} text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg`}
              >
                {loading ? t('signingIn') : t('signInToDashboard')}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fullName')}</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent"
                    placeholder={t('namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent"
                    placeholder={`email@${selectedBusinessName.toLowerCase()}.com`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('phone')}</label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent"
                    placeholder={t('minCharacters')}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmPassword')}</label>
                  <input
                    type="password"
                    value={registerData.password_confirmation}
                    onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FB7EC] focus:border-transparent"
                    placeholder={t('confirm')}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${selectedBusiness.color} text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg mt-2`}
              >
                {loading ? t('creatingAccount') : t('registerYour', { business: selectedBusinessName })}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {t('termsAgreement')}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
