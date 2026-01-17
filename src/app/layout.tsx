import type { Metadata } from "next";
import { Outfit, Changa } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import ToastProvider from "@/components/ToastProvider";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const changa = Changa({ subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Hajz - Book Hotels, Flights & Restaurants",
  description: "Your trusted partner for booking hotels, flights, and restaurants across Algeria and beyond.",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={`${isRTL ? changa.className : outfit.className} antialiased bg-white`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ToastProvider />
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
