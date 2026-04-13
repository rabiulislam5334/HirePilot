'use client';

import { motion } from 'framer-motion';

export default function TrustBar() {
  const partners = [
    { name: 'BUET', type: 'Tech' },
    { name: 'NSU', type: 'Private' },
    { name: 'DU', type: 'Public' },
    { name: 'BRAC', type: 'NGO' },
    { name: 'AIUB', type: 'Tech' },
    { name: 'IUT', type: 'Eng' },
    { name: 'MIST', type: 'Eng' },
  ];

  // We double the array to create a seamless infinite loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 border-y border-slate-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
        >
          Trusted by the next generation of talent from
        </motion.p>
      </div>

      <div className="relative flex overflow-hidden group">
        {/* Continuous Scrolling Container */}
        <motion.div 
          className="flex gap-20 items-center whitespace-nowrap"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800">
                {partner.name}
              </span>
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                {partner.type}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Gradient Overlays for smooth fading edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-white to-transparent z-10" />
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Resumes Optimized', value: '10k+' },
          { label: 'Mock Interviews', value: '5k+' },
          { label: 'Success Rate', value: '92%' },
          { label: 'Active Users', value: '2k+' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <h4 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h4>
            <p className="text-xs font-bold text-emerald-600 uppercase mt-2 tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}