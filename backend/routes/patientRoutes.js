const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Patient = require("../models/patient");

const authMiddleware = require("../middleware/authMiddleware");
const patientAuthMiddleware = require("../middleware/patientAuthMiddleware");
const familyAuthMiddleware = require("../middleware/familyAuthMiddleware");

const router = express.Router();


// =====================================================
// DATE / TIME HELPERS
// =====================================================

// Current date in India: YYYY-MM-DD
const getTodayString = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
};


// Check whether patient's care period has ended
const isCareExpired = (careEndDate) => {
  if (!careEndDate) {
    return false;
  }

  return careEndDate < getTodayString();
};


// Current time in India converted to minutes from midnight
const getCurrentTimeInMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value || 0
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value || 0
  );

  return hour * 60 + minute;
};


// Convert medicine time into minutes
// Supports:
// 10:30
// 10:30 AM
// 10:30 PM
const convertMedicineTimeToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const value = time.trim().toUpperCase();

  // 24-hour format: 10:30
  const twentyFourHourMatch = value.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59
    ) {
      return hour * 60 + minute;
    }

    return null;
  }

  // 12-hour format: 10:30 AM
  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3];

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return hour * 60 + minute;
  }

  return null;
};


// Current Indian time as HH:MM
const getCurrentIndianTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
};


// =====================================================
// DAILY MEDICINE STATUS RESET
// =====================================================

const resetMedicineStatusesIfNeeded = async (patient) => {
  const today = getTodayString();

  let changed = false;

  patient.medicines.forEach((medicine) => {
    if (medicine.takenOn && medicine.takenOn !== today) {
      medicine.taken = false;
      medicine.takenOn = null;
      medicine.takenAt = null;

      changed = true;
    }
  });

  if (changed) {
    await patient.save();
  }

  return patient;
};


// =====================================================
// PATIENT LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { patientId, password } = req.body;

    if (!patientId || !password) {
      return res.status(400).json({
        message: "Patient ID and password are required.",
      });
    }

    const patient = await Patient.findOne({
      patientId: patientId.trim(),
    });

    if (!patient) {
      return res.status(401).json({
        message: "Invalid Patient ID or password.",
      });
    }

    // Prevent login after care period
    if (isCareExpired(patient.careEndDate)) {
      return res.status(403).json({
        message:
          "Your post-discharge care period has ended.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      patient.patientPassword
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Patient ID or password.",
      });
    }

    const token = jwt.sign(
      {
        patientId: patient._id.toString(),
        hospitalId: patient.hospitalId.toString(),
        role: "patient",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Patient login successful.",
      token,

      patient: {
        id: patient._id,
        name: patient.name,
        patientId: patient.patientId,
        hospitalId: patient.hospitalId,
      },
    });
  } catch (error) {
    console.error(
      "Patient login error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while logging in.",
    });
  }
});


// =====================================================
// FAMILY LOGIN
// =====================================================

router.post("/family-login", async (req, res) => {
  try {
    const { familyId, password } = req.body;

    if (!familyId || !password) {
      return res.status(400).json({
        message:
          "Family Access ID and password are required.",
      });
    }

    const patient = await Patient.findOne({
      familyId: familyId.trim(),
    });

    if (!patient) {
      return res.status(401).json({
        message: "Invalid Family Access ID or password.",
      });
    }

    // Prevent family login after care period
    if (isCareExpired(patient.careEndDate)) {
      return res.status(403).json({
        message:
          "The patient's post-discharge care period has ended.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      patient.familyPassword
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Family Access ID or password.",
      });
    }

    const token = jwt.sign(
      {
        patientId: patient._id.toString(),
        hospitalId: patient.hospitalId.toString(),
        role: "family",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Family login successful.",
      token,

      family: {
        id: patient._id,
        familyId: patient.familyId,
        patientId: patient._id,
        patientName: patient.name,
        hospitalId: patient.hospitalId,
      },
    });
  } catch (error) {
    console.error(
      "Family login error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while logging in.",
    });
  }
});


// =====================================================
// FAMILY - GET LINKED PATIENT
// =====================================================

router.get(
  "/family/me",
  familyAuthMiddleware,
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      }).select(
        "-patientPassword -familyPassword"
      );

      if (!patient) {
        return res.status(404).json({
          message: "Linked patient not found.",
        });
      }

      // Prevent access after care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "The patient's post-discharge care period has ended.",
        });
      }

      await resetMedicineStatusesIfNeeded(patient);

      res.status(200).json({
        patient,
      });
    } catch (error) {
      console.error(
        "Family patient error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching patient.",
      });
    }
  }
);


// =====================================================
// GET LOGGED-IN PATIENT
// =====================================================

