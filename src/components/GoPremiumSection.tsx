import React from 'react';
import { Sparkles, Check, Crown, Send, ShieldCheck, Zap } from 'lucide-react';

interface GoPremiumSectionProps {
  onContactAdmin?: () => void;
}

export const GoPremiumSection: React.FC<GoPremiumSectionProps> = () => {
  const plans = [
    { duration: '1 month', price: '৳60', popular: false },
    { duration: '2 months', price: '৳100', popular: true },
    { duration: '6 months', price: '৳300', popular: false },
  ];

  const features = [
    'No ads — on any video, even ones the admin has put an ad on',
    'Premium badge next to your name in the header',
    'Your exact expiry date, always visible in your account',
    'Keep uploading and watching with no ads anywhere on the site',
  ];

  return (
    <section id="premium-section" className="w-full my-12">
      <div className="relative rounded-3xl bg-[#111317] border border-amber-500/20 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
        {/* Amber & gold ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left info column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MOVIE PANEL BD PREMIUM</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Do not want to see ads? <br />
              <span className="text-amber-400">Go Premium.</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
              Premium members never see an ad — not on their own videos, not on anyone else&apos;s.
              From <strong className="text-amber-400 font-bold">৳60</strong> a month, activated by the admin after you contact Admin support.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-neutral-300">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="https://t.me/danials638"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Contact Admin support</span>
              </a>
              <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Instant telegram activation
              </span>
            </div>
          </div>

          {/* Right plans column */}
          <div className="lg:col-span-5 space-y-4">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-5 rounded-2xl border transition-all flex items-center justify-between ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-950/30 to-neutral-900 border-amber-500/40 shadow-lg'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.popular
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      {plan.duration}
                      {plan.popular && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded-full uppercase">
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-400">Unlimited ad-free streaming</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-white">{plan.price}</span>
                  <span className="text-[10px] text-neutral-400 block">BDT</span>
                </div>
              </div>
            ))}

            <p className="text-xs text-neutral-400 text-center pt-2 leading-relaxed">
              Payment is arranged manually with the admin — no card details are ever entered on this site.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
