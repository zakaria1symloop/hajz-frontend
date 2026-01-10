'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import api from '@/lib/api';

export default function TermsPage() {
  const t = useTranslations('pages');
  const locale = useLocale();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/settings/legal', {
          params: { type: 'terms', lang: locale }
        });
        if (response.data?.content) {
          setContent(response.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch terms of use:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('termsOfUse')}</h1>

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
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">1. {t('terms.acceptance')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.acceptanceText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">2. {t('terms.services')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.servicesText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">3. {t('terms.userAccount')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.userAccountText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">4. {t('terms.booking')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.bookingText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">5. {t('terms.payment')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.paymentText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">6. {t('terms.cancellation')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.cancellationText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">7. {t('terms.liability')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.liabilityText')}</p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">8. {t('terms.contact')}</h2>
              <p className="text-gray-600 mb-4">{t('terms.contactText')}</p>
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
