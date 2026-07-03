'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_SIGNUP = { name: '', email: '', password: '' };

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login');
  const [loginData, setLoginData] = useState(INITIAL_LOGIN);
  const [signupData, setSignupData] = useState(INITIAL_SIGNUP);
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const isLoginMode = mode === 'login';

  const setLoading = () => setStatus({ loading: true, error: '', success: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading();

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      setStatus({ loading: false, error: '', success: 'Login successful. Redirecting...' });
      router.push(searchParams.get('next') || '/admin');
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const middlewareMessage =
    searchParams.get('error') === 'admin_only'
      ? 'Admin account required for dashboard access.'
      : searchParams.get('error') === 'session_invalid'
        ? 'Session expired. Please log in again.'
        : '';

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading();

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed.');
      }

      setStatus({
        loading: false,
        error: '',
        success: 'Account created. You can log in now.',
      });
      setLoginData({ email: signupData.email, password: '' });
      setSignupData(INITIAL_SIGNUP);
      setMode('login');
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6 py-16 bg-[radial-gradient(circle_at_20%_20%,rgba(77,158,87,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(23,48,34,0.14),transparent_40%),#f6f1e8]">
      <div className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden rounded-[2rem] border border-[#102016]/10 shadow-xl bg-[#fffdf8]">
        <div className="p-10 bg-[#102016] text-white flex flex-col justify-between">
          <div className="space-y-5">
            <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#9de0a7]">EditGenix Access</p>
            <h1 className="text-4xl font-extrabold leading-tight">Client Portal Login</h1>
            <p className="text-sm text-white/80 max-w-sm">
              Sign in to manage galleries and secure downloads. New here? Create an account in seconds.
            </p>
          </div>

          <div className="mt-10 space-y-3 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9de0a7]" />
              Passwords are encrypted with bcrypt
            </div>
            <div>Need public galleries? Go back to <Link href="/" className="underline text-[#9de0a7]">homepage</Link>.</div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="inline-flex rounded-full border border-[#102016]/10 p-1 bg-white mb-8">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatus({ loading: false, error: '', success: '' });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition ${
                isLoginMode ? 'bg-[#102016] text-white' : 'text-[#566258]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatus({ loading: false, error: '', success: '' });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition ${
                !isLoginMode ? 'bg-[#4d9e57] text-white' : 'text-[#566258]'
              }`}
            >
              Signup
            </button>
          </div>

          {isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#566258]">Email</label>
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#4d9e57]"
                placeholder="owner@editgenix.com"
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-[#566258]">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={loginData.password}
                onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#4d9e57]"
                placeholder="Enter your password"
              />

              <button
                type="submit"
                disabled={status.loading}
                className="w-full mt-3 py-3 rounded-full bg-[#102016] hover:bg-[#4d9e57] text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                {status.loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#566258]">Full Name</label>
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#4d9e57]"
                placeholder="Your name"
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-[#566258]">Email</label>
              <input
                type="email"
                required
                value={signupData.email}
                onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#4d9e57]"
                placeholder="owner@editgenix.com"
              />

              <label className="block text-xs font-bold uppercase tracking-wider text-[#566258]">Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={signupData.password}
                onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#4d9e57]"
                placeholder="Create a strong password"
              />

              <button
                type="submit"
                disabled={status.loading}
                className="w-full mt-3 py-3 rounded-full bg-[#4d9e57] hover:bg-[#173022] text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                {status.loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {status.error && (
            <p className="mt-4 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2">
              {status.error}
            </p>
          )}

          {!status.error && middlewareMessage && (
            <p className="mt-4 text-sm rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2">
              {middlewareMessage}
            </p>
          )}

          {status.success && (
            <p className="mt-4 text-sm rounded-xl border border-green-200 bg-green-50 text-green-700 px-3 py-2">
              {status.success}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[85vh] flex items-center justify-center px-6 py-16 bg-[radial-gradient(circle_at_20%_20%,rgba(77,158,87,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(23,48,34,0.14),transparent_40%),#f6f1e8]">
          <div className="text-sm font-bold text-[#102016]">Loading authentication...</div>
        </section>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
