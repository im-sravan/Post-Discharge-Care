const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const Patient = require("./models/patient");
const EmergencyAlert = require("./models/emergencyAlert");

const hospitalRoutes = require("./routes/hospitalRoutes");
const patientRoutes = require("./routes/patientRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// AUTOMATIC CARE-END CLEANUP
// =====================================================

// Get today's date in India in YYYY-MM-DD format
const getTodayString = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
};


// Delete patients whose care period has ended
const cleanupExpiredPatients = async () => {
  try {
    const today = getTodayString();

    console.log(
      `[Care Cleanup] Checking expired patients for ${today}...`
    );

    // Find patients whose careEndDate is before today
    const expiredPatients = await Patient.find({
      careEndDate: {
        $lt: today,
      },
    }).select("_id hospitalId name patientId careEndDate");

    if (expiredPatients.length === 0) {
      console.log(
        "[Care Cleanup] No expired patients found."
      );

      return;
    }

    const patientIds = expiredPatients.map(
      (patient) => patient._id
    );

    // Delete emergency alerts belonging to expired patients
    const deletedAlerts =
      await EmergencyAlert.deleteMany({
        patientId: {
          $in: patientIds,
        },
      });

    // Delete expired patient records
    const deletedPatients =
      await Patient.deleteMany({
        _id: {
          $in: patientIds,
        },
      });

    console.log(
      `[Care Cleanup] Deleted ${deletedPatients.deletedCount} expired patient(s).`
    );

    console.log(
      `[Care Cleanup] Deleted ${deletedAlerts.deletedCount} related emergency alert(s).`
    );

    expiredPatients.forEach((patient) => {
      console.log(
        `[Care Cleanup] Removed patient: ${patient.name} (${patient.patientId}) - Care ended: ${patient.careEndDate}`
      );
    });
  } catch (error) {
    console.error(
      "[Care Cleanup] Error:",
      error.message
    );
  }
};


// =====================================================
// CONNECT DATABASE
// =====================================================

connectDB()
  .then(async () => {
    console.log(
      "[Care Cleanup] Database connected. Running initial cleanup..."
    );

    // Run once immediately when server starts
    await cleanupExpiredPatients();

    // Check every 1 minute
    setInterval(
      cleanupExpiredPatients,
      60 * 1000
    );
  })
  .catch((error) => {
    console.error(
      "Database startup error:",
      error.message
    );
  });


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/hospitals",
  hospitalRoutes
);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api/emergency",
  emergencyRoutes
);


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "Post-Discharge Care backend is running",
  });
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});