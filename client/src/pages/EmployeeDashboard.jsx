import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import SpotlightCard from "../components/SpotlightCard";
import api from "../services/api";
import { generateCorrelationInsights } from "../utils/correlationEngine";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function EmployeeDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, assessmentsRes] = await Promise.all([
        api.get("/metrics/mine"),
        api.get("/assessments/mine"),
      ]);
      setMetrics(metricsRes.data);
      setAssessments(assessmentsRes.data);
      setInsights(generateCorrelationInsights(metricsRes.data, assessmentsRes.data));
    } catch (err) {
      console.error("Failed to fetch data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const latestMetric = metrics.length > 0 ? metrics[0] : null;
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  // Build combined chart data
  // We want to map dates to both metric stress and assessment totalScore
  // Get all dates from last 14 days
  const chartDataMap = {};
  
  // Last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    chartDataMap[dateStr] = { date: dateStr, metricStress: null, assessmentScore: null };
  }

  // Populate metrics
  metrics.forEach(m => {
    const dateStr = new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (chartDataMap[dateStr]) {
      chartDataMap[dateStr].metricStress = m.stressScore;
    }
  });

  // Populate assessments
  assessments.forEach(a => {
    const dateStr = new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (chartDataMap[dateStr]) {
      chartDataMap[dateStr].assessmentScore = a.totalScore;
    }
  });

  let chartData = Object.values(chartDataMap);

  // Filter trailing nulls at the start if needed, but 14 days is good.
  
  const summaryCards = [
    {
      label: "Metric Stress Level",
      value: latestMetric ? latestMetric.stressScore : "--",
      sub: latestMetric ? latestMetric.stressLevel : "No data",
    },
    {
      label: "Assessment Risk",
      value: latestAssessment ? latestAssessment.totalScore : "--",
      sub: latestAssessment ? latestAssessment.riskLevel : "No data",
      isAssessment: true
    },
    {
      label: "Matrix Profile",
      value: latestAssessment ? latestAssessment.matrixType.replace(' Matrix', '') : "--",
      sub: latestAssessment ? `Macro: ${latestAssessment.macroScore} | Micro: ${latestAssessment.microScore}` : "Take assessment",
    },
    {
      label: "Latest After-Hours Work",
      value: latestMetric ? latestMetric.afterHoursTime + "h" : "--",
      sub: "From metrics",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">Wellness Overview</h2>
        <p className="text-white/60 text-sm mt-1 font-medium tracking-wide">
          Comprehensive view of your behavioral metrics and psychological assessments
        </p>
      </motion.div>

      {loading ? (
        <p className="text-white/60 animate-pulse text-center py-10">Loading your data...</p>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {summaryCards.map((card, idx) => (
              <SpotlightCard
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ 
                  delay: 0.1 + (idx * 0.1),
                  type: "spring",
                  stiffness: 300,
                  damping: 24
                }}
                key={card.label}
                className={`p-4 xl:p-6 flex flex-col justify-between ${card.isAssessment ? 'kintsugi-glow border-b-2 border-b-[#d4af37]' : ''}`}
              >
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  {card.label}
                </p>
                <p className="text-[1.35rem] leading-tight lg:text-2xl font-extrabold text-white text-wrap" style={{ wordBreak: 'break-word' }}>
                  {card.value}
                </p>
                <p className="text-xs text-brand-300 mt-2 font-medium">{card.sub}</p>
              </SpotlightCard>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                Correlation Trend (Last 14 Days)
              </h3>
              <div className="h-[320px] min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: "#d4af37" }}
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: "#10b981" }}
                      domain={[15, 75]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1e1e",
                        borderRadius: "12px",
                        border: "1px solid rgba(212,175,55,0.3)",
                        fontSize: "13px",
                        color: "#fff",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="metricStress"
                      name="Daily Work Stress (Metrics)"
                      stroke="#d4af37"
                      strokeWidth={3}
                      connectNulls
                      dot={{ fill: "#1e1e2d", stroke: "#d4af37", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="assessmentScore"
                      name="Psychological Stress (Assessment)"
                      stroke="#10b981"
                      strokeWidth={3}
                      connectNulls
                      dot={{ fill: "#1e1e2d", stroke: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 flex flex-col"
            >
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Correlation Insights
              </h3>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {insights.length === 0 ? (
                  <p className="text-sm text-white/50 italic">Complete an assessment and log metrics to see insights.</p>
                ) : insights.map((insight, idx) => (
                  <motion.div 
                    whileHover={{ scale: 1.01, x: 2 }}
                    key={idx} 
                    className="bg-surface-700/50 rounded-lg p-4 border-l-2 border-[#d4af37] hover:bg-surface-500 transition-colors cursor-default"
                  >
                    <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
                    <p className="text-xs text-white/70 leading-relaxed">{insight.text}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                 <Link
                    to="/employee/assessment"
                    className="w-full block text-center py-2 bg-[#d4af37] hover:bg-[#c5a030] text-surface-900 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-[#d4af37]/20"
                  >
                    Take New Assessment
                  </Link>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Daily Metrics
              </h3>
              <Link
                to="/employee/log"
                className="text-sm text-brand-300 hover:text-white font-medium transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5"
              >
                Start Daily Check-In
              </Link>
            </div>
            {metrics.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-white/60 text-base">
                  No entries yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 bg-black/20">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-3 py-3">Work</th>
                      <th className="px-3 py-3">A/H</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-4 py-3">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics.slice(0, 5).map((m, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.05) }}
                        key={m._id} 
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white/70 text-xs font-medium">
                          {new Date(m.date).toLocaleDateString()}
                        </td>
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
