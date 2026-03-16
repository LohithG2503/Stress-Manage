const express = require("express");
const {
  createMetric,
  updateMetric,
  deleteMetric,
  getMyMetrics,
  getAllMetrics,
  getDashboardStats,
} = require("../controllers/metricsController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createMetric);
router.get("/mine", protect, getMyMetrics);
router.put("/:id", protect, updateMetric);
router.delete("/:id", protect, deleteMetric);

router.get("/all", protect, authorizeRoles("hr"), getAllMetrics);
router.get("/stats", protect, authorizeRoles("hr"), getDashboardStats);

module.exports = router;
