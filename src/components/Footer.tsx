'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import api from '@/lib/api';

interface SiteSettings {
  site_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
}

export default function Footer() {
  const t = useTranslations('footer');
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Hajz',
    support_email: 'contact@hajz.dz',
    support_phone: '+213 50478',
    address: 'Algiers, Algeria',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/Hajz-Ice-White.png"
                alt="Hajz"
                width={100}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('description')}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('vision')}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2FB7EC] transition-colors">
                  <FaFacebook size={20} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2FB7EC] transition-colors">
                  <FaInstagram size={20} />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2FB7EC] transition-colors">
                  <FaTwitter size={20} />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2FB7EC] transition-colors">
                  <FaLinkedin size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore?type=hotels" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('hotels')}
                </Link>
              </li>
              <li>
                <Link href="/explore?type=restaurants" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('restaurants')}
                </Link>
              </li>
              <li>
                <Link href="/explore?type=cars" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('carRentals')}
                </Link>
              </li>
              <li>
                <Link href="/wilayas" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('destinations')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('termsOfUse')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#2FB7EC] transition-colors text-sm">
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-semibold mb-4 mt-6">{t('contactUs')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlineMail size={16} className="text-[#2FB7EC]" />
                <a href={`mailto:${settings.support_email}`} className="hover:text-[#2FB7EC] transition-colors">
                  {settings.support_email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlinePhone size={16} className="text-[#2FB7EC]" />
                <a href={`tel:${settings.support_phone.replace(/\s/g, '')}`} className="hover:text-[#2FB7EC] transition-colors" dir="ltr">
                  {settings.support_phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <HiOutlineLocationMarker size={16} className="text-[#2FB7EC] flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Hajz. {t('rights')}
            </p>
            <p className="text-gray-500 text-sm">
              {t('madeWith')} <span className="text-red-500">♥</span> {t('inAlgeria')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
