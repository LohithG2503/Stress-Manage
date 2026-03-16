const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee ID is required"],
    },
    screenTime: {
      type: Number,
      required: [true, "Screen time is required"],
      min: 0,
      max: 24,
    },
    breakTime: {
      type: Number,
      required: [true, "Break time is required"],
      min: 0,
      max: 24,
    },
    meetingTime: {
      type: Number,
      required: [true, "Meeting time is required"],
      min: 0,
      max: 24,
    },
    workTime: {
      type: Number,
      required: [true, "Work time is required"],
      min: 0,
      max: 24,
    },
    afterHoursTime: {
      type: Number,
      required: [true, "After-hours work time is required"],
      min: 0,
      max: 24,
    },
    stressScore: {
      type: Number,
      default: 0,
    },
    stressLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

metricSchema.pre("validate", function (next) {
  if (this.screenTime != null && this.breakTime != null && this.meetingTime != null) {
    this.workTime = Number((this.screenTime + this.breakTime + this.meetingTime).toFixed(1));
    this.workTime = Math.min(this.workTime, 24);
  }
  next();
});

metricSchema.pre("save", function (next) {
  // --- Logical Stress Calculation ---
  // A base expectation of an 8 hour work day is used.
  
  // 1. Calculate Active Workload (Hours)
  const activeWorkload = this.workTime + this.afterHoursTime;

  // 2. Overwork Penalty
  // 10 stress points for every hour worked over a standard 8-hour day
  let overworkPenalty = 0;
  if (activeWorkload > 8) {
    overworkPenalty = (activeWorkload - 8) * 10; 
  }

  // 3. Screen Intensity
  // High screen time relative to work time adds minor fatigue (~ 6-10 points)
  const screenIntensity = (this.screenTime / (activeWorkload || 1)) * 10;

  // 4. Meeting Fatigue
  // Meetings over 2 hours become increasingly exhausting (5 points per hour)
  let meetingFatigue = 0;
  if (this.meetingTime > 2) {
    meetingFatigue = (this.meetingTime - 2) * 5;
  }

  // 5. Break Recovery
  // Taking breaks relieves stress (-10 points per hour, capped at 20 points)
  const breakRecovery = Math.min(this.breakTime * 10, 20);

  // 6. Base Stress
  // Baseline stress just for showing up and working
  const baseStress = 20;

  this.stressScore = baseStress + overworkPenalty + screenIntensity + meetingFatigue - breakRecovery;

  // Clamp strictly between 0 and 100 with one decimal precision
  this.stressScore = Math.max(0, Math.min(100, this.stressScore));
  this.stressScore = Math.round(this.stressScore * 10) / 10;

  // Realistic categorizations based on human burnout levels
  if (this.stressScore <= 40) {
    this.stressLevel = "Low";     // Normal, healthy workday (Score 0-40)
  } else if (this.stressScore <= 70) {
    this.stressLevel = "Medium";  // Busy, slightly overworked day (Score 41-70)
  } else {
    this.stressLevel = "High";    // Heavy after-hours, excessive meetings, no breaks (Score 71-100)
  }

  next();
});

module.exports = mongoose.model("Metric", metricSchema);