router.get(
  "/me",
  patientAuthMiddleware,
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      }).select(
        "-patientPassword -familyPassword"
      );

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      // Prevent access after care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "Your post-discharge care period has ended.",
        });
      }

      await resetMedicineStatusesIfNeeded(patient);

      res.status(200).json({
        patient,
      });
    } catch (error) {
      console.error(
        "Get patient profile error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching patient.",
      });
    }
  }
);


// =====================================================
// PATIENT - MARK MEDICINE TAKEN
// =====================================================

router.put(
  "/medicine/:index/taken",
  patientAuthMiddleware,
  async (req, res) => {
    try {
      const index = Number(req.params.index);

      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      // Prevent medicine access after care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "Your post-discharge care period has ended.",
        });
      }

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= patient.medicines.length
      ) {
        return res.status(400).json({
          message: "Invalid medicine.",
        });
      }

      // Reset previous day's status
      await resetMedicineStatusesIfNeeded(patient);

      const medicine = patient.medicines[index];

      const today = getTodayString();

      const currentMinutes =
        getCurrentTimeInMinutes();

      // Already taken today
      if (
        medicine.taken === true &&
        medicine.takenOn === today
      ) {
        return res.status(400).json({
          message:
            "This medicine has already been marked as taken today.",
          medicine,
        });
      }

      // Convert scheduled medicine time
      const medicineTime =
        convertMedicineTimeToMinutes(
          medicine.time
        );

      if (medicineTime === null) {
        return res.status(400).json({
          message:
            "Invalid medicine time. Please ask the hospital to update it.",
        });
      }

      // Cannot mark before scheduled time
      if (currentMinutes < medicineTime) {
        const remainingMinutes =
          medicineTime - currentMinutes;

        const hours = Math.floor(
          remainingMinutes / 60
        );

        const minutes =
          remainingMinutes % 60;

        let remainingText = "";

        if (hours > 0) {
          remainingText += `${hours} hour${
            hours > 1 ? "s" : ""
          }`;
        }

        if (minutes > 0) {
          if (remainingText) {
            remainingText += " ";
          }

          remainingText += `${minutes} minute${
            minutes > 1 ? "s" : ""
          }`;
        }

        if (!remainingText) {
          remainingText = "a few moments";
        }

        return res.status(400).json({
          message:
            `There is still ${remainingText} until your medicine time. ` +
            `Please take it at ${medicine.time}.`,

          medicine,
        });
      }

      // Medicine time has arrived
      medicine.taken = true;
      medicine.takenOn = today;
      medicine.takenAt = getCurrentIndianTime();

      await patient.save();

      return res.status(200).json({
        message: "Medicine marked as taken.",
        medicine,
      });
    } catch (error) {
      console.error(
        "Medicine status error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Server error while updating medicine.",
      });
    }
  }
);


// =====================================================
// ADD PATIENT
// =====================================================

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        issue,
        dischargeDate,
        careEndDate,
        patientId,
        patientPassword,
        familyId,
        familyPassword,
        medicines,
        diet,
        instructions,
        appointment,
      } = req.body;

      if (
        !name ||
        !issue ||
        !dischargeDate ||
        !careEndDate ||
        !patientId ||
        !patientPassword ||
        !familyId ||
        !familyPassword
      ) {
        return res.status(400).json({
          message:
            "Required patient fields are missing.",
        });
      }

      const existingPatient =
        await Patient.findOne({
          patientId,
        });

      if (existingPatient) {
        return res.status(409).json({
          message: "Patient ID already exists.",
        });
      }

      const existingFamily =
        await Patient.findOne({
          familyId,
        });

      if (existingFamily) {
        return res.status(409).json({
          message:
            "Family Access ID already exists.",
        });
      }

      const hashedPatientPassword =
        await bcrypt.hash(
          patientPassword,
          10
        );

      const hashedFamilyPassword =
        await bcrypt.hash(
          familyPassword,
          10
        );

      const patient =
        await Patient.create({
          hospitalId: req.hospitalId,

          name,
          issue,
          dischargeDate,
          careEndDate,

          patientId,

          patientPassword:
            hashedPatientPassword,

          familyId,

          familyPassword:
            hashedFamilyPassword,

          medicines: medicines || [],

          diet: diet || "",

          instructions:
            instructions || "",

          appointment:
            appointment || null,
        });

      res.status(201).json({
        message:
          "Patient added successfully.",

        patient: {
          id: patient._id,

          hospitalId:
            patient.hospitalId,

          name: patient.name,

          issue: patient.issue,

          dischargeDate:
            patient.dischargeDate,

          careEndDate:
            patient.careEndDate,

          patientId:
            patient.patientId,

          familyId:
            patient.familyId,

          medicines:
            patient.medicines,

          diet:
            patient.diet,

          instructions:
            patient.instructions,

          appointment:
            patient.appointment,
        },
      });
    } catch (error) {
      console.error(
        "Add patient error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while adding patient.",
      });
    }
  }
);


