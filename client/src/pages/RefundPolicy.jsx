import React from 'react';
import { RotateCcw, Truck, RefreshCw, AlertCircle } from 'lucide-react';

export const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Refund & Shipping Policy
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
          Transparent guidelines covering our 30-day returns, warranty claims, and global express shipping rules.
        </p>
      </div>

      <div className="glass p-8 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-500" /> 30-Day Money-Back Guarantee
          </h2>
          <p>
            We offer a 30-day money-back guarantee on all developer gear and hardware accessories. Items must be returned in their original packaging with all included cables, manuals, and accessories intact.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" /> Global Shipping & Delivery Timelines
          </h2>
          <p>
            Orders placed before 2:00 PM EST ship the same business day. Standard shipping takes 3-7 business days, while Express Global Dispatch delivers within 2-4 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" /> Return Request Procedure
          </h2>
          <p>
            To initiate a return:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
            <li>Log into your DevStore account and navigate to <strong>My Orders</strong>.</li>
            <li>Select the delivered order and click <strong>Request Return</strong>.</li>
            <li>Attach your return reason and print the pre-paid shipping label provided by customer care.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" /> Non-Refundable Items & Customs Fees
          </h2>
          <p>
            Custom keycap sets with personalized engravings and downloadable software license keys are non-refundable once activated. International customs duties and import taxes are non-refundable.
          </p>
        </section>

      </div>
    </div>
  );
};
