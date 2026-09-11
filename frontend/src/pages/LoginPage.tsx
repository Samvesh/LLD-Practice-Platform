import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_8px_30px_-4px_rgba(30,41,59,0.06),0_2px_8px_-1px_rgba(30,41,59,0.03)] border border-[#F1EBE4] p-8 sm:p-10">
        {/* Centered Logo */}
        <div className="flex justify-center">
          <Logo showTagline={true} size="md" />
        </div>

        {/* Heading and Subtext */}
        <div className="text-center mt-7">
          <h1 className="text-2xl sm:text-[28px] font-bold text-navy tracking-tight leading-tight">
            Sign In
          </h1>
          <p className="text-slate-subtext text-sm mt-1.5">
            Continue your system design journey
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-navy mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-muted pointer-events-none flex items-center">
                <Mail size={17} strokeWidth={2} />
              </div>
              <input
                id="email"
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50/60 border border-[#E2E8F0] rounded-xl text-navy text-sm placeholder:text-slate-muted focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all outline-none"
                placeholder="you@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-navy mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-muted pointer-events-none flex items-center">
                <Lock size={17} strokeWidth={2} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-11 py-2.5 bg-cream-50/60 border border-[#E2E8F0] rounded-xl text-navy text-sm placeholder:text-slate-muted focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all outline-none"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-slate-muted hover:text-slate-subtext transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot password link */}
            <div className="text-right mt-2">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your email.');
                }}
                className="text-xs font-semibold text-terracotta hover:text-terracotta-600 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-terracotta hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-[#F1EAE0]" />

        {/* Footer */}
        <div className="text-center text-sm text-slate-subtext">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-terracotta font-semibold underline underline-offset-2 hover:text-terracotta-600 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
