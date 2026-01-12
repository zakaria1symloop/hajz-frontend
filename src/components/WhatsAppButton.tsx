'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import api from '@/lib/api';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        if (response.data?.support_phone) {
          // Clean the phone number - remove spaces and ensure it starts with country code
          let cleanPhone = response.data.support_phone.replace(/\s/g, '');
          // Remove leading + if present for WhatsApp URL
          if (cleanPhone.startsWith('+')) {
            cleanPhone = cleanPhone.substring(1);
          }
          setPhone(cleanPhone);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();

    // Show button after a short delay for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!phone) return null;

  const whatsappUrl = `https://wa.me/${phone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="text-white text-3xl" />

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat with us
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-8 border-transparent border-l-gray-900" />
      </span>
    </a>
  );
}
