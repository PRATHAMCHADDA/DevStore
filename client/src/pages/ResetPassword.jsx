import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Disc } from 'lucide-react';
import axios from 'axios';

export const ResetPassword = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      showToast(res.data.message || 'Password changed successfully!');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Incorrect or expired reset token.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-28 px-4">
      <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-808/80 space-y-6">
        
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-xs text-slate-455">Enter your reset code token and configure a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Reset Token Code</label>
            <input 
              type="text" 
              placeholder="e.g. 983274" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <Disc className="absolute left-3.5 top-8.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-440 block">New Password</label>
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

          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-440 block">Retype Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Redefining Details...' : 'Change Password'}
          </button>
        </form>

      </div>
    </div>
  );
};
