import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import api from "../services/api";

export default function EmployeeHistory() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/metrics/mine");
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    setDeleting(id);
    try {
      await api.delete("/metrics/" + id);
      setMetrics(metrics.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err.message);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">My History</h2>
        <p className="text-surface-400 text-sm mt-1 font-medium">
          All your logged wellness entries
        </p>
      </motion.div>

      {loading ? (
        <p className="text-white/60 animate-pulse text-center py-10">Loading...</p>
      ) : metrics.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
        >
          <p className="text-white/60 text-lg">
            You have no logged entries yet.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 bg-black/20">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-3 py-3">Screen</th>
                  <th className="px-3 py-3">Break</th>
                  <th className="px-3 py-3">Meeting</th>
                  <th className="px-3 py-3">Work</th>
                  <th className="px-3 py-3">A/H</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.map((m, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (idx * 0.03) }}
                    key={m._id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white/70 text-xs whitespace-nowrap lg:whitespace-normal font-medium">
                      {new Date(m.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric', year: '2-digit'})}
                    </td>
                    <td className="px-3 py-3 text-white/90">{m.screenTime}h</td>
                    <td className="px-3 py-3 text-white/90">{m.breakTime}h</td>
                    <td className="px-3 py-3 text-white/90">{m.meetingTime}h</td>
                    <td className="px-3 py-3 text-white/90">{m.workTime}h</td>
                    <td className="px-3 py-3 text-white/90">{m.afterHoursTime}h</td>
                    <td className="px-3 py-3 font-bold text-white text-sm">{m.stressScore}</td>
                    <td className="px-4 py-3">
                      <StressBadge level={m.stressLevel} />
                    </td>
                    <td className="px-4 py-3 max-w-[150px] truncate text-white/60 text-xs">
                      {m.notes || "--"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(m._id)}
                        disabled={deleting === m._id}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold disabled:opacity-50 transition-colors uppercase tracking-wider"
                      >
                        {deleting === m._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
