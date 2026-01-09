'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function BookingFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('booking');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    setPaymentId(searchParams.get('payment_id'));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('paymentFailed')}
        </h1>

        <p className="text-gray-600 mb-6">
          {t('paymentFailedMessage')}
        </p>

        {paymentId && (
          <p className="text-sm text-gray-500 mb-6">
            {t('paymentId')}: #{paymentId}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={20} />
            {t('tryAgain')}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home size={20} />
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
