'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { HiOutlinePhone, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { FiLogIn } from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'py-2'
          : 'py-4'
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto transition-all duration-500 ease-out ${
          scrolled
            ? 'mx-3 sm:mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 px-4 sm:px-6 py-2.5 sm:py-3'
            : 'mx-3 sm:mx-4 bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`text-2xl font-extrabold tracking-tight transition-all duration-500 hover:scale-105 ${
              scrolled ? 'text-[#2FB7EC]' : 'text-white'
            }`}
          >
            <span className="inline-block animate-fadeIn">Hajz</span>
          </Link>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-6">
            {/* Phone Number */}
            <a
              href="tel:+213123456789"
              className={`flex items-center gap-2 transition-all duration-500 group ${
                scrolled ? 'text-gray-600 hover:text-[#2FB7EC]' : 'text-white/90 hover:text-white'
              }`}
            >
              <span className={`p-2 rounded-full transition-all duration-300 ${
                scrolled ? 'bg-gray-100 group-hover:bg-[#2FB7EC]/10' : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <HiOutlinePhone size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              </span>
              <span className="font-medium text-sm">+213 123 456 789</span>
            </a>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`font-medium ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    scrolled ? 'text-gray-400 hover:text-red-500' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                  scrolled
                    ? 'bg-[#2FB7EC] text-white shadow-lg shadow-[#2FB7EC]/25 hover:shadow-xl hover:shadow-[#2FB7EC]/30'
                    : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
                }`}
              >
                <FiLogIn size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${
              scrolled
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <div className="relative w-6 h-6">
              <HiOutlineMenu
                size={24}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                }`}
              />
              <HiOutlineX
                size={24}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMenuOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`pt-4 border-t ${scrolled ? 'border-gray-100' : 'border-white/10'}`}>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+213123456789"
                className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-300 ${
                  scrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                }`}
              >
                <HiOutlinePhone size={20} />
                <span className="font-medium">+213 123 456 789</span>
              </a>

              <div className="py-2 px-3">
                <LanguageSwitcher />
              </div>

              {user ? (
                <div className="flex items-center justify-between py-3 px-3">
                  <span className={`font-medium ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                    {user.name}
                  </span>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="text-red-500 font-medium"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-[#2FB7EC] text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-[#26a5d8]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn size={18} />
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
