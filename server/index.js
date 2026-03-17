const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const metricsRoutes = require("./routes/metrics");

dotenv.config();

const app = express();
const isVercel = process.env.VERCEL === "1";
const shouldAutoSeed = !isVercel && process.env.AUTO_SEED !== "false";

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

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      runtime: isVercel ? "vercel" : "node",
      hasMongoUri: Boolean(process.env.MONGO_URI),
      autoSeedEnabled: shouldAutoSeed,
      dbConnected: true,
    });
  } catch (error) {
    console.error("Health check DB failure:", error.message);
    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      runtime: isVercel ? "vercel" : "node",
      hasMongoUri: Boolean(process.env.MONGO_URI),
      autoSeedEnabled: shouldAutoSeed,
      dbConnected: false,
      dbError: error.message,
    });
  }
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();

    if (shouldAutoSeed && !seeded && !seedError) {
      try {
        await seedData();
        seeded = true;
      } catch (error) {
        seedError = error;
        console.error("Seed initialization failed:", error.message);
      }
    }

    next();
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    res.status(503).json({ message: "Database connection failed: " + error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/metrics", metricsRoutes);

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
