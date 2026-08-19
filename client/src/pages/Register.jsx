import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Lock, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';

export const Register = () => {
  const { register, showToast, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simulated reCAPTCHA v2
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  // OTP Verification variables
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const redirectPath = location.state?.from || '/dashboard';

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
    }, 1000);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

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
      // Prompt user to input verification code instantly
      setShowOtpModal(true);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) return;

    setOtpLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp-public', {
        email,
        code: otpCode
      });
      showToast('Account setup verified! Welcome to DevStore.');
      
      // Auto logging in user
      setUser(res.data.user);
      setShowOtpModal(false);
      navigate(redirectPath);
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification code invalid.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-808/80 space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-xs text-slate-450">Join DevStore to track setups and deploy orders</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Full Name</label>
            <input 
              type="text" 
              placeholder="Elon Musk" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <User className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Username</label>
            <input 
              type="text" 
              placeholder="elondesign" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <User className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Email Address</label>
            <input 
              type="email" 
              placeholder="elon@mars.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <Mail className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+1234567890" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <Phone className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-slate-450 block">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Lock className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-slate-450 block">Verify Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Lock className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* === SIMULATED GOOGLE RECAPTCHA BOX === */}
          <div className="flex items-center justify-between p-4 my-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button 
              type="button"
              onClick={triggerCaptchaVerification}
              className="flex items-center gap-3 border-0 bg-transparent text-left cursor-pointer"
            >
              {captchaLoading ? (
                <span className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
              ) : captchaVerified ? (
                <CheckSquare className="h-5.5 w-5.5 text-green-500 fill-green-50" />
              ) : (
                <Square className="h-5.5 w-5.5 text-slate-400" />
              )}
              <span className="text-xs text-slate-700 dark:text-slate-350">I am not a robot</span>
            </button>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              <span className="text-[8px] text-slate-400">reCAPTCHA</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting Form...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered? <Link to="/login" className="text-blue-500 hover:underline font-bold">Sign In</Link>
        </p>

      </div>

      {/* === OTP CONFIRMATION MODAL OVERLAY === */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-sm w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 bg-white dark:bg-slate-950 animate-bounce">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-blue-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your SignUp</h2>
              <p className="text-xs text-slate-440">We sent a 6-digit confirmation code code to <strong>{email}</strong>.</p>
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
                {otpLoading ? 'Registering...' : 'Verify Session'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
