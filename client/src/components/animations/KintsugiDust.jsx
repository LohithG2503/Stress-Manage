import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function KintsugiDust() {
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * -30,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 0.1 }}
          animate={{
            y: [0, -120],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
          className="absolute rounded-full bg-[#d4af37]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
