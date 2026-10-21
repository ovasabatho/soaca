import React, { useState, useRef } from 'react';
import {
  Mail,
  Lock,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import type { VoicePart } from '@/types';
import { VOICE_PARTS } from '@/types';
import { Avatar } from '@/components/Avatar';
import { BirthdaySelect } from '@/components/BirthdaySelect';
import { selfRegisterMember } from '@/lib/firestore';
import { isValidBirthday } from '@/lib/format';

interface RegisterViewProps {
  onNavigateToLogin: () => void;
}

export function RegisterView({ onNavigateToLogin }: RegisterViewProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [voicePart, setVoicePart] = useState<VoicePart>('Soprano');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG or PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Passport photo must be under 5MB');
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        const { width, height } = img;

        // Calculate square crop centered on image
        const minSide = Math.min(width, height);
        const startX = (width - minSide) / 2;
        const startY = (height - minSide) / 2;

        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPhotoURL(reader.result as string);
          return;
        }

        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxDim, maxDim);
        setPhotoURL(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!birthDay || !birthMonth) {
      setError('Please select both your birth day and month');
      return;
    }

    const birthdate = `${birthDay}-${birthMonth}`;
    if (!isValidBirthday(birthdate)) {
      setError('Please select a valid birth day (01-31) and month (01-12)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await selfRegisterMember(email.trim(), password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        photoURL: photoURL || null,
        voice_part: voicePart,
        join_date: joinDate || new Date().toISOString().split('T')[0],
        birthdate,
      });
      // Auth listener automatically updates the user state and redirects to the Member Dashboard
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      let msg = 'Registration failed. Please try again';
      if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please provide a valid email address.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error. Please check your connection and try again.';
      } else if (err instanceof Error && err.message) {
        msg = err.message;
      }
      setError(msg);
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

      <div className="relative z-10 w-full max-w-lg">
        {/* Choir Logo */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <img
            src="/logo.png"
            alt="SOACA Logo"
            className="h-32 sm:h-40 w-full max-w-xs object-contain mx-auto mix-blend-multiply drop-shadow-sm"
          />
        </div>

        {/* Registration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Choir Member Registration</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create your account to access music, track dues, and stay updated
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Passport Photo Upload & Circular Crop Preview */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="relative flex-shrink-0">
                <Avatar
                  firstName={firstName || '?'}
                  lastName={lastName || ''}
                  photoURL={photoURL}
                  size="xl"
                />
                {photoURL && (
                  <button
                    type="button"
                    onClick={() => setPhotoURL(null)}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                    title="Remove passport photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">Passport Photo</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  JPG or PNG, max 5MB. Automatically cropped to circle.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    {photoURL ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Doe"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="john.doe@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Phone & Voice Part */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                    placeholder="e.g. 08012345678"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Voice Part <span className="text-red-500">*</span>
                </label>
                <select
                  value={voicePart}
                  onChange={(e) => setVoicePart(e.target.value as VoicePart)}
                  className="select-field"
                  required
                >
                  {VOICE_PARTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Birthday (Day & Month) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <label className="mb-1 block text-sm font-semibold text-slate-800">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <BirthdaySelect
                day={birthDay}
                month={birthMonth}
                onDayChange={setBirthDay}
                onMonthChange={setBirthMonth}
                required
                disabled={loading}
              />
            </div>

            {/* Join Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Join Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-medium text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              >
                Sign In here
              </button>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          SOACA Choir Member & Dues Portal
        </p>
      </div>
    </div>
  );
}
