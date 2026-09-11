import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogoMark } from './Logo';
import {
  Home,
  BarChart2,
  TrendingUp,
  User,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const { learner, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  // Extract initials for the avatar circle (e.g. "Test Runner2" -> "TR")
  const getInitials = (name?: string) => {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = learner?.name || 'Test Runner2';
  const initials = getInitials(displayName);

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/problems');
  const isAttemptsActive = location.pathname === '/my-attempts' || location.pathname === '/attempts';
  const isProgressActive = location.pathname === '/progress';
  const isProfileActive = location.pathname === '/profile';

  return (
    <nav className="bg-white border-b border-[#F1EBE4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group select-none">
          <LogoMark size={32} />
          <span className="font-bold text-navy text-lg tracking-tight group-hover:text-terracotta transition-colors">
            LLD Practice
          </span>
        </Link>

        {/* Center-left: Navigation links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-3">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all no-underline ${
              isHomeActive
                ? 'bg-[#FDF0E7] text-terracotta font-semibold'
                : 'text-slate-subtext hover:text-navy hover:bg-cream-100'
            }`}
          >
            <Home size={16} strokeWidth={2.2} />
            <span>Home</span>
          </Link>

          <Link
            to="/my-attempts"
            className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all no-underline ${
              isAttemptsActive
                ? 'bg-[#FDF0E7] text-terracotta font-semibold'
                : 'text-slate-subtext hover:text-navy hover:bg-cream-100'
            }`}
          >
            <BarChart2 size={16} strokeWidth={2} />
            <span>My Attempts</span>
          </Link>

          <Link
            to="/progress"
            className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all no-underline ${
              isProgressActive
                ? 'bg-[#FDF0E7] text-terracotta font-semibold'
                : 'text-slate-subtext hover:text-navy hover:bg-cream-100'
            }`}
          >
            <TrendingUp size={16} strokeWidth={2} />
            <span>Progress</span>
          </Link>

          <Link
            to="/profile"
            className={`px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all no-underline ${
              isProfileActive
                ? 'bg-[#FDF0E7] text-terracotta font-semibold'
                : 'text-slate-subtext hover:text-navy hover:bg-cream-100'
            }`}
          >
            <User size={16} strokeWidth={2} />
            <span>Profile</span>
          </Link>
        </div>

        {/* Right: Avatar & User dropdown */}
        <div className="flex items-center gap-3">
          {/* User profile dropdown container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-cream-100 transition-colors focus:outline-none cursor-pointer"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#FDE6D2] text-navy font-bold text-xs flex items-center justify-center tracking-tight border border-[#F6D2BA]">
                {initials}
              </div>
              <span className="hidden sm:inline font-semibold text-navy text-sm">
                {displayName}
              </span>
              <ChevronDown size={14} className="text-slate-muted" strokeWidth={2.5} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(30,41,59,0.1),0_4px_10px_-2px_rgba(30,41,59,0.04)] border border-[#F1EBE4] py-1.5 z-50">
                <div className="px-4 py-2 border-b border-[#F1EBE4]">
                  <div className="text-xs text-slate-subtext">Signed in as</div>
                  <div className="text-sm font-semibold text-navy truncate">{learner?.email || displayName}</div>
                </div>

                <div className="py-1 border-b border-[#F1EBE4]">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-cream-100 flex items-center gap-2 transition-colors no-underline"
                  >
                    <User size={15} className="text-slate-muted" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-attempts"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-cream-100 flex items-center gap-2 transition-colors no-underline"
                  >
                    <BarChart2 size={15} className="text-slate-muted" />
                    <span>My Attempts</span>
                  </Link>
                  <Link
                    to="/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-cream-100 flex items-center gap-2 transition-colors no-underline"
                  >
                    <TrendingUp size={15} className="text-slate-muted" />
                    <span>Progress Dashboard</span>
                  </Link>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

}
