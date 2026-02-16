'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push('/dashboard/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(94, 255, 110, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(94, 255, 110, 0.2);
          }
        }

        .logo-badge {
          animation: slideInDown 0.6s ease-out;
        }

        .content-container {
          animation: fadeInUp 0.7s ease-out 0.1s both;
        }

        .form-container {
          animation: fadeInUp 0.7s ease-out 0.2s both;
        }

        .footer-text {
          animation: fadeInUp 0.7s ease-out 0.3s both;
        }

        .heading-display {
          font-family: 'Bebas Neue', sans-serif;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .body-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
        }

        .body-semibold {
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
        }

        .body-bold {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
        }

        .input-field {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(17, 17, 17, 0.8);
          border: 1.5px solid rgba(94, 255, 110, 0.15);
          color: #ffffff;
        }

        .input-field:focus {
          background: rgba(17, 17, 17, 1);
          border-color: #5EFF6E;
          box-shadow: 0 0 20px rgba(94, 255, 110, 0.2), inset 0 0 20px rgba(94, 255, 110, 0.05);
          outline: none;
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .btn-primary {
          font-family: 'Bebas Neue', sans-serif;
          font-weight: 400;
          letter-spacing: 1.5px;
          background: #5EFF6E;
          color: #0a0a0a;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(94, 255, 110, 0.3);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: left 0.3s ease;
        }

        .btn-primary:hover::before:not(:disabled) {
          left: 100%;
        }

        .btn-secondary {
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          border: 1.5px solid rgba(94, 255, 110, 0.2);
          background: rgba(22, 22, 22, 0.6);
          color: #ffffff;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #5EFF6E;
          background: rgba(94, 255, 110, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(94, 255, 110, 0.15);
        }

        .btn-secondary:active:not(:disabled) {
          transform: translateY(0);
        }

        .label-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
        }

        .divider-line {
          background: linear-gradient(90deg, rgba(94,255,110,0) 0%, rgba(94,255,110,0.15) 50%, rgba(94,255,110,0) 100%);
        }

        .green-accent {
          color: #5EFF6E;
        }
      `}</style>

      {/* Ambient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-gradient-radial from-green-900/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-gradient-radial from-slate-900/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-16 logo-badge">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-[#5EFF6E]/20 bg-[#111111]/40 backdrop-blur-sm">
            <div className="w-7 h-7 bg-[#5EFF6E] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#0a0a0a] font-bold text-xs tracking-wider heading-display">FC</span>
            </div>
            <span className="text-white text-lg font-bold tracking-tight heading-display">FiveCount</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 content-container">
          <h1 className="heading-display text-5xl md:text-6xl text-white mb-3">WELCOME BACK</h1>
          <p className="body-text text-base text-[#ffffff]/70 leading-relaxed">
            Sign in to your FiveCount account
          </p>
        </div>

        {/* Forms Section */}
        <div className="form-container space-y-5">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="btn-secondary w-full py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="body-semibold leading-none">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px divider-line" />
            <span className="body-text text-xs uppercase tracking-widest text-[#ffffff]/50">Or</span>
            <div className="flex-1 h-px divider-line" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-950/20 border border-red-700/30 rounded-lg backdrop-blur-sm">
              <p className="body-text text-red-300 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-text block mb-2.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                required
                disabled={isLoading}
                className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-text block mb-2.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 relative z-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                  <span className="heading-display tracking-wider">Signing In</span>
                </span>
              ) : (
                <span className="heading-display tracking-wider">SIGN IN</span>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <p className="body-text text-center text-[#ffffff]/60 text-sm">
            New to FiveCount?{' '}
            <Link
              href="/auth/signup"
              className="green-accent body-bold hover:text-[#4dd659] transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="footer-text mt-12 pt-8 border-t border-[#5EFF6E]/10 text-center text-xs text-[#ffffff]/50 space-y-3">
          <p className="body-text leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[#ffffff]/70 hover:text-[#5EFF6E] underline transition-colors">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#ffffff]/70 hover:text-[#5EFF6E] underline transition-colors">
              Privacy Policy
            </Link>
          </p>
          <p className="pt-2">© 2026 FiveCount. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
