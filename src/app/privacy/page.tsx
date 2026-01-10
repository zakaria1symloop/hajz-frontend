'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import api from '@/lib/api';

export default function PrivacyPage() {
  const t = useTranslations('pages');
  const locale = useLocale();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/settings/legal', {
          params: { type: 'privacy', lang: locale }
        });
        if (response.data?.content) {
          setContent(response.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [locale]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2FB7EC] transition-colors"
          >
            <HiArrowLeft size={20} className="rtl:rotate-180" />
            <span>{t('backToHome')}</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('privacyPolicy')}</h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2FB7EC]"></div>
            </div>
          ) : content ? (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">1. {t('privacy.dataCollection')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.dataCollectionText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">2. {t('privacy.dataUsage')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.dataUsageText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">3. {t('privacy.dataProtection')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.dataProtectionText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">4. {t('privacy.cookies')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.cookiesText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">5. {t('privacy.thirdParty')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.thirdPartyText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">6. {t('privacy.userRights')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.userRightsText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">7. {t('privacy.contact')}</h2>
              <p className="text-gray-600 mb-4">{t('privacy.contactText')}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
