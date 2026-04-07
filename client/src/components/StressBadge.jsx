export default function StressBadge({ level }) {
  const config = {
    Low: "bg-surface-700/50 border border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/10",
    Medium: "bg-surface-700/50 border border-[#d4af37]/20 text-[#d4af37] shadow-sm shadow-[#d4af37]/10",
    Moderate: "bg-surface-700/50 border border-[#d4af37]/20 text-[#d4af37] shadow-sm shadow-[#d4af37]/10",
    High: "bg-surface-700/50 border border-rose-600/20 text-rose-600 shadow-sm shadow-rose-600/10",
  };

  const classes = config[level] || config.Low;

  return (
    <span
      className={
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold " +
        classes
      }
    >
      {level}
    </span>
  );
}
