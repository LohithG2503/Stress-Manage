const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const metricsRoutes = require("./routes/metrics");


dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
allowedOrigins.push("https://stressmanage-app.web.app");
allowedOrigins.push("https://stressmanage-app.firebaseapp.com");

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

const { seedData } = require("./seed");

let seeded = false;
let seedError = null;

app.use(async (req, res, next) => {
  await connectDB();
  if (!seeded && !seedError) {
    try {
      await seedData();
      seeded = true;
    } catch (error) {
      seedError = error;
      console.error("Seed initialization failed:", error.message);
    }
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/metrics", metricsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
