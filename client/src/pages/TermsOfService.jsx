import React from 'react';
import { FileText, Shield, UserCheck, Lock } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
          Standard developer e-commerce guidelines and operational terms governing your use of DevStore.
        </p>
      </div>

      <div className="glass p-8 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> 1. Acceptance of Terms
          </h2>
          <p>
            By accessing or ordering hardware from DevStore ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our e-commerce platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" /> 2. Account Registration & Security
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You accept full responsibility for all activities occurring under your authenticated user account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" /> 3. Pricing, Availability & Orders
          </h2>
          <p>
            All prices are listed in USD unless specified otherwise. We reserve the right to modify prices or adjust hardware stock availability at any time without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" /> 4. Limitation of Liability
          </h2>
          <p>
            DevStore shall not be held liable for indirect, incidental, or consequential damages resulting from improper hardware configuration, unauthorized system alterations, or third-party logistics delays.
          </p>
        </section>

      </div>
    </div>
  );
};
