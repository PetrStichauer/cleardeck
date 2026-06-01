'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabaseClient().auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      router.push('/inbox');
      router.refresh();
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'var(--background)',
      }}
    >
      <div
        style={{
          width: 'min(380px, calc(100vw - 32px))',
          padding: '40px',
          background: 'var(--sidebar-bg)',
          borderRadius: '16px',
          border: '1px solid var(--sidebar-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '22px',
              color: '#fff',
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: 0,
              color: 'var(--foreground)',
            }}
          >
            ClearDeck
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--muted-text)',
              margin: '4px 0 0',
            }}
          >
            Create your account
          </p>
        </div>

        {success ? (
          <p style={{ textAlign: 'center', color: 'var(--muted-text)', fontSize: '14px' }}>
            Account created! Redirecting…
          </p>
        ) : (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground)',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--sidebar-border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground)',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--sidebar-border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  color: '#ff3b30',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: loading ? 'var(--muted-text)' : 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: 'var(--muted-text)',
          }}
        >
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