// =====================================================
// GET ALL PATIENTS FOR LOGGED-IN HOSPITAL
// =====================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      // Extra protection:
      // Even if cleanup has not run yet,
      // expired patients won't appear.
      const today = getTodayString();

      const patients =
        await Patient.find({
          hospitalId: req.hospitalId,

          careEndDate: {
            $gte: today,
          },
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        patients,
      });
    } catch (error) {
      console.error(
        "Get patients error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching patients.",
      });
    }
  }
);


// =====================================================
// GET ONE PATIENT FOR HOSPITAL
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const patient =
        await Patient.findOne({
          _id: req.params.id,
          hospitalId: req.hospitalId,
        });

      if (!patient) {
        return res.status(404).json({
          message:
            "Patient not found.",
        });
      }

      // Extra protection
      if (isCareExpired(patient.careEndDate)) {
        return res.status(404).json({
          message:
            "This patient's care period has ended.",
        });
      }

      await resetMedicineStatusesIfNeeded(patient);

      res.status(200).json({
        patient,
      });
    } catch (error) {
      console.error(
        "Get patient error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching patient.",
      });
    }
  }
);


// =====================================================
// UPDATE PATIENT
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        issue,
        dischargeDate,
        careEndDate,
        patientId,
        patientPassword,
        familyId,
        familyPassword,
        medicines,
        diet,
        instructions,
        appointment,
      } = req.body;

      const patient =
        await Patient.findOne({
          _id: req.params.id,
          hospitalId: req.hospitalId,
        });

      if (!patient) {
        return res.status(404).json({
          message:
            "Patient not found.",
        });
      }

      // Don't allow editing an already expired patient
      if (isCareExpired(patient.careEndDate)) {
        return res.status(404).json({
          message:
            "This patient's care period has ended.",
        });
      }

      if (name !== undefined) {
        patient.name = name;
      }

      if (issue !== undefined) {
        patient.issue = issue;
      }

      if (
        dischargeDate !== undefined
      ) {
        patient.dischargeDate =
          dischargeDate;
      }

      if (
        careEndDate !== undefined
      ) {
        patient.careEndDate =
          careEndDate;
      }

      if (medicines !== undefined) {
        patient.medicines =
          medicines;
      }

      if (diet !== undefined) {
        patient.diet = diet;
      }

      if (
        instructions !== undefined
      ) {
        patient.instructions =
          instructions;
      }

      if (
        appointment !== undefined
      ) {
        patient.appointment =
          appointment;
      }

      // Check changed Patient ID
      if (
        patientId !== undefined &&
        patientId !== patient.patientId
      ) {
        const existingPatient =
          await Patient.findOne({
            patientId,
            _id: {
              $ne: patient._id,
            },
          });

        if (existingPatient) {
          return res.status(409).json({
            message:
              "Patient ID already exists.",
          });
        }

        patient.patientId =
          patientId;
      }

      // Check changed Family ID
      if (
        familyId !== undefined &&
        familyId !== patient.familyId
      ) {
        const existingFamily =
          await Patient.findOne({
            familyId,
            _id: {
              $ne: patient._id,
            },
          });

        if (existingFamily) {
          return res.status(409).json({
            message:
              "Family Access ID already exists.",
          });
        }

        patient.familyId =
          familyId;
      }

      // Update patient password if provided
      if (patientPassword) {
        patient.patientPassword =
          await bcrypt.hash(
            patientPassword,
            10
          );
      }

      // Update family password if provided
      if (familyPassword) {
        patient.familyPassword =
          await bcrypt.hash(
            familyPassword,
            10
          );
      }

      await patient.save();

      res.status(200).json({
        message:
          "Patient updated successfully.",

        patient: {
          id: patient._id,

          hospitalId:
            patient.hospitalId,

          name: patient.name,

          issue: patient.issue,

          dischargeDate:
            patient.dischargeDate,

          careEndDate:
            patient.careEndDate,

          patientId:
            patient.patientId,

          familyId:
            patient.familyId,

          medicines:
            patient.medicines,

          diet:
            patient.diet,

          instructions:
            patient.instructions,

          appointment:
            patient.appointment,
        },
      });
    } catch (error) {
      console.error(
        "Update patient error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while updating patient.",
      });
    }
  }
);


// =====================================================
// DELETE PATIENT
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const patient =
        await Patient.findOneAndDelete({
          _id: req.params.id,
          hospitalId: req.hospitalId,
        });

      if (!patient) {
        return res.status(404).json({
          message:
            "Patient not found.",
        });
      }

      res.status(200).json({
        message:
          "Patient deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete patient error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while deleting patient.",
      });
    }
  }
);


module.exports = router;