import Link from 'next/link'
import { AuthProvider } from '@/components/AuthContext' // ← Add this back
import './globals.css'

const Header = () => {
  const navigation = [
    { name: 'Capacity', href: '/capacity-scorecard' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Routes', href: '/routes' },
    { name: 'Financial', href: '/financial' },
    { name: 'SMS', href: '/sms' },
    { name: 'Photos', href: '/photos' },
    { name: 'Weather', href: '/weather' },
  ]

  return (
    <nav style={{
      background: 'linear-gradient(to right, #1e3a8a, #1e40af, #7c3aed)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        height: '4rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none'
        }}>
          <div style={{
            height: '2rem',
            width: '2rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>⚡</span>
          </div>
          <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Route & Retain
          </span>
        </Link>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: '#dbeafe',
                transition: 'all 0.2s ease'
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Sign In */}
        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer'
        }}>
          Sign In
        </button>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Route & Retain - Contractor Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider> {/* ← Add this wrapper back */}
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider> {/* ← Close the wrapper */}
      </body>
    </html>
  )
}