import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthContext';
import Header from '@/components/dashboard/Header';

export const metadata: Metadata = {
  title: 'Route & Retain - Contractor Platform',
  description: 'AI-Powered Integrated Platform for Contractors',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Route & Retain',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Route & Retain',
    title: 'Route & Retain - Contractor Platform',
    description: 'AI-Powered Integrated Platform for Contractors',
  },
  twitter: {
    card: 'summary',
    title: 'Route & Retain - Contractor Platform',
    description: 'AI-Powered Integrated Platform for Contractors',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Route & Retain" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}