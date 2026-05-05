"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const PARTNERS = [
  { name: "Google",     type: "Cloud" },
  { name: "Microsoft",  type: "Enterprise" },
  { name: "Meta",       type: "AI" },
  { name: "OpenAI",     type: "AI" },
  { name: "Vercel",     type: "Deploy" },
  { name: "AWS",        type: "Cloud" },
  { name: "Stripe",     type: "Payments" },
  { name: "GitHub",     type: "DevOps" },
  { name: "Anthropic",  type: "AI" },
  { name: "Cloudflare", type: "Edge" },
  { name: "MongoDB",    type: "Database" },
  { name: "Figma",      type: "Design" },
];

const STATS = [
  { label: "AI Model",      value: "LLaMA 3.3", isText: true },
  { label: "Response Time", value: 2,   suffix: "s",   isText: false },
  { label: "ATS Accuracy",  value: 95,  suffix: "%+",  isText: false },
  { label: "Open Source",   value: "GitHub",    isText: true },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function TrustBar() {
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="py-20 border-y border-slate-100 bg-white/50">

      {/* Label */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400"
        >
          Trusted by engineers from
        </motion.p>
      </div>

      {/* ✅ Marquee — max-width এর মধ্যে সীমাবদ্ধ */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="flex gap-12 md:gap-20 items-center whitespace-nowrap will-change-transform"
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-default flex-shrink-0"
              >
                <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">
                  {partner.name}
                </span>
                <span className="text-[9px] font-bold border border-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">
                  {partner.type}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Gradient overlays — container এর মধ্যে */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
              className="pl-6 border-l-2 border-slate-100"
            >
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">
                {stat.isText ? (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.span>
                ) : (
                  <AnimatedNumber value={stat.value as number} suffix={stat.suffix} />
                )}
              </h4>
              <p className="text-[10px] font-bold uppercase text-slate-400 mt-1 tracking-widest leading-none">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}