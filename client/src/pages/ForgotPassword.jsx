import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export const ForgotPassword = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      showToast(res.data.message || 'Reset token dispatched to your email.');
      navigate('/reset-password');
    } catch (err) {
      showToast(err.response?.data?.message || 'Email address not recorded.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-28 px-4">
      <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-808/80 space-y-6">
        
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Recover Password</h1>
          <p className="text-xs text-slate-455">Enter your email and request a reset pass token</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-[11px] font-bold text-slate-450 block">Registered Email</label>
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Sending Mail...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="flex justify-center border-t border-slate-100 dark:border-slate-900 pt-4">
          <Link to="/login" className="text-slate-450 hover:text-slate-700 dark:hover:text-white text-xs font-bold inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel and Go Back</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
