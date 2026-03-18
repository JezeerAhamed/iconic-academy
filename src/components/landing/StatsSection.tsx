'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
    { value: '2,400+', label: 'Active Students', icon: '🧑‍🎓' },
    { value: '408', label: 'Lessons & Topics', icon: '📚' },
    { value: '85%', label: 'Score A or B Grade', icon: '🏆' },
    { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

export default function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <section ref={ref} className="py-16 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {stat.value}
                            </div>
                            <div className="text-slate-400 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
