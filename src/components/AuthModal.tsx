import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalTab,
    authModalRole,
    authModalTokenParam,
    login,
    register,
    activate,
    forgotPassword,
    resetPassword
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'activate' | 'forgot' | 'reset'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [demoTokenHint, setDemoTokenHint] = useState('');

  useEffect(() => {
    if (authModalOpen) {
      setActiveTab(authModalTab || 'login');
      setSelectedRole(authModalRole || 'CLIENT');
      setTokenInput(authModalTokenParam || '');
      setErrorMessage('');
      setSuccessMessage('');
      setDemoTokenHint('');

      // If Agent tab is selected, prefill agent email hint if empty
      if (authModalRole === 'AGENT' && !email) {
        setEmail('truecondodeal@gmail.com');
      }
    }
  }, [authModalOpen, authModalTab, authModalRole, authModalTokenParam]);

  if (!authModalOpen) return null;

  const handleFillDemoAgent = () => {
    setSelectedRole('AGENT');
    setActiveTab('login');
    setEmail('truecondodeal@gmail.com');
    setPassword('BlueprintVIP2026!');
    setErrorMessage('');
  };

  const handleFillDemoClient = () => {
    setSelectedRole('CLIENT');
    setActiveTab('login');
    setEmail('david.m@example.com');
    setPassword('ClientVIP2026!');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register({ email, password, fullName, phone });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tokenInput.trim()) {
      setErrorMessage('Please provide your invitation token.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await activate(tokenInput.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Activation failed.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Password reset request initiated. If an account is registered with this email, a reset token has been issued.');
      if (res.demoResetToken) {
        setDemoTokenHint(res.demoResetToken);
      }
    } else {
      setErrorMessage(res.error || 'Request could not be completed.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tokenInput.trim()) {
      setErrorMessage('Please provide your password reset token.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(tokenInput.trim(), password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Your password has been successfully updated! You can now sign in.');
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
      setTokenInput('');
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-900 relative"
      >
        {/* Top Header */}
        <div className="bg-[#0F2942] p-6 border-b border-[#1E3A8A] text-white relative">
          <button
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#C5A880]">
                Blueprint Realty Secure Portal
              </span>
              <h2 className="text-xl font-bold font-serif text-white">
                {activeTab === 'login' && (selectedRole === 'AGENT' ? 'Agent Portal Login' : 'Client VIP Sign In')}
                {activeTab === 'register' && 'Create VIP Client Account'}
                {activeTab === 'activate' && 'Activate VIP Invitation'}
                {activeTab === 'forgot' && 'Reset Your Password'}
                {activeTab === 'reset' && 'Set New Password'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-300">
            {selectedRole === 'AGENT'
              ? 'Authorized RECO Realtor Access • Managed by Amit Sawhney'
              : 'Exclusive access to builder pricing, floor plans, and worksheet reservations'}
          </p>
        </div>

        {/* Quick Demo Fill Helper Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" /> Quick Fill Demo:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="fill-agent-demo-btn"
              onClick={handleFillDemoAgent}
              className="px-2.5 py-1 rounded-lg bg-[#0F2942]/10 hover:bg-[#0F2942]/20 text-[#0F2942] font-semibold transition-colors border border-[#0F2942]/20"
            >
              Agent (Amit)
            </button>
            <button
              type="button"
              id="fill-client-demo-btn"
              onClick={handleFillDemoClient}
              className="px-2.5 py-1 rounded-lg bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#8B6B38] font-semibold transition-colors border border-[#C5A880]/40"
            >
              Client (David)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {activeTab !== 'activate' && activeTab !== 'reset' && (
          <div className="flex border-b border-stone-200 bg-white">
            <button
              type="button"
              id="tab-client-login-btn"
              onClick={() => {
                setActiveTab('login');
                setSelectedRole('CLIENT');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'login' && selectedRole === 'CLIENT'
                  ? 'border-[#0F2942] text-[#0F2942]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Client Sign In
            </button>
            <button
              type="button"
              id="tab-agent-login-btn"
              onClick={() => {
                setActiveTab('login');
                setSelectedRole('AGENT');
                setEmail('truecondodeal@gmail.com');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'login' && selectedRole === 'AGENT'
                  ? 'border-[#C5A880] text-[#0F2942] bg-[#C5A880]/5'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Agent Login
            </button>
            <button
              type="button"
              id="tab-register-btn"
              onClick={() => {
                setActiveTab('register');
                setSelectedRole('CLIENT');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-[#0F2942] text-[#0F2942]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">Success</p>
                <p>{successMessage}</p>
                {demoTokenHint && (
                  <div className="mt-2 p-2 bg-white rounded border border-emerald-300 text-xs">
                    <span className="font-semibold">Simulated Reset Token:</span>{' '}
                    <code className="bg-stone-100 px-1 py-0.5 rounded text-emerald-900">{demoTokenHint}</code>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('reset');
                        setTokenInput(demoTokenHint);
                      }}
                      className="ml-2 underline font-bold text-[#0F2942]"
                    >
                      Use to set new password →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {selectedRole === 'AGENT' ? 'Agent Email Address' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="auth-email-input"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={selectedRole === 'AGENT' ? 'truecondodeal@gmail.com' : 'yourname@example.com'}
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] focus:bg-white transition-all text-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#0F2942] hover:text-[#C5A880] font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password-input"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] focus:bg-white transition-all text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-[#0F2942] focus:ring-[#0F2942] h-4 w-4"
                  />
                  <span>Remember me on this browser</span>
                </label>

                {selectedRole === 'CLIENT' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('activate');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#C5A880] hover:text-[#a0855f] font-semibold"
                  >
                    Have an invite token?
                  </button>
                )}
              </div>

              <button
                type="submit"
                id="submit-auth-btn"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to {selectedRole === 'AGENT' ? 'Agent CRM' : 'Client Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(416) 555-0199"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-11 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>
                  Your account grants access to Platinum VIP Builder allocations represented by licensed REALTOR® Amit Sawhney (RECO #4892105).
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Client Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: INVITATION ACTIVATION FORM */}
          {activeTab === 'activate' && (
            <form onSubmit={handleActivateSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <p className="font-bold mb-0.5">Agent-Invited Client Activation</p>
                <p>
                  Amit Sawhney has invited you to access private VIP allocations. Please paste your activation token and choose a secure password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Activation Token
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="e.g. demo-activation-token-7789"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Tip: Use demo token <code className="bg-stone-100 px-1 py-0.5 rounded text-[#0F2942] font-semibold">demo-activation-token-7789</code> to test.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set your account password"
                    className="w-full pl-11 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Activate & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  ← Back to standard login
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-stone-600">
                Enter your registered email address below. We'll verify the account and issue password reset instructions.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  ← Back to login
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: RESET PASSWORD FORM */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reset Token
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New secure password"
                    className="w-full pl-11 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942] text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Security Notice */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" /> 256-Bit Encrypted Sessions
            </span>
            <span>RECO Licensed Brokerage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
