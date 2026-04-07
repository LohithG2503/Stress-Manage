import { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

export default function SpotlightCard({ children, className = "", ...props }) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(212, 175, 55, 0.12), transparent 80%)`;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`glass-card group relative overflow-hidden ${className}`}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 rounded-xl"
        style={{ background }}
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}
