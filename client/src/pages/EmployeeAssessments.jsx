import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import api from "../services/api";

export default function EmployeeAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await api.get("/assessments/mine");
      setAssessments(res.data);
    } catch (err) {
      console.error("Failed to fetch assessments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
          Assessment History
        </h2>
        <p className="text-white/60 text-sm mt-1 font-medium">
          Your past psychological stress assessments (Click a row to expand details)
        </p>
      </motion.div>

      {loading ? (
        <p className="text-white/60 animate-pulse text-center py-10">Loading...</p>
      ) : assessments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
        >
          <p className="text-white/60 text-lg">
            You have no completed assessments yet.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card kintsugi-glow overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 bg-black/20">
                  <th className="px-4 py-4">Date</th>
                  <th className="px-3 py-4">Score</th>
                  <th className="px-4 py-4">Risk Level</th>
                  <th className="px-4 py-4">Matrix Type</th>
                  <th className="px-4 py-4">Macro/Micro</th>
                  <th className="px-4 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assessments.map((a, idx) => (
                  <React.Fragment key={a._id}>
                    <motion.tr 
                      onClick={() => toggleExpand(a._id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.03) }}
                      className={`hover:bg-white/10 transition-colors cursor-pointer group ${expandedId === a._id ? 'bg-white/5' : ''}`}
                    >
                      <td className="px-4 py-4 text-white/70 text-xs font-medium flex items-center gap-2">
                        <span className={`transform transition-transform ${expandedId === a._id ? 'rotate-90 text-[#d4af37]' : 'text-white/30'}`}>
                          ▶
                        </span>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 font-bold text-white text-sm">{a.totalScore}</td>
                      <td className="px-4 py-4">
                        <StressBadge level={a.riskLevel} />
                      </td>
                      <td className="px-4 py-4 text-white/90 font-medium">
                        {a.matrixType}
                      </td>
                      <td className="px-4 py-4 text-white/60 text-xs text-nowrap">
                        {a.macroScore} / {a.microScore}
                      </td>
                      <td className="px-4 py-4 max-w-[200px] truncate text-white/60 text-xs">
                        {a.concreteReason}
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedId === a._id && (
                        <tr className="bg-black/60 shadow-inner">
                          <td colSpan="6" className="p-0">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 border-l-2 border-[#d4af37] m-4 bg-surface-700/50 rounded-lg border border-surface-600/50">
                                <div className="mb-6">
                                  <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-xs text-[#d4af37]">Detailed Concrete Reason</h4>
                                  <p className="leading-relaxed text-white/80 text-sm">{a.concreteReason}</p>
                                </div>
                                <div>
                                  <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs text-[#d4af37]">Raw Survey Responses</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {a.responses && Object.entries(a.responses).map(([qKey, val]) => (
                                      <div key={qKey} className="bg-black/30 p-3 rounded border border-white/10 flex justify-between items-center">
                                        <span className="text-[10px] uppercase text-white/50 font-bold">Q{qKey.replace('q', '')}</span>
                                        <span className={`font-mono text-sm font-bold ${val >= 4 ? 'text-red-400' : val >= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                          {val}/5
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
