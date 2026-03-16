export default function StressBadge({ level }) {
  const config = {
    Low: "bg-emerald-100 text-emerald-800",
    Medium: "bg-amber-100 text-amber-800",
    High: "bg-red-100 text-red-800",
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
