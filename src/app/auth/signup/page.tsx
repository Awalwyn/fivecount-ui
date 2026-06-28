'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthMonth: '',
    birthYear: '',
  });
  const [role, setRole] = useState<'ATHLETE' | 'COACH'>('ATHLETE');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAge = (): boolean => {
    if (!formData.birthMonth || !formData.birthYear) {
      setError('Please provide your birth month and year');
      return false;
    }

    const birthYear = parseInt(formData.birthYear);
    const birthMonth = parseInt(formData.birthMonth);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const age = currentYear - birthYear - (currentMonth < birthMonth ? 1 : 0);

    if (age < 14) {
      setError('You must be at least 14 years old to join');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setError('Please provide your first and last name');
      return;
    }

    if (!formData.username) {
      setError('Please choose a username');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!validateAge()) {
      return;
    }

    if (role === 'COACH' && !formData.email.endsWith('.edu')) {
      setError('Coaches must use a .edu email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await signUp(formData.email, formData.password, role, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
      });
      router.push('/dashboard/dashboard');
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

        .checkbox-custom {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border: 1.5px solid rgba(94, 255, 110, 0.3);
          border-radius: 4px;
          background: rgba(17, 17, 17, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink-0;
        }

        .checkbox-custom:checked {
          background: #5EFF6E;
          border-color: #5EFF6E;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%230a0a0a' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 11-1.06-1.06L12.72 4.22a.75.75 0 011.06 0z'/%3E%3C/svg%3E");
          background-size: 100%;
          background-position: center;
          background-repeat: no-repeat;
        }

        .checkbox-custom:focus {
          border-color: #5EFF6E;
          box-shadow: 0 0 10px rgba(94, 255, 110, 0.3);
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
        <div className="flex justify-center mb-12 logo-badge">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-[#5EFF6E]/20 bg-[#111111]/40 backdrop-blur-sm">
            <div className="w-7 h-7 bg-[#5EFF6E] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#0a0a0a] font-bold text-xs tracking-wider heading-display">FC</span>
            </div>
            <span className="text-white text-lg font-bold tracking-tight heading-display">FiveCount</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 content-container">
          <h1 className="heading-display text-5xl md:text-6xl text-white mb-3">JOIN US</h1>
          <p className="body-text text-base text-[#ffffff]/70 leading-relaxed">
            Create your FiveCount account
          </p>
        </div>

        {/* Forms Section */}
        <div className="form-container space-y-5">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="btn-secondary w-full py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="body-semibold leading-none">Sign up with Google</span>
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

          {/* Signup Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label-text block mb-2.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  disabled={isLoading}
                  className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label-text block mb-2.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                  className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label-text block mb-2.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="athlete@example.com"
                required
                disabled={isLoading}
                className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="username" className="label-text block mb-2.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-text block mb-2.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Birth Month and Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="birthMonth" className="label-text block mb-2.5">
                  Birth Month
                </label>
                <select
                  id="birthMonth"
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label htmlFor="birthYear" className="label-text block mb-2.5">
                  Birth Year
                </label>
                <select
                  id="birthYear"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="input-field w-full rounded-lg px-4 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="label-text block mb-2.5">Account Type</label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-lg cursor-pointer transition-all" style={{
                  backgroundColor: role === 'ATHLETE' ? 'rgba(94, 255, 110, 0.1)' : 'rgba(17, 17, 17, 0.8)',
                  border: `1.5px solid ${role === 'ATHLETE' ? '#5EFF6E' : 'rgba(94, 255, 110, 0.15)'}`,
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="ATHLETE"
                    checked={role === 'ATHLETE'}
                    onChange={(e) => setRole(e.target.value as 'ATHLETE' | 'COACH')}
                    disabled={isLoading}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="body-text text-white text-sm">I&apos;m an Athlete</span>
                </label>

                <label className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-lg cursor-pointer transition-all" style={{
                  backgroundColor: role === 'COACH' ? 'rgba(94, 255, 110, 0.1)' : 'rgba(17, 17, 17, 0.8)',
                  border: `1.5px solid ${role === 'COACH' ? '#5EFF6E' : 'rgba(94, 255, 110, 0.15)'}`,
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="COACH"
                    checked={role === 'COACH'}
                    onChange={(e) => setRole(e.target.value as 'ATHLETE' | 'COACH')}
                    disabled={isLoading}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="body-text text-white text-sm">I&apos;m a Coach</span>
                </label>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
                className="checkbox-custom mt-1"
              />
              <label htmlFor="terms" className="body-text text-sm text-[#ffffff]/70 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" className="green-accent body-semibold hover:text-[#4dd659] transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="green-accent body-semibold hover:text-[#4dd659] transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="btn-primary w-full py-3.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 relative z-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                  <span className="heading-display tracking-wider">Creating Account</span>
                </span>
              ) : (
                <span className="heading-display tracking-wider">CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="body-text text-center text-[#ffffff]/60 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="green-accent body-bold hover:text-[#4dd659] transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="footer-text mt-12 pt-8 border-t border-[#5EFF6E]/10 text-center text-xs text-[#ffffff]/50 space-y-3">
          <p className="body-text leading-relaxed">
            By creating an account, you agree to our{' '}
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
