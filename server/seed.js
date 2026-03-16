const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./models/User");
const Metric = require("./models/Metric");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const users = [
  {
    name: "Alice Johnson",
    email: "alice@company.com",
    password: "password123",
    role: "employee",
    department: "Engineering",
  },
  {
    name: "Bob Smith",
    email: "bob@company.com",
    password: "password123",
    role: "employee",
    department: "Design",
  },
  {
    name: "Carol Williams",
    email: "carol@company.com",
    password: "password123",
    role: "employee",
    department: "Marketing",
  },
  {
    name: "David Brown",
    email: "david@company.com",
    password: "password123",
    role: "employee",
    department: "Engineering",
  },
  {
    name: "Eva Martinez",
    email: "eva@company.com",
    password: "password123",
    role: "employee",
    department: "Sales",
  },
  {
    name: "HR Admin",
    email: "hr@company.com",
    password: "admin123",
    role: "hr",
    department: "Human Resources",
  },
];

const randomBetween = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

const generateMetrics = (employeeId, days) => {
  const metrics = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Realistic baseline: 7 to 9 hours standard shift
    const workTime = randomBetween(7, 9);
    
    // Only ~30% of days have significant after hours work
    const afterHoursTime = Math.random() < 0.3 ? randomBetween(1, 3.5) : 0;
    
    // Meetings typically range from 30 mins to 3 hours
    const meetingTime = randomBetween(0.5, 3);
    
    // Standard breaks
    const breakTime = randomBetween(0.5, 1.5);

    // Screen time is typically the total active work time minus some fraction of meeting/offline time
    const totalActive = workTime + afterHoursTime;
    const screenTime = randomBetween(totalActive * 0.6, totalActive * 0.9);

    const format = (num) => Math.round(num * 10) / 10;

    metrics.push({
      employeeId,
      screenTime: format(screenTime),
      breakTime: format(breakTime),
      meetingTime: format(meetingTime),
      workTime: format(workTime),
      afterHoursTime: format(afterHoursTime),
      date,
      notes: "",
    });
  }

  return metrics;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Metric.deleteMany({});
    console.log("Cleared existing data");

    const createdUsers = await User.create(users);
    console.log("Created " + createdUsers.length + " users");

    const employees = createdUsers.filter((u) => u.role === "employee");
    let totalMetrics = 0;

    for (const employee of employees) {
      const metricsData = generateMetrics(employee._id, 14);
      for (const data of metricsData) {
        await Metric.create(data);
        totalMetrics++;
      }
    }

    console.log("Created " + totalMetrics + " metric entries");
    console.log("");
    console.log("--- Login Credentials ---");
    console.log("Employee: alice@company.com / password123");
    console.log("Employee: bob@company.com / password123");
    console.log("HR Admin: hr@company.com / admin123");
    console.log("-------------------------");

    await mongoose.connection.close();
    console.log("Seed complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seed();
