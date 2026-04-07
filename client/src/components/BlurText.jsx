import { motion } from "framer-motion";

export default function BlurText({ text, className = "" }) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, filter: "blur(8px)", y: 4 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.6,
      },
    },
  };

  return (
    <motion.p
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={item}
          style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
        >
          {word + " "}
        </motion.span>
      ))}
    </motion.p>
  );
}
