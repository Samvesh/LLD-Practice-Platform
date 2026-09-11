import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Award,
} from 'lucide-react';

export default function ProfilePage() {
  const { learner, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = learner?.name || 'Test Runner2';
  const email = learner?.email || 'testrunner@example.com';
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-subtext hover:text-terracotta transition-colors no-underline mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to problems</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#F2EDE5] shadow-card">
          {/* Header & Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-[#F0EAE0] text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-[#FDE6D2] text-navy font-extrabold text-2xl flex items-center justify-center border-2 border-[#F6D2BA] shadow-sm shrink-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 self-center sm:self-auto">
                  <ShieldCheck size={14} />
                  <span>Active Practitioner</span>
                </span>
              </div>

              <p className="text-slate-subtext text-sm mt-1">{email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-subtext mt-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Joined recently</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-terracotta" />
                  <span>Low-Level System Design Track</span>
                </span>
              </div>
            </div>
          </div>

          {/* Account Information Details */}
          <div className="mt-8 space-y-4">
            <h2 className="text-base font-bold text-navy uppercase tracking-wider text-xs">
              Account Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cream-50/70 border border-[#F0EAE0]">
                <div className="flex items-center gap-2 text-xs text-slate-subtext font-medium mb-1">
                  <User size={14} className="text-slate-muted" />
                  <span>Display Name</span>
                </div>
                <div className="text-sm font-semibold text-navy">{displayName}</div>
              </div>

              <div className="p-4 rounded-xl bg-cream-50/70 border border-[#F0EAE0]">
                <div className="flex items-center gap-2 text-xs text-slate-subtext font-medium mb-1">
                  <Mail size={14} className="text-slate-muted" />
                  <span>Registered Email</span>
                </div>
                <div className="text-sm font-semibold text-navy">{email}</div>
              </div>
            </div>
          </div>

          {/* Sign Out Action */}
          <div className="mt-10 pt-6 border-t border-[#F0EAE0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-subtext">
              Signed in session managed via secure auth tokens.
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm rounded-xl border border-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
