import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Github, 
  Chrome 
} from 'lucide-react';
import axios from 'axios';

export const AuthCard = ({ initialMode = 'signin' }) => {
  const { login, register, showToast, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  
  // Sync mode with route if changed externally
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up extra fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Simulated reCAPTCHA v2
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // OTP Verification modal overlay
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState('');

  const redirectPath = location.state?.from || '/dashboard';

  // --- Password Strength Calculation ---
  const getPasswordStrength = (pwd) => {
    if (!pwd) {
      return {
        level: '',
        score: 0,
        percent: 0,
        bgColor: 'bg-slate-300 dark:bg-slate-700',
        textColor: 'text-slate-400',
        hasLength: false,
        hasMixCases: false,
        hasNumbers: false,
        hasSymbols: false
      };
    }

    const hasLength = pwd.length >= 8;
    const hasMixCases = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    let score = 0;
    if (hasLength) score++;
    if (hasMixCases) score++;
    if (hasNumbers) score++;
    if (hasSymbols) score++;

    if (score <= 2) {
      return {
        level: 'WEAK',
        score,
        percent: 33,
        bgColor: 'bg-red-500',
        textColor: 'text-red-500',
        hasLength,
        hasMixCases,
        hasNumbers,
        hasSymbols
      };
    } else if (score === 3) {
      return {
        level: 'MEDIUM',
        score,
        percent: 66,
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-500',
        hasLength,
        hasMixCases,
        hasNumbers,
        hasSymbols
      };
    } else {
      return {
        level: 'STRONG',
        score,
        percent: 100,
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        hasLength,
        hasMixCases,
        hasNumbers,
        hasSymbols
      };
    }
  };

  const strength = getPasswordStrength(password);

  const triggerCaptchaVerification = () => {
    if (captchaVerified) {
      setCaptchaVerified(false);
      return;
    }
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaVerified(true);
      showToast('reCAPTCHA Verification Passed!');
    }, 800);
  };

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'signin') {
      if (!email || !password) return;
      setLoading(true);
      const result = await login(email, password);
      setLoading(false);

      if (result.success) {
        navigate(redirectPath);
      } else {
        if (result.message.toLowerCase().includes('otp') || result.message.toLowerCase().includes('verify')) {
          setTempUserEmail(email);
          setShowOtpModal(true);
          try {
            await axios.post('/api/auth/resend-otp', { email });
          } catch (err) {
            console.error('OTP resend trigger error:', err.message);
          }
        } else {
          showToast(result.message, 'error');
        }
      }
    } else {
      // Sign Up Mode
      if (!email || !password) return;

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      if (!captchaVerified) {
        showToast('Please confirm the reCAPTCHA verification challenge.', 'error');
        return;
      }

      setLoading(true);
      const result = await register(name, username, email, phone, password, confirmPassword);
      setLoading(false);

      if (result.success) {
        // Do NOT automatically log in or redirect to dashboard/profile.
        // Switch tab to sign in so user enters credentials manually.
        handleSwitchMode('signin');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast('Please enter a valid OTP code.', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp-public', {
        email: tempUserEmail || email,
        code: otpCode
      });
      showToast('Account setup verified! Welcome to DevStore.');
      setUser(res.data.user);
      setShowOtpModal(false);
      navigate(redirectPath);
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification code invalid.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    showToast(`OAuth ${platform} authentication requires backend provider setup. Please sign in with email & password.`, 'error');
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'signin') {
      navigate('/login', { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        
        {/* Header Title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin' 
              ? 'Login to access your workstation and dev cart' 
              : 'Join DevStore to track setups and deploy orders'}
          </p>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 border-0 cursor-pointer ${
              mode === 'signin' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 border-0 cursor-pointer ${
              mode === 'signup' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Fields: Full Name & Username */}
          {mode === 'signup' && (
            <>
              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-400 block">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={mode === 'signup'}
                  />
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[11px] font-bold text-slate-400 block">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={mode === 'signup'}
                  />
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </>
          )}

          {/* Email Field (Strict Placeholder requirement: "Enter your email") */}
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-400 block">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Sign Up Phone Number Field */}
          {mode === 'signup' && (
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-slate-400 block">Phone Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Password Field (Strict Placeholder requirement: "Enter your password" & Eye toggle) */}
          <div className="space-y-1 relative">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[11px] font-bold text-slate-400 block">Password</label>
              {mode === 'signin' && (
                <Link to="/forgot-password" className="text-blue-500 hover:underline text-[11px]">Forgot?</Link>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Dynamic Strength Bar */}
            {password && (
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Strength</span>
                  <span className={strength.textColor}>{strength.level}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.bgColor}`}
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Requirement Checklist (Sign-up Mode) */}
            {mode === 'signup' && (
              <div className="space-y-1.5 pt-2 text-[11px] bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  {strength.hasMixCases ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-red-500 font-bold" />
                  )}
                  <span className={strength.hasMixCases ? "text-emerald-500 font-medium" : "text-slate-400"}>
                    Mix of letter cases
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {strength.hasSymbols ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-red-500 font-bold" />
                  )}
                  <span className={strength.hasSymbols ? "text-emerald-500 font-medium" : "text-slate-400"}>
                    Unique symbols
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {strength.hasNumbers ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-red-500 font-bold" />
                  )}
                  <span className={strength.hasNumbers ? "text-emerald-500 font-medium" : "text-slate-400"}>
                    Numbers
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up Mode) */}
          {mode === 'signup' && (
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-slate-400 block">Verify Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Enter your password again" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required={mode === 'signup'}
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-0.5"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* reCAPTCHA Verification Box (Sign Up Mode) */}
          {mode === 'signup' && (
            <div className="flex items-center justify-between p-3.5 my-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button 
                type="button"
                onClick={triggerCaptchaVerification}
                className="flex items-center gap-3 border-0 bg-transparent text-left cursor-pointer"
              >
                {captchaLoading ? (
                  <span className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                ) : captchaVerified ? (
                  <CheckSquare className="h-5.5 w-5.5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                ) : (
                  <Square className="h-5.5 w-5.5 text-slate-400" />
                )}
                <span className="text-xs text-slate-700 dark:text-slate-300">I am not a robot</span>
              </button>
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
                <span className="text-[8px] text-slate-400">reCAPTCHA</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading 
              ? (mode === 'signin' ? 'Authenticating...' : 'Creating Account...') 
              : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {/* OAuth Buttons (Sign In Mode) */}
        {mode === 'signin' && (
          <>
            <div className="relative flex items-center justify-center my-4 font-semibold">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
              <span className="absolute bg-white dark:bg-slate-950 px-3 text-[10px] text-slate-400 uppercase tracking-widest">
                Or login with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent cursor-pointer disabled:opacity-50 transition-colors"
              >
                {socialLoading === 'Google' ? (
                  <span className="w-4 h-4 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></span>
                ) : (
                  <Chrome className="h-4 w-4 text-red-500" />
                )}
                <span>Google</span>
              </button>
              
              <button 
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent cursor-pointer disabled:opacity-50 transition-colors"
              >
                {socialLoading === 'GitHub' ? (
                  <span className="w-4 h-4 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></span>
                ) : (
                  <Github className="h-4 w-4 text-slate-900 dark:text-white" />
                )}
                <span>GitHub</span>
              </button>
            </div>
          </>
        )}

        {/* Dynamic Bottom Link Toggling */}
        <div className="pt-2 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-400">
              New to DevStore?{' '}
              <button 
                type="button" 
                onClick={() => handleSwitchMode('signup')}
                className="text-blue-500 hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => handleSwitchMode('signin')}
                className="text-blue-500 hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>

      {/* === OTP VERIFY MODAL OVERLAY === */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-sm w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 bg-white dark:bg-slate-950">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-blue-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your Email</h2>
              <p className="text-xs text-slate-400">
                We sent a 6-digit confirmation code to <strong>{tempUserEmail || email}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] font-extrabold focus:outline-none dark:text-white"
                required
              />

              <button 
                type="submit" 
                disabled={otpLoading}
                className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify Session'}
              </button>
            </form>

            <button 
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="w-full text-center text-xs text-slate-400 hover:underline border-0 bg-transparent cursor-pointer font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
