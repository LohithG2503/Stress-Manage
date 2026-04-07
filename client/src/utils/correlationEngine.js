export function generateCorrelationInsights(metrics, assessments) {
  if (!metrics || !assessments || metrics.length === 0 || assessments.length === 0) {
    return [];
  }

  // Get most recent of both
  const recentAssessment = assessments[0];
  const recentMetrics = metrics.slice(0, 5); // recent week

  const avgStressScore = recentMetrics.reduce((sum, m) => sum + m.stressScore, 0) / recentMetrics.length;
  const avgAfterHours = recentMetrics.reduce((sum, m) => sum + m.afterHoursTime, 0) / recentMetrics.length;
  const avgMeetings = recentMetrics.reduce((sum, m) => sum + m.meetingTime, 0) / recentMetrics.length;

  let insights = [];

  // 1. Compare risk levels vs calculated stress scores
  const assessmentRiskWeight = recentAssessment.riskLevel === "High" ? 3 : recentAssessment.riskLevel === "Moderate" ? 2 : 1;
  const metricRiskWeight = avgStressScore > 70 ? 3 : avgStressScore > 40 ? 2 : 1;

  if (assessmentRiskWeight > metricRiskWeight) {
    insights.push({
      title: "Hidden Stress",
      text: "Your psychological assessment shows higher stress than your logged metrics suggest. You may be experiencing internal pressure not reflected in your work hours."
    });
  } else if (assessmentRiskWeight < metricRiskWeight) {
    insights.push({
      title: "High Resilience",
      text: "Despite high statistical work demands, your psychological stress remains lower. Your coping mechanisms seem effective."
    });
  } else {
    insights.push({
      title: "Consistent Profile",
      text: "Your logged work metrics strongly align with your reported psychological state."
    });
  }

  // 2. Cross-reference Matrix Types
  if (recentAssessment.matrixType === "Environmental Stress Matrix") {
    if (avgAfterHours > 1 || avgMeetings > 3) {
      insights.push({
        title: "Environmental Confirmation",
        text: `Your 'Environmental Stress' profile is directly supported by your logs showing high after-hours (${avgAfterHours.toFixed(1)}h/day) or heavy meetings.`
      });
    } else {
      insights.push({
        title: "Interpersonal Environment",
        text: "Your 'Environmental Stress' profile isn't primarily driven by long hours. It may be due to team dynamics, lack of support, or lack of role clarity."
      });
    }
  }

  if (recentAssessment.matrixType === "Systemic Burnout Matrix") {
    insights.push({
      title: "Critical Burnout Warning",
      text: "Both personal and environmental triggers are extremely high. Immediate adjustment of work volume and personal recovery time is recommended."
    });
  }

  if (recentAssessment.matrixType === "Personal Vulnerability Matrix") {
    insights.push({
      title: "Personal Focus Needed",
      text: "Your workload appears manageable statistically, but personal stress management is flagged. Consider utilizing well-being resources or EAP."
    });
  }
  
  if (recentAssessment.matrixType === "Optimal Functioning Matrix") {
    insights.push({
      title: "Sustainable Workflow",
      text: "You are maintaining excellent equilibrium between your workload and psychological resilience."
    });
  }

  return insights;
}
