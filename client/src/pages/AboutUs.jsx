import React from 'react';
import { Cpu, ShieldCheck, Truck, Headphones, Terminal, Sparkles } from 'lucide-react';

export const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Engineered for Developers
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Pioneering Enterprise Hardware for Modern Workstations
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          DevStore was founded with a single mission: to equip software engineers, creators, and tech enthusiasts with high-performance laptops, custom mechanical keyboards, high-fidelity audio, and precision developer gear.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Curated Engineering Specs</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Every product in our catalog undergoes rigorous benchmark testing to ensure maximum throughput for compilation, virtualization, and heavy daily workloads.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Global Express Fulfillment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We partner with premier international logistics providers to deliver your critical hardware setups swiftly and securely anywhere on the globe.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Full Hardware Guarantee</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Enjoy peace of mind with our 30-day hassle-free return window, transparent warranty backing, and dedicated technical assistance.
          </p>
        </div>
      </div>

      {/* Developer Contact Banner */}
      <div className="glass p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2">
            <Terminal className="w-6 h-6 text-blue-400" /> Have Questions or Custom Enterprise Requirements?
          </h3>
          <p className="text-sm text-slate-400">
            Our technical support team is standing by to help build your team's ideal developer environment.
          </p>
        </div>
        <a
          href="mailto:support@devstore.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
        >
          <Headphones className="w-4 h-4" /> Contact Engineering Support
        </a>
      </div>

    </div>
  );
};
