const express = require("express");
const {
  createAssessment,
  getMyAssessments,
  getAssessmentById,
  getAssessmentStats,
  getAllAssessments
} = require("../controllers/assessmentsController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createAssessment);
router.get("/mine", protect, getMyAssessments);
router.get("/all", protect, authorizeRoles("hr"), getAllAssessments);
router.get("/stats", protect, authorizeRoles("hr"), getAssessmentStats);
router.get("/:id", protect, getAssessmentById);

module.exports = router;
