import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NammaKadaiProvider } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Namma Kadai (நம்ம கடை) - Your shop. Your voice. Your business.',
  description: 'AI-integrated voice inventory and business management app for Indian shop owners. Speak in Tamil or Tanglish.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <NammaKadaiProvider>
          <AppLayout>{children}</AppLayout>
        </NammaKadaiProvider>
      </body>
    </html>
  );
}
