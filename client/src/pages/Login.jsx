import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ShieldCheck, Github, Chrome, Check } from 'lucide-react';
import axios from 'axios';

export const Login = () => {
  const { login, showToast, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated Google/Github logins
  const [socialLoading, setSocialLoading] = useState(null);

  // OTP Verification overlay
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState('');

  const redirectPath = location.state?.from || '/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      // If user requires OTP verification (inactive account)
      if (result.message.toLowerCase().includes('otp') || result.message.toLowerCase().includes('verify')) {
        setTempUserEmail(email);
        setShowOtpModal(true);
        // Resend OTP trigger
        try {
          await axios.post('/api/auth/resend-otp', { email });
        } catch (err) {
          console.error('OTP resend trigger error:', err.message);
        }
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast('Please type a valid 6-digit confirmation code.', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp-public', {
        email: tempUserEmail,
        code: otpCode
      });
      showToast('Email verified successfully! Session authenticated.');
      setUser(res.data.user);
      setShowOtpModal(false);
      navigate(redirectPath);
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification code invalid or expired.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    setSocialLoading(platform);
    setTimeout(() => {
      setSocialLoading(null);
      showToast(`Successfully logged in with ${platform}!`);
      // Assign mock user profile
      setUser({
        id: 'usr_oauth_9832',
        name: 'OAuth Developer',
        email: `oauth_${platform}@devstore.com`,
        role: 'customer'
      });
      navigate(redirectPath);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-808/80 space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-450">Login to access your workstation and dev cart</p>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Email Address</label>
            <input 
              type="email" 
              placeholder="name@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <Mail className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-1 relative">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[11px] font-bold text-slate-450 block">Password</label>
              <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <Lock className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-4 font-semibold">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="absolute bg-white dark:bg-slate-950 px-3 text-[10px] text-slate-400 uppercase tracking-widest">Or login with</span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('Google')}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent cursor-pointer disabled:opacity-50"
          >
            {socialLoading === 'Google' ? (
              <span className="w-4 h-4 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></span>
            ) : (
              <Chrome className="h-4 w-4 text-red-500" />
            )}
            <span>Google</span>
          </button>
          
          <button 
            onClick={() => handleSocialLogin('GitHub')}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent cursor-pointer disabled:opacity-50"
          >
            {socialLoading === 'GitHub' ? (
              <span className="w-4 h-4 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></span>
            ) : (
              <Github className="h-4 w-4 text-slate-900 dark:text-white" />
            )}
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 pt-2">
          New to the DevStore? <Link to="/register" className="text-blue-500 hover:underline font-bold">Sign Up</Link>
        </p>

      </div>

      {/* === OTP VERIFY MODAL OVERLAY === */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-sm w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 bg-white dark:bg-slate-950">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-blue-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your Email</h2>
              <p className="text-xs text-slate-440">We sent a 6-digit confirmation code to and synced with <strong>{tempUserEmail}</strong>.</p>
            </div>

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                placeholder="6 Digit OTP" 
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
