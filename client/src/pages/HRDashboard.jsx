import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STRESS_COLORS = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
};

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/metrics/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-surface-500">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <p className="text-surface-500">Failed to load dashboard data.</p>
      </DashboardLayout>
    );
  }

  const overviewCards = [
    { label: "Total Employees", value: stats.totalEmployees },
    { label: "Total Entries", value: stats.totalEntries },
    {
      label: "Avg Stress Score",
      value: stats.averages.stressScore,
    },
    {
      label: "Avg Screen Time",
      value: stats.averages.screenTime + "h",
    },
  ];

  const avgBarData = [
    { name: "Screen", value: stats.averages.screenTime },
    { name: "Break", value: stats.averages.breakTime },
    { name: "Meeting", value: stats.averages.meetingTime },
    { name: "Work", value: stats.averages.workTime },
    { name: "After-Hours", value: stats.averages.afterHoursTime },
  ];

  const pieData = Object.entries(stats.stressDistribution)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({
      name: level,
      value: count,
    }));

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">HR Dashboard</h2>
        <p className="text-surface-400 text-sm mt-1 font-medium">
          Organization-wide wellness overview
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {overviewCards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (idx * 0.1) }}
            key={card.label}
            className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
          >
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
              {card.label}
            </p>
            <p className="text-3xl font-extrabold text-white">
              {card.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Average Metrics (Hours)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={avgBarData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(18, 18, 26, 0.9)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "13px",
                  color: "#fff",
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="value" fill="url(#colorStressBar)" radius={[4, 4, 0, 0]}>
                {avgBarData.map((e, index) => (
                  <Cell key={`cell-${index}`} fill="#818cf8" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Stress Level Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    name + " " + (percent * 100).toFixed(0) + "%"
                  }
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STRESS_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(18, 18, 26, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-400 text-sm text-center py-20">
              No data available
            </p>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg mb-8"
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Detailed Averages
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 bg-black/20">
                <th className="px-6 py-4">Metric</th>
                <th className="px-6 py-4">Average Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Screen Time", stats.averages.screenTime + " hours"],
                ["Break Time", stats.averages.breakTime + " hours"],
                ["Meeting Time", stats.averages.meetingTime + " hours"],
                ["Work Time", stats.averages.workTime + " hours"],
                ["After-Hours Work", stats.averages.afterHoursTime + " hours"],
                ["Stress Score", stats.averages.stressScore + " / 100"],
              ].map(([label, val]) => (
                <tr key={label} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white/80">
                    {label}
                  </td>
                  <td className="px-6 py-4 text-brand-300 font-bold">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
