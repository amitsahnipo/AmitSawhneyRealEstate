import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, AuthUser } from '../types';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../utils/validation';

interface AuthModalProps {
  onAccountCreated?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAccountCreated }) => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalTab,
    authModalRole,
    authModalTokenParam,
    authModalCustomTitle,
    authModalCustomMessage,
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

  // Validation states
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    phone?: string;
    tokenInput?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
    fullName?: boolean;
    phone?: boolean;
    tokenInput?: boolean;
  }>({});

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
      setErrors({});
      setTouched({});

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
    setErrors({});
    setTouched({});
  };

  const handleFillDemoClient = () => {
    setSelectedRole('CLIENT');
    setActiveTab('login');
    setEmail('david.m@example.com');
    setPassword('ClientVIP2026!');
    setErrorMessage('');
    setErrors({});
    setTouched({});
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errorMessage) setErrorMessage('');
    if (touched.email || val.includes('@')) {
      const res = validateEmail(val, true);
      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (errorMessage) setErrorMessage('');
    if (touched.fullName || val.length > 1) {
      const res = validateName(val, 'Full name', true);
      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setPhone(formatted);
    if (errorMessage) setErrorMessage('');
    if (touched.phone || val.length > 4) {
      const res = validatePhone(formatted, false);
      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errorMessage) setErrorMessage('');
    if (touched.password || val.length > 0) {
      const err = val.length < 8 ? 'Password must be at least 8 characters.' : undefined;
      setErrors(prev => ({ ...prev, password: err }));
    }
    if (confirmPassword && (touched.confirmPassword || confirmPassword.length > 0)) {
      setErrors(prev => ({ ...prev, confirmPassword: val !== confirmPassword ? 'Passwords do not match.' : undefined }));
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (errorMessage) setErrorMessage('');
    if (touched.confirmPassword || val.length > 0) {
      setErrors(prev => ({ ...prev, confirmPassword: val !== password ? 'Passwords do not match.' : undefined }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, email: true, password: true }));
    setErrorMessage('');

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      setErrors(prev => ({ ...prev, email: emailCheck.error }));
      setErrorMessage(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required.' }));
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });
    setErrorMessage('');

    const nameCheck = validateName(fullName, 'Full name', true);
    const emailCheck = validateEmail(email, true);
    const phoneCheck = validatePhone(phone, false);
    const passCheck = password.length >= 8 ? { isValid: true } : { isValid: false, error: 'Password must be at least 8 characters.' };
    const matchCheck = password === confirmPassword ? { isValid: true } : { isValid: false, error: 'Passwords do not match.' };

    const newErrors = {
      fullName: nameCheck.isValid ? undefined : nameCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
      password: passCheck.isValid ? undefined : passCheck.error,
      confirmPassword: matchCheck.isValid ? undefined : matchCheck.error,
    };
    setErrors(newErrors);

    if (!nameCheck.isValid || !emailCheck.isValid || !phoneCheck.isValid || !passCheck.isValid || !matchCheck.isValid) {
      setErrorMessage(nameCheck.error || emailCheck.error || phoneCheck.error || passCheck.error || matchCheck.error || 'Please correct errors in form.');
      return;
    }

    setLoading(true);
    const res = await register({ email, password, fullName, phone });
    setLoading(false);

    if (res.success && res.user) {
      if (onAccountCreated) {
        onAccountCreated(res.user);
      }
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, tokenInput: true, password: true, confirmPassword: true }));
    setErrorMessage('');

    if (!tokenInput.trim()) {
      setErrors(prev => ({ ...prev, tokenInput: 'Invitation token is required.' }));
      setErrorMessage('Please provide your invitation token.');
      return;
    }

    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters.' }));
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await activate(tokenInput.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      if (onAccountCreated) {
        onAccountCreated(res.user);
      }
    } else {
      setErrorMessage(res.error || 'Activation failed.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, email: true }));
    setErrorMessage('');
    setSuccessMessage('');

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      setErrors(prev => ({ ...prev, email: emailCheck.error }));
      setErrorMessage(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

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
    setTouched(prev => ({ ...prev, tokenInput: true, password: true, confirmPassword: true }));
    setErrorMessage('');

    if (!tokenInput.trim()) {
      setErrors(prev => ({ ...prev, tokenInput: 'Reset token is required.' }));
      setErrorMessage('Please provide your password reset token.');
      return;
    }

    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'New password must be at least 8 characters.' }));
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
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
      setErrors({});
      setTouched({});
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

        {/* Custom Context Callout (e.g. Registered Client View Gating) */}
        {authModalCustomMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-950">
                {authModalCustomTitle || 'Registered Client Access Required'}
              </p>
              <p className="text-amber-900 mt-0.5 leading-relaxed">
                {authModalCustomMessage}
              </p>
            </div>
          </div>
        )}

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
                  <Mail className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.email ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="email"
                    id="auth-email-input"
                    required
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const res = validateEmail(email, true);
                      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                    }}
                    placeholder={selectedRole === 'AGENT' ? 'truecondodeal@gmail.com' : 'yourname@example.com'}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:bg-white'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
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
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.password ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password-input"
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, password: true }));
                      if (!password) {
                        setErrors(prev => ({ ...prev, password: 'Password is required.' }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
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
                className="w-full mt-2 py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                  <User className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.fullName ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => handleFullNameChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, fullName: true }));
                      const res = validateName(fullName, 'Full name', true);
                      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
                    }}
                    placeholder="Jane Doe"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.email ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const res = validateEmail(email, true);
                      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                    }}
                    placeholder="jane.doe@example.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.phone ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, phone: true }));
                      const res = validatePhone(phone, false);
                      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
                    }}
                    placeholder="(416) 555-0199"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.phone
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.password ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, password: true }));
                      const err = password.length < 8 ? 'Password must be at least 8 characters.' : undefined;
                      setErrors(prev => ({ ...prev, password: err }));
                    }}
                    placeholder="Create a secure password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.confirmPassword ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => handleConfirmPasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, confirmPassword: true }));
                      const err = confirmPassword !== password ? 'Passwords do not match.' : undefined;
                      setErrors(prev => ({ ...prev, confirmPassword: err }));
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
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
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                  <KeyRound className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.tokenInput ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={e => {
                      setTokenInput(e.target.value);
                      if (errors.tokenInput) setErrors(prev => ({ ...prev, tokenInput: undefined }));
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, tokenInput: true }));
                      if (!tokenInput.trim()) {
                        setErrors(prev => ({ ...prev, tokenInput: 'Invitation token is required.' }));
                      }
                    }}
                    placeholder="e.g. demo-activation-token-7789"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 font-mono border ${
                      errors.tokenInput
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.tokenInput && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.tokenInput}</span>
                  </p>
                )}
                <p className="text-[11px] text-stone-500 mt-1">
                  Tip: Use demo token <code className="bg-stone-100 px-1 py-0.5 rounded text-[#0F2942] font-semibold">demo-activation-token-7789</code> to test.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.password ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, password: true }));
                      const err = password.length < 8 ? 'Password must be at least 8 characters.' : undefined;
                      setErrors(prev => ({ ...prev, password: err }));
                    }}
                    placeholder="Set your account password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.confirmPassword ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => handleConfirmPasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, confirmPassword: true }));
                      const err = confirmPassword !== password ? 'Passwords do not match.' : undefined;
                      setErrors(prev => ({ ...prev, confirmPassword: err }));
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                  <Mail className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.email ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const res = validateEmail(email, true);
                      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                    }}
                    placeholder="yourname@example.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                  <KeyRound className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.tokenInput ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={e => {
                      setTokenInput(e.target.value);
                      if (errors.tokenInput) setErrors(prev => ({ ...prev, tokenInput: undefined }));
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, tokenInput: true }));
                      if (!tokenInput.trim()) {
                        setErrors(prev => ({ ...prev, tokenInput: 'Reset token is required.' }));
                      }
                    }}
                    placeholder="Enter reset token"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 font-mono border ${
                      errors.tokenInput
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.tokenInput && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.tokenInput}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.password ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, password: true }));
                      const err = password.length < 8 ? 'New password must be at least 8 characters.' : undefined;
                      setErrors(prev => ({ ...prev, password: err }));
                    }}
                    placeholder="New secure password"
                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors.confirmPassword ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => handleConfirmPasswordChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, confirmPassword: true }));
                      const err = confirmPassword !== password ? 'Passwords do not match.' : undefined;
                      setErrors(prev => ({ ...prev, confirmPassword: err }));
                    }}
                    placeholder="Confirm new password"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all text-stone-900 border ${
                      errors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                        : 'bg-stone-50 border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
