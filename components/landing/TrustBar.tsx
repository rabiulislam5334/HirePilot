"use client";

import { motion } from "framer-motion";

const PARTNERS = [
  { name: "BUET", type: "Tech" },
  { name: "NSU", type: "Private" },
  { name: "DU", type: "Public" },
  { name: "BRAC", type: "NGO" },
  { name: "AIUB", type: "Tech" },
  { name: "IUT", type: "Eng" },
  { name: "MIST", type: "Eng" },
];

const STATS = [
  { label: "Optimized CVs", value: "10k+" },
  { label: "Mock Sessions", value: "5k+" },
  { label: "Success Rate", value: "92%" },
  { label: "Active Users", value: "2k+" },
];

export default function TrustBar() {
  // ৩ বার ডুপ্লিকেট করা হয়েছে বড় স্ক্রিনে লুপের গ্যাপ এড়ানোর জন্য
  const duplicatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="py-20 border-y border-slate-100 bg-white/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400"
        >
          Empowering future leaders from
        </motion.p>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="flex gap-12 md:gap-24 items-center whitespace-nowrap will-change-transform"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            duration: 30, // স্পিড একটু কমানো হয়েছে যাতে পড়া যায়
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-default"
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

        {/* Gradient Overlays - প্রশস্ত করা হয়েছে যাতে ট্রানজিশন স্মুথ লাগে */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="pl-6 border-l border-slate-100"
            >
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
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