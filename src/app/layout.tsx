import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Toast } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'EdemFarm — Farm to Table Marketplace',
  description: 'Natural products from local farmers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EdemFarm — Farm to Table Marketplace',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-surface-950 text-slate-100 min-h-dvh antialiased">
        {children}
        <Toast />
      </body>
    </html>
  );
}
