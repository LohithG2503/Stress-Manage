import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const QUESTIONS = [
  { id: "q1", category: "Quick Stress Screening", text: "How often do you feel overwhelmed by your workload?" },
  { id: "q2", category: "Quick Stress Screening", text: "How frequently do you experience physical symptoms of stress (headaches, fatigue, etc.)?" },
  { id: "q3", category: "Quick Stress Screening", text: "How often do you feel emotionally drained at the end of the workday?" },
  { id: "q4", category: "Work & Organizational Stress", text: "How would you rate your current workload level?" },
  { id: "q5", category: "Work & Organizational Stress", text: "How often do you work beyond your scheduled hours?" },
  { id: "q6", category: "Work & Organizational Stress", text: "How unclear are your job responsibilities and expectations?" }, // Adjusted for 1-5 scale consistency
  { id: "q7", category: "Work & Organizational Stress", text: "How unsupportive is your work environment and team?" }, // Adjusted
  { id: "q8", category: "Work & Organizational Stress", text: "How often do you experience conflicts at work?" },
  { id: "q9", category: "Work & Organizational Stress", text: "How dissatisfied are you with your work-life balance?" }, // Adjusted
  { id: "q10", category: "Work & Organizational Stress", text: "How often do you feel unrecognized for your contributions?" }, // Adjusted
  { id: "q11", category: "Personal & Emotional Impact", text: "How poorly do you manage your personal stress outside of work?" }, // Adjusted
  { id: "q12", category: "Personal & Emotional Impact", text: "How often do you experience anxiety or worry?" },
  { id: "q13", category: "Personal & Emotional Impact", text: "How dissatisfied are you with your overall quality of life?" }, // Adjusted
  { id: "q14", category: "Behavior & Coping", text: "How ineffectively do you cope with workplace stress?" }, // Adjusted
  { id: "q15", category: "Behavior & Coping", text: "How rarely do you engage in stress-reducing activities?" }, // Adjusted
];

export default function StressAssessment() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: parseInt(value, 10),
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (Object.keys(responses).length < 15) {
      const missingIndex = QUESTIONS.findIndex(q => responses[q.id] === undefined);
      setError(`Please answer Question ${missingIndex + 1} before submitting.`);
      return;
    }

    // Calculate Scores
    let totalScore = 0;
    let macroScore = 0;
    let microScore = 0;

    for (let i = 1; i <= 15; i++) {
      const val = responses[`q${i}`];
      totalScore += val;
      if (i >= 4 && i <= 10) {
        macroScore += val;
      } else {
        microScore += val;
      }
    }

    // Risk levels: Low (15-35), Moderate (36-55), High (56-75)
    let riskLevel = "Low";
    if (totalScore >= 36 && totalScore <= 55) riskLevel = "Moderate";
    if (totalScore >= 56) riskLevel = "High"; // StressBadge expects "High" or changed to uppercase? Wait, existing component has Medium instead of Moderate, wait. StressBadge config: Low, Medium, High. User spec: Moderate. We should use Medium or update StressBadge to support Moderate. Let's use Moderate for our logic and maybe use Medium if needed. Let's stick to Moderate and update StressBadge.

    // Matrix Logic
    // Macro range: 7-35. Threshold 21
    // Micro range: 8-40. Threshold 24
    const isHighMacro = macroScore > 21;
    const isHighMicro = microScore > 24;
    
    let matrixType = "";
    if (isHighMacro && isHighMicro) {
      matrixType = "Systemic Burnout Matrix";
    } else if (isHighMacro && !isHighMicro) {
      matrixType = "Environmental Stress Matrix";
    } else if (!isHighMacro && isHighMicro) {
      matrixType = "Personal Vulnerability Matrix";
    } else {
      matrixType = "Optimal Functioning Matrix";
    }

    // Concrete Reason Generation (finding highest scoring questions)
    const sortedResponses = Object.entries(responses).sort((a, b) => b[1] - a[1]);
    const topIssuesIds = sortedResponses.slice(0, 2).map(([id]) => id);
    const topCategories = topIssuesIds.map(id => QUESTIONS.find(q => q.id === id).category);
    
    const concreteReason = `The primary indicators of your stress profile strongly correlate with challenges in ${topCategories[0]} and ${topCategories[1]}. Consider addressing these specific areas to improve your wellbeing.`;

    const resultData = {
      responses,
      totalScore,
      riskLevel,
      macroScore,
      microScore,
      matrixType,
      concreteReason
    };

    try {
      await api.post("/assessments", resultData);
      localStorage.setItem("latestAssessmentResult", JSON.stringify(resultData));
      navigate("/employee/assessment/results");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save assessment. Please try again.");
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
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white">
          Psychological Stress Assessment
        </h2>
        <p className="text-white/60 text-sm mt-1 font-medium">
          Answer the following 15 questions to evaluate your stress levels and get actionable insights.
          Scale: 1 = Low stress (Best), 5 = High stress (Worst).
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="glass-card shadow-2xl p-8 max-w-4xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {QUESTIONS.map((q, index) => (
              <div key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-brand-400 font-semibold mb-1 uppercase tracking-wide">
                  {q.category}
                </p>
                <p className="text-base font-medium text-white mb-4">
                  {index + 1}. {q.text}
                </p>
                
                <div className="flex gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <label key={val} className="flex flex-col items-center cursor-pointer group">
                      <input
                        type="radio"
                        name={q.id}
                        value={val}
                        checked={responses[q.id] === val}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                        responses[q.id] === val 
                          ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30" 
                          : "border-white/20 text-white/60 group-hover:border-brand-500/50 group-hover:text-white"
                      }`}>
                        {val}
                      </div>
                      {val === 1 && <span className="text-[10px] text-white/40 mt-1">Low</span>}
                      {val === 5 && <span className="text-[10px] text-white/40 mt-1">High</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg text-sm font-bold rounded-xl transition-all uppercase tracking-wider"
            >
              Analyze Answers
            </motion.button>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
