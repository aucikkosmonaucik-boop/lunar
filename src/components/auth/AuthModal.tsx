import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to backend
    alert(`Logged in as: ${loginEmail}`);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      alert('Passwords do not match.');
      return;
    }
    // TODO: connect to backend
    alert(`Account created for: ${regEmail}`);
    onClose();
  };

  const inputClass =
    'w-full border border-gray-300 bg-white text-[#1a1a1a] text-[14px] tracking-wide px-4 py-3 outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-gray-400 font-light';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-[101] w-full sm:w-[420px] bg-[#f5eeeb] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-10 pb-6 border-b border-gray-200">
          <div className="flex flex-col">
            <span className="font-serif text-[36px] tracking-widest text-[#1a1a1a] uppercase leading-none">Lunar</span>
            <span className="text-[11px] tracking-[0.5em] text-[#1a1a1a] mt-1 font-light">2026</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#1a1a1a] hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mx-8 mt-8">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-3 text-[12px] uppercase tracking-[0.25em] font-medium transition-colors ${
                tab === t
                  ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a] -mb-[2px]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.3em] py-4 hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                Sign In
              </button>

              <p className="text-center text-[12px] text-gray-400 mt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-[#1a1a1a] underline underline-offset-2 hover:text-gray-600 transition-colors"
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="min. 6 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-[#1a1a1a] text-white text-[12px] uppercase tracking-[0.3em] py-4 hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                Create Account
              </button>

              <p className="text-center text-[12px] text-gray-400 mt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#1a1a1a] underline underline-offset-2 hover:text-gray-600 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="px-8 pb-8 text-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
          Your data is secure
        </p>
      </div>
    </>
  );
};

export default AuthModal;
