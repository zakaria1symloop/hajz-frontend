'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇩🇿', dir: 'rtl' },
];

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const router = useRouter();
  const t = useTranslations('settings');
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current language from cookie or localStorage
    const cookieLang = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1];
    const savedLang = cookieLang || localStorage.getItem('locale') || 'en';
    setCurrentLang(savedLang);

    // Set document direction and language
    const lang = languages.find(l => l.code === savedLang);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = savedLang;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    const lang = languages.find(l => l.code === code);
    if (!lang) return;

    // Save to cookie (for server-side next-intl)
    document.cookie = `locale=${code};path=/;max-age=31536000`;

    // Save to localStorage (for persistence)
    localStorage.setItem('locale', code);

    // Update document direction
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = code;

    setCurrentLang(code);
    setIsOpen(false);

    // Refresh page to apply new locale
    router.refresh();
    window.location.reload();
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  const buttonStyles = variant === 'dark'
    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${buttonStyles}`}
        aria-label="Change language"
      >
        <span className="text-xl leading-none">{current.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown
          size={14}
          className={`opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-52 bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 py-1 z-50 animate-fadeIn overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('language')}</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                currentLang === lang.code
                  ? 'bg-[#2FB7EC]/10 text-[#2FB7EC]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-xl">
                {lang.flag}
              </span>
              <div className="flex-1 text-start">
                <p className="text-sm font-medium">{lang.nativeName}</p>
                <p className="text-xs text-gray-400">{lang.name}</p>
              </div>
              {currentLang === lang.code && (
                <Check size={16} className="text-[#2FB7EC]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
