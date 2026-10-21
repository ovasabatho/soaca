import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Music, Mail, Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again');
      } else {
        setError('Unable to sign in. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 px-4 py-8">
      {/* Faint watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 z-0 w-[380px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* PWA Install Banner */}
        <div className="mb-5">
          <PWAInstallBanner />
        </div>

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="SOACA Logo"
            className="h-52 sm:h-64 w-full max-w-md object-contain mx-auto mix-blend-multiply drop-shadow-md"
          />
        </div>

        {/* Login box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">SOACA Portal</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to view membership and dues status</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@choir.org"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Music className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {onNavigateToRegister && (
            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-600">
                New Member?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5 inline" />
                  Register Here
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Choir Member & Dues Management Portal
        </p>
      </div>
    </div>
  );
}
