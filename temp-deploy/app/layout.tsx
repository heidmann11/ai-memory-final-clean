import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Header from '@/components/dashboard/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Route & Retain',
  description: 'Field Service Management Software',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
