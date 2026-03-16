const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const metricsRoutes = require("./routes/metrics");

dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/metrics", metricsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
};

start();
