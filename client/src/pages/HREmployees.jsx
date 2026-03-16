import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import api from "../services/api";

export default function HREmployees() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  const fetchAllMetrics = async () => {
    try {
      const res = await api.get("/metrics/all");
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch all metrics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = metrics.filter((m) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const name = m.employeeId?.name?.toLowerCase() || "";
    const email = m.employeeId?.email?.toLowerCase() || "";
    const dept = m.employeeId?.department?.toLowerCase() || "";
    return name.includes(query) || email.includes(query) || dept.includes(query);
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Department",
      "Date",
      "Screen Time",
      "Break Time",
      "Meeting Time",
      "Work Time",
      "After-Hours Work",
      "Stress Score",
      "Stress Level",
    ];

    const rows = filtered.map((m) => [
      m.employeeId?.name || "",
      m.employeeId?.email || "",
      m.employeeId?.department || "",
      new Date(m.date).toLocaleDateString(),
      m.screenTime,
      m.breakTime,
      m.meetingTime,
      m.workTime,
      m.afterHoursTime,
      m.stressScore,
      m.stressLevel,
    ]);

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const strVal = String(str);
      if (strVal.includes('"') || strVal.includes(',') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return `"${strVal}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((r) => r.map(escapeCSV).join(","))
    ].join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employee_metrics_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      // Fallback
      window.open("data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
            All Employee Metrics
          </h2>
          <p className="text-surface-400 text-sm mt-1 font-medium">
            {filtered.length} entries found across your organization
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search name, email, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 text-white py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand-500 w-full sm:w-64 placeholder-white/40 transition-all"
          />
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-white/60 text-center py-10 animate-pulse">Loading...</p>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
        >
          <p className="text-white/60 text-lg">No metrics found.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/10 bg-black/20">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-3 py-3 lg:px-4">Date</th>
                  <th className="px-3 py-3">Screen</th>
                  <th className="px-3 py-3">Break</th>
                  <th className="px-3 py-3">Meeting</th>
                  <th className="px-3 py-3">Work</th>
                  <th className="px-3 py-3">A/H</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-4 py-3">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((m, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (idx * 0.03) }}
                    key={m._id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white truncate max-w-[120px] lg:max-w-none">
                          {m.employeeId?.name || "Unknown"}
                        </p>
                        <p className="text-[11px] text-brand-300 truncate max-w-[120px] lg:max-w-none">
                          {m.employeeId?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-xs">
                      {m.employeeId?.department || "--"}
                    </td>
                    <td className="px-3 py-3 lg:px-4 text-white/70 text-xs">
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
