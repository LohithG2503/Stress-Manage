import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

export default function LogMetrics() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    screenTime: "",
    breakTime: "",
    meetingTime: "",
    afterHoursTime: "",
    date: today,
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fields = ["screenTime", "breakTime", "meetingTime", "afterHoursTime"];
    for (const field of fields) {
      const val = parseFloat(form[field]);
      if (isNaN(val) || val < 0 || val > 24) {
        setError("All time fields must be between 0 and 24 hours.");
        return;
      }
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/metrics", {
        screenTime: parseFloat(form.screenTime),
        breakTime: parseFloat(form.breakTime),
        meetingTime: parseFloat(form.meetingTime),
        afterHoursTime: parseFloat(form.afterHoursTime),
        date: form.date,
        notes: form.notes,
      });

      setSuccess("Metrics logged successfully.");
      setForm({
        screenTime: "",
        breakTime: "",
        meetingTime: "",
        afterHoursTime: "",
        date: today,
        notes: "",
      });

      setTimeout(() => {
        navigate("/employee/dashboard");
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to save metrics. Try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const timeFields = [
    { name: "screenTime", label: "Screen Time (hours)", placeholder: "e.g. 8" },
    { name: "breakTime", label: "Break Time (hours)", placeholder: "e.g. 1.5" },
    {
      name: "meetingTime",
      label: "Meeting Time (hours)",
      placeholder: "e.g. 2",
    },
    { name: "afterHoursTime", label: "After-Hours Work (hours)", placeholder: "e.g. 7" },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
          Log Daily Metrics
        </h2>
        <p className="text-surface-400 text-sm mt-1 font-medium">
          Record your daily work and wellness data
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="glass-card shadow-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={today}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-white/30 transition-all [&::-webkit-calendar-picker-indicator]:filter-invert"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timeFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    step="0.1"
                    min="0"
                    max="24"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-white/30 transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about your day"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-white/30 transition-all resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider mt-4"
            >
              {submitting ? "Saving..." : "Submit Metrics"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
