'use client'; // Important for client-side access

import React from 'react';

export default function TestEnvPage() {
  const googleApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  const genericKey = process.env.NEXT_PUBLIC_TEST_KEY; // A new, simple test key

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variable Test</h1>
      <p>NEXT_PUBLIC_Maps_API_KEY: {googleApiKey ? 'Loaded!' : 'NOT LOADED'}</p>
      <p>NEXT_PUBLIC_TEST_KEY: {genericKey ? 'Loaded!' : 'NOT LOADED'}</p>
      {googleApiKey && <p style={{ color: 'green' }}>Google API Key Value Starts With: {googleApiKey.substring(0, 5)}...</p>}
      {genericKey && <p style={{ color: 'blue' }}>Generic Test Key Value: {genericKey}</p>}
    </div>
  );
}