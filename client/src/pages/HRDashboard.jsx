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
  Medium: "#d4af37",
  Moderate: "#d4af37",
  High: "#991b1b",
};

const MATRIX_COLORS = [
  "#10b981", // Optimal Functioning: Muted Jade Green (Low Risk)
  "#d4af37", // Personal Vulnerability: Kintsugi Gold (Moderate Risk)
  "#d4af37", // Environmental Stress: Kintsugi Gold (Moderate Risk)
  "#991b1b", // Systemic Burnout: Deep Copper/Crimson (High Risk)
];

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [assessmentStats, setAssessmentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [metricsRes, assessmentsRes] = await Promise.all([
        api.get("/metrics/stats"),
        api.get("/assessments/stats")
      ]);
      setStats(metricsRes.data);
      setAssessmentStats(assessmentsRes.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-white/60">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (!stats || !assessmentStats) {
    return (
      <DashboardLayout>
        <p className="text-white/60">Failed to load dashboard data.</p>
      </DashboardLayout>
    );
  }

  const overviewCards = [
    { label: "Total Employees", value: stats.totalEmployees },
    { label: "Total Log Entries", value: stats.totalEntries },
    { label: "Avg Shift Stress", value: stats.averages.stressScore },
    { label: "Avg Screen Time", value: stats.averages.screenTime + "h" },
  ];

  const assessmentOverviewCards = [
    { label: "Total Assessments", value: assessmentStats.totalAssessments },
    { label: "Avg Psych Stress", value: assessmentStats.avgScore },
    { label: "High Risk Flags", value: assessmentStats.riskDistribution.High || 0 },
    { label: "Optimal Profiles", value: assessmentStats.matrixDistribution["Optimal Functioning Matrix"] || 0 },
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

  const assessmentPieData = Object.entries(assessmentStats.riskDistribution)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({
      name: level,
      value: count,
    }));

  const matrixBarData = Object.entries(assessmentStats.matrixDistribution)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({
      name: name.replace(" Matrix", ""),
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
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">Workforce Analytics</h2>
        <p className="text-white/60 text-sm mt-1 font-medium">
          Organization-wide wellness overview
        </p>
      </motion.div>

      {/* Metrics Overview */}
      <h3 className="text-lg font-bold text-white mb-4">Daily Work Metrics</h3>
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
            className="glass-card p-6"
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
      >
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Average Working Metrics (Hours)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={avgBarData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" vertical={false} />
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
                  backgroundColor: "#1e1e1e",
                  borderRadius: "12px",
                  border: "1px solid rgba(212,175,55,0.3)",
                  fontSize: "13px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#e2e8f0" }}
                cursor={{ fill: "rgba(212,175,55,0.05)" }}
              />
              <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Shift Log Stress Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
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
                    backgroundColor: "#1e1e1e",
                    borderRadius: "12px",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/60 text-sm text-center py-20">
              No data available
            </p>
          )}
        </div>
      </motion.div>

      {/* Psychological Overview */}
      <h3 className="text-lg font-bold text-white mb-4">Psychological Assessments</h3>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {assessmentOverviewCards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (idx * 0.1) }}
            key={card.label}
            className="glass-card border-b-4 border-b-[#d4af37] p-6"
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
        className="grid grid-cols-1 mb-8"
      >
        <div className="glass-card kintsugi-glow p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Psychological Matrix Profiles
          </h3>
          {matrixBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={matrixBarData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: "12px",
                    border: "1px solid rgba(212,175,55,0.3)",
                    fontSize: "13px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                  cursor={{ fill: "rgba(212,175,55,0.05)" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {matrixBarData.map((e, index) => (
                    <Cell key={`cell-${index}`} fill={MATRIX_COLORS[index % MATRIX_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <p className="text-white/60 text-sm text-center py-20">
              No matrices available
            </p>
          )}
        </div>
      </motion.div>

    </DashboardLayout>
  );
}
