const Metric = require("../models/Metric");

const createMetric = async (req, res) => {
  try {
    const { screenTime, breakTime, meetingTime, afterHoursTime, date, notes } =
      req.body;

    if (
      screenTime == null ||
      breakTime == null ||
      meetingTime == null ||
      afterHoursTime == null ||
      !date
    ) {
      return res.status(400).json({ message: "All time fields and date are required" });
    }

    const existingMetric = await Metric.findOne({
      employeeId: req.user._id,
      date: new Date(date),
    });

    if (existingMetric) {
      return res
        .status(400)
        .json({ message: "A metric entry already exists for this date" });
    }

    const metric = await Metric.create({
      employeeId: req.user._id,
      screenTime,
      breakTime,
      meetingTime,
      afterHoursTime,
      date: new Date(date),
      notes: notes || "",
    });

    res.status(201).json(metric);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Create metric error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateMetric = async (req, res) => {
  try {
    const metric = await Metric.findById(req.params.id);

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    if (metric.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this metric" });
    }

    const fields = ["screenTime", "breakTime", "meetingTime", "afterHoursTime", "notes"];
    fields.forEach((field) => {
      if (req.body[field] != null) {
        metric[field] = req.body[field];
      }
    });

    if (req.body.date) {
      metric.date = new Date(req.body.date);
    }

    const updated = await metric.save();
    res.json(updated);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Metric not found" });
    }
    console.error("Update metric error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMetric = async (req, res) => {
  try {
    const metric = await Metric.findById(req.params.id);

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    if (metric.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this metric" });
    }

    await metric.deleteOne();
    res.json({ message: "Metric deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Metric not found" });
    }
    console.error("Delete metric error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyMetrics = async (req, res) => {
  try {
    const metrics = await Metric.find({ employeeId: req.user._id }).sort({
      date: -1,
    });
    res.json(metrics);
  } catch (error) {
    console.error("Get my metrics error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllMetrics = async (req, res) => {
  try {
    const metrics = await Metric.find()
      .populate("employeeId", "name email department")
      .sort({ date: -1 });
    res.json(metrics);
  } catch (error) {
    console.error("Get all metrics error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const metrics = await Metric.find().populate(
      "employeeId",
      "name email department"
    );

    if (metrics.length === 0) {
      return res.json({
        totalEntries: 0,
        totalEmployees: 0,
        averages: {
          screenTime: 0,
          breakTime: 0,
          meetingTime: 0,
          workTime: 0,
          afterHoursTime: 0,
          stressScore: 0,
        },
        stressDistribution: { Low: 0, Medium: 0, High: 0 },
      });
    }

    const totalEntries = metrics.length;
    const uniqueEmployees = new Set(
      metrics.map((m) => m.employeeId._id.toString())
    );

    const sum = metrics.reduce(
      (acc, m) => ({
        screenTime: acc.screenTime + m.screenTime,
        breakTime: acc.breakTime + m.breakTime,
        meetingTime: acc.meetingTime + m.meetingTime,
        workTime: acc.workTime + m.workTime,
        afterHoursTime: acc.afterHoursTime + m.afterHoursTime,
        stressScore: acc.stressScore + m.stressScore,
      }),
      {
        screenTime: 0,
        breakTime: 0,
        meetingTime: 0,
        workTime: 0,
        afterHoursTime: 0,
        stressScore: 0,
      }
    );

    const averages = {};
    for (const key of Object.keys(sum)) {
      averages[key] = Math.round((sum[key] / totalEntries) * 100) / 100;
    }

    const stressDistribution = { Low: 0, Medium: 0, High: 0 };
    metrics.forEach((m) => {
      stressDistribution[m.stressLevel]++;
    });

    res.json({
      totalEntries,
      totalEmployees: uniqueEmployees.size,
      averages,
      stressDistribution,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMetric,
  updateMetric,
  deleteMetric,
  getMyMetrics,
  getAllMetrics,
  getDashboardStats,
};
