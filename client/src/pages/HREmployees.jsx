import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StressBadge from "../components/StressBadge";
import api from "../services/api";

export default function HREmployees() {
  const [metrics, setMetrics] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stressFilter, setStressFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resMetrics, resAssessments] = await Promise.all([
        api.get("/metrics/all"),
        api.get("/assessments/all")
      ]);
      setMetrics(resMetrics.data);
      setAssessments(resAssessments.data);
    } catch (err) {
      console.error("Failed to fetch data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = metrics.filter((m) => {
    const query = search.toLowerCase();
    const name = m.employeeId?.name?.toLowerCase() || "";
    const email = m.employeeId?.email?.toLowerCase() || "";
    const dept = m.employeeId?.department?.toLowerCase() || "";
    const matchesSearch = name.includes(query) || email.includes(query) || dept.includes(query);
    
    const matchesStress = stressFilter === "" || m.stressLevel === stressFilter;
    
    return matchesSearch && matchesStress;
  });

  const handleExportCSV = () => {
    if (filteredMetrics.length === 0) return;

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

    const rows = filteredMetrics.map((m) => [
      m.employeeId?.name || "Unknown",
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
      link.download = `employee_metrics_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      window.open("data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    }
  };

  const getUniqueEmployeesRows = () => {
    // Unique list of employees to easily click into their specific profile
    const empMap = {};
    metrics.forEach(m => {
       if (m.employeeId && !empMap[m.employeeId._id]) {
          empMap[m.employeeId._id] = m.employeeId;
       }
    });
    // Add any that might only have assessments
    assessments.forEach(a => {
      if (a.employeeId && !empMap[a.employeeId._id]) {
         empMap[a.employeeId._id] = a.employeeId;
      }
    });
    return Object.values(empMap);
  };

  if (selectedUser) {
    const userMetrics = metrics.filter(m => m.employeeId?._id === selectedUser._id);
    const userAssessments = assessments.filter(a => a.employeeId?._id === selectedUser._id);

    return (
      <DashboardLayout>
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors mb-4 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg w-max"
          >
            ← Back to All Employees
          </button>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
            {selectedUser.name}'s Profile
          </h2>
          <p className="text-white/60 text-sm mt-1 font-medium">
            {selectedUser.email} &middot; {selectedUser.department}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Completed Assessments</h3>
             {userAssessments.length === 0 ? <p className="text-white/60 text-sm">No assessments on record.</p> : (
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {userAssessments.map(a => (
                     <div key={a._id} className="bg-black/30 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-white/60 text-xs font-bold">{new Date(a.createdAt).toLocaleDateString()}</span>
                           <StressBadge level={a.riskLevel} />
                        </div>
                        <div className="flex justify-between text-sm text-white/90 mb-2">
                           <span className="font-bold">Score: {a.totalScore}</span>
                           <span className="text-brand-300 font-medium text-xs">{a.matrixType}</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed border-t border-white/10 pt-2">{a.concreteReason}</p>
                     </div>
                  ))}
               </div>
             )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Shift Metrics Logging</h3>
             {userMetrics.length === 0 ? <p className="text-white/60 text-sm">No metrics on record.</p> : (
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {userMetrics.map(m => (
                     <div key={m._id} className="bg-black/30 p-4 flex flex-col md:flex-row md:items-center justify-between rounded-lg border border-white/5 gap-4">
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-1 border-b border-white/10 pb-1">
                             <span className="text-white/60 text-xs font-bold">{new Date(m.date).toLocaleDateString()}</span>
                             <span className="text-xs font-bold text-white/90">Stress Output: {m.stressScore}/100</span>
                           </div>
                           <div className="grid grid-cols-4 gap-2 mt-2">
                              <div className="bg-white/5 px-2 py-1 rounded border border-white/5 text-center">
                                 <span className="block text-[10px] uppercase text-white/40">Work</span>
                                 <span className="text-xs font-bold text-white/80">{m.workTime}h</span>
                              </div>
                              <div className="bg-white/5 px-2 py-1 rounded border border-white/5 text-center">
                                 <span className="block text-[10px] uppercase text-white/40">AH</span>
                                 <span className="text-xs font-bold text-white/80">{m.afterHoursTime}h</span>
                              </div>
                               <div className="bg-white/5 px-2 py-1 rounded border border-white/5 text-center">
                                 <span className="block text-[10px] uppercase text-white/40">Screen</span>
                                 <span className="text-xs font-bold text-white/80">{m.screenTime}h</span>
                              </div>
                               <div className="bg-white/5 px-2 py-1 rounded border border-white/5 text-center">
                                 <span className="block text-[10px] uppercase text-white/40">Break</span>
                                 <span className="text-xs font-bold text-white/80">{m.breakTime}h</span>
                              </div>
                           </div>
                        </div>
                        <div className="w-max ml-auto">
                           <StressBadge level={m.stressLevel} />
                        </div>
                     </div>
                  ))}
               </div>
             )}
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
            Employee Database
          </h2>
          <p className="text-white/60 text-sm mt-1 font-medium">
            Search, filter, or click an employee to view their specific holistic records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <select
               value={stressFilter}
               onChange={(e) => setStressFilter(e.target.value)}
               className="h-full w-full sm:w-auto appearance-none bg-white/5 border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
               <option className="bg-surface-200" value="">All Stress Levels</option>
               <option className="bg-surface-200" value="Low">Low</option>
               <option className="bg-surface-200" value="Medium">Medium</option>
               <option className="bg-surface-200" value="High">High</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
               ▼
            </div>
          </div>
          <input
            type="text"
            placeholder="Search name, email, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand-500 w-full sm:w-64 placeholder-white/40 transition-all font-medium"
          />
          <button
            onClick={handleExportCSV}
            disabled={filteredMetrics.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            Export Logs (CSV)
          </button>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-white/60 text-center py-10 animate-pulse">Loading employee records...</p>
      ) : filteredMetrics.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
        >
          <p className="text-white/60 text-lg">No active metrics tracking history found.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 bg-black/20">
                  <th className="px-4 py-4">Employee</th>
                  <th className="px-4 py-4">Dept</th>
                  <th className="px-3 py-4 lg:px-4">Date</th>
                  <th className="px-3 py-4">Screen</th>
                  <th className="px-3 py-4">Break</th>
                  <th className="px-3 py-4">Work</th>
                  <th className="px-3 py-4">Score</th>
                  <th className="px-4 py-4">Metric Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMetrics.map((m, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (idx * 0.03) }}
                    key={m._id} 
                    className="hover:bg-white/10 transition-colors cursor-pointer group"
                    onClick={() => setSelectedUser(m.employeeId)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-white truncate max-w-[150px] lg:max-w-none group-hover:text-brand-300 transition-colors">
                          {m.employeeId?.name || "Unknown"}
                        </p>
                        <p className="text-[11px] text-white/40 truncate max-w-[150px] lg:max-w-none">
                          {m.employeeId?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white/80 text-xs font-medium">
                      {m.employeeId?.department || "--"}
                    </td>
                    <td className="px-3 py-4 lg:px-4 text-white/60 text-xs">
                      {new Date(m.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric', year: '2-digit'})}
                    </td>
                    <td className="px-3 py-4 text-white/90">{m.screenTime}h</td>
                    <td className="px-3 py-4 text-white/90">{m.breakTime}h</td>
                    <td className="px-3 py-4 text-white/90">{m.workTime}h</td>
                    <td className="px-3 py-4 font-bold text-white text-sm">{m.stressScore}</td>
                    <td className="px-4 py-4">
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
