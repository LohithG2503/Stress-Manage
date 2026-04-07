const Assessment = require("../models/Assessment");

exports.createAssessment = async (req, res) => {
  try {
    const {
      responses,
      totalScore,
      riskLevel,
      macroScore,
      microScore,
      matrixType,
      concreteReason,
    } = req.body;

    const assessment = await Assessment.create({
      employeeId: req.user._id,
      responses,
      totalScore,
      riskLevel,
      macroScore,
      microScore,
      matrixType,
      concreteReason,
    });

    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    // Ensure the assessment belongs to the user or user is hr
    if (assessment.employeeId.toString() !== req.user._id.toString() && req.user.role !== "hr") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssessmentStats = async (req, res) => {
  try {
    const assessments = await Assessment.find();
    if (assessments.length === 0) {
      return res.json({
         totalAssessments: 0,
         avgScore: 0,
         riskDistribution: { Low: 0, Moderate: 0, High: 0 },
         matrixDistribution: { "Optimal Functioning Matrix": 0, "Personal Vulnerability Matrix": 0, "Environmental Stress Matrix": 0, "Systemic Burnout Matrix": 0 }
      });
    }

    const totalAssessments = assessments.length;
    let totalScoreSum = 0;
    const riskDistribution = { Low: 0, Moderate: 0, High: 0 };
    const matrixDistribution = { 
       "Optimal Functioning Matrix": 0, 
       "Personal Vulnerability Matrix": 0, 
       "Environmental Stress Matrix": 0, 
       "Systemic Burnout Matrix": 0 
    };

    assessments.forEach(a => {
       totalScoreSum += a.totalScore;
       if (riskDistribution[a.riskLevel] !== undefined) {
         riskDistribution[a.riskLevel]++;
       }
       if (matrixDistribution[a.matrixType] !== undefined) {
         matrixDistribution[a.matrixType]++;
       }
    });

    res.json({
       totalAssessments,
       avgScore: Math.round(totalScoreSum / totalAssessments),
       riskDistribution,
       matrixDistribution
    });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate("employeeId", "name email department")
      .sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
