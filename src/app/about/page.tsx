'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { HiArrowLeft, HiChevronDown } from 'react-icons/hi';
import { IoShieldCheckmark, IoRocket, IoGlobe, IoHeartOutline } from 'react-icons/io5';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">{item.question}</span>
            <HiChevronDown
              className={`flex-shrink-0 text-[#2FB7EC] transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              size={20}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <p className="px-6 pb-4 text-gray-600 leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  const t = useTranslations('about');

  const faqItems: FAQItem[] = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5'),
    },
    {
      question: t('faq.q6'),
      answer: t('faq.a6'),
    },
    {
      question: t('faq.q7'),
      answer: t('faq.a7'),
    },
    {
      question: t('faq.q8'),
      answer: t('faq.a8'),
    },
    {
      question: t('faq.q9'),
      answer: t('faq.a9'),
    },
  ];

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2FB7EC] to-[#1a9fd4] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-white/80">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('whoWeAre')}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {t('description1')}
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              {t('description2')}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t('description3')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('visionTitle')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('visionText')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2FB7EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <IoGlobe className="text-[#2FB7EC]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('value1Title')}</h3>
                <p className="text-gray-600 text-sm">{t('value1Text')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2FB7EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <IoShieldCheckmark className="text-[#2FB7EC]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('value2Title')}</h3>
                <p className="text-gray-600 text-sm">{t('value2Text')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2FB7EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <IoRocket className="text-[#2FB7EC]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('value3Title')}</h3>
                <p className="text-gray-600 text-sm">{t('value3Text')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2FB7EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <IoHeartOutline className="text-[#2FB7EC]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('value4Title')}</h3>
                <p className="text-gray-600 text-sm">{t('value4Text')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#2FB7EC] font-semibold text-sm tracking-widest uppercase mb-3">
              {t('faqLabel')}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faqTitle')}</h2>
            <p className="text-gray-600">
              {t('faqSubtitle')}
            </p>
          </div>

          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2FB7EC] to-[#1a9fd4]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-white/80 mb-8">{t('ctaSubtitle')}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-[#2FB7EC] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
