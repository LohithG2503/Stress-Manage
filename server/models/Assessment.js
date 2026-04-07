const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee ID is required"],
    },
    responses: {
      type: Map,
      of: Number,
      required: [true, "Responses are required"],
    },
    totalScore: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      required: true,
    },
    macroScore: {
      type: Number,
      required: true,
    },
    microScore: {
      type: Number,
      required: true,
    },
    matrixType: {
      type: String,
      required: true,
    },
    concreteReason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
