import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";

export default function AssessmentResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("latestAssessmentResult");
    if (data) {
      setResult(JSON.parse(data));
    } else {
      navigate("/employee/assessment");
    }
  }, [navigate]);

  if (!result) return null;

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
            Assessment Results
          </h2>
          <p className="text-white/60 text-sm mt-1 font-medium">
            Your psychological stress profile analysis
          </p>
        </div>
        <button
          onClick={() => navigate("/employee/dashboard")}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all"
        >
          Back to Dashboard
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="glass-card shadow-2xl p-6 h-full flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-bold text-white/80 mb-2">Total Score</h3>
            <div className="text-5xl font-black text-white mb-4">
              {result.totalScore} <span className="text-xl text-white/40">/ 75</span>
            </div>
            
            <div className="mb-6">
              <span className="text-sm text-white/60 mr-2">Risk Level:</span>
              <StressBadge level={result.riskLevel} />
            </div>

            <div className="w-full pt-6 border-t border-white/10 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Macro Score</span>
                <span className="font-bold text-white">{result.macroScore} / 35</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Micro Score</span>
                <span className="font-bold text-white">{result.microScore} / 40</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card shadow-2xl p-6 border-l-4 border-brand-500">
            <h3 className="text-sm font-bold text-brand-400 uppercase tracking-wide mb-1">Matrix Profile</h3>
            <h2 className="text-2xl font-bold text-white mb-3">{result.matrixType}</h2>
            <p className="text-white/80 leading-relaxed text-sm">
              {result.concreteReason}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card shadow-lg p-6 bg-white/5 border border-white/10">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                Macro Solutions (Management focus)
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500">•</span> Review workload distribution across your specific team or role.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500">•</span> Request clear definition of your current project expectations and deadlines.
                </li>
              </ul>
            </div>

            <div className="glass-card shadow-lg p-6 bg-white/5 border border-white/10">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Micro Solutions (Personal Focus)
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span> Schedule mandatory 15-minute breaks entirely away from screens.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span> Consider utilizing EAP (Employee Assistance Program) resources.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span> Establish strict boundaries for after-hours communications.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
