import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EmployeeDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const latestMetric = metrics.length > 0 ? metrics[0] : null;

  const chartData = [...metrics]
    .reverse()
    .slice(-14)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      stressScore: m.stressScore,
    }));

  const averageStress =
    metrics.length > 0
      ? Math.round(
          (metrics.reduce((sum, m) => sum + m.stressScore, 0) /
            metrics.length) *
            100
        ) / 100
      : 0;

  const summaryCards = [
    {
      label: "Latest Stress Score",
      value: latestMetric ? latestMetric.stressScore : "--",
      sub: latestMetric ? latestMetric.stressLevel : "",
    },
    {
      label: "Average Stress",
      value: averageStress,
      sub: "All entries",
    },
    {
      label: "Total Entries",
      value: metrics.length,
      sub: "Logged days",
    },
    {
      label: "Latest After-Hours Work",
      value: latestMetric ? latestMetric.afterHoursTime + "h" : "--",
      sub: "Hours",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">My Dashboard</h2>
        <p className="text-surface-400 text-sm mt-1 font-medium">
          Overview of your wellness metrics
        </p>
      </motion.div>

      {loading ? (
        <p className="text-surface-400 animate-pulse text-center py-10">Loading your data...</p>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {summaryCards.map((card, idx) => (
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
                <p className="text-xs text-brand-300 mt-2 font-medium">{card.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {chartData.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 shadow-lg"
            >
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                Stress Trend (Last 14 Days)
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 26, 0.9)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "13px",
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#a5b4fc" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stressScore"
                    stroke="#818cf8"
                    strokeWidth={3}
                    dot={{ fill: "#1e1e2d", stroke: "#818cf8", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: "#c7d2fe", stroke: "#4f46e5" }}
                    name="Stress Score"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Entries
              </h3>
              <Link
                to="/employee/log"
                className="text-sm text-brand-300 hover:text-white font-medium transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5"
              >
                Log New Entry
              </Link>
            </div>
            {metrics.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-surface-400 text-base">
                  No entries yet.{" "}
                  <Link
                    to="/employee/log"
                    className="text-brand-400 hover:text-white underline underline-offset-4 transition-colors font-medium"
                  >
                    Log your first day.
                  </Link>
                </p>
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics.slice(0, 7).map((m, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.05) }}
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
                        <td className="px-3 py-3 font-bold text-white text-sm">
                          {m.stressScore}
                        </td>
                        <td className="px-4 py-3">
                          <StressBadge level={m.stressLevel} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
}
