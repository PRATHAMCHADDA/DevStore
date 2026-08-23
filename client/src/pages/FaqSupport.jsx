import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, CreditCard, RefreshCw } from 'lucide-react';

export const FaqSupport = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      icon: Truck,
      question: "How long does global express shipping take?",
      answer: "Orders are processed within 24 hours. Express global shipping typically arrives in 2 to 5 business days, depending on your region. Real-time tracking numbers are generated upon dispatch."
    },
    {
      icon: ShieldCheck,
      question: "What is DevStore's warranty policy?",
      answer: "All hardware sold on DevStore comes backed by a 1-Year Manufacturer Warranty alongside our 30-Day Hassle-Free Satisfaction Guarantee. Defective items are replaced immediately."
    },
    {
      icon: CreditCard,
      question: "Which payment methods are accepted?",
      answer: "We support major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Stripe enterprise checkout options."
    },
    {
      icon: RefreshCw,
      question: "How do I return an item or request a refund?",
      answer: "Go to your Account Dashboard -> Orders tab, select the delivered order, and click 'Request Return'. Our customer care team will approve return shipments within 24 hours."
    },
    {
      icon: HelpCircle,
      question: "Do you offer bulk corporate or team purchasing?",
      answer: "Yes! For enterprise bulk workstation orders or developer team equipment setups, reach out directly to support@devstore.com for custom volume pricing."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions & Support
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
          Everything you need to know about ordering, global shipping, hardware warranties, and developer returns.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const Icon = faq.icon;
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 bg-transparent border-0 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-white text-base">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
