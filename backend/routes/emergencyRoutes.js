const express = require("express");

const EmergencyAlert = require("../models/emergencyAlert");
const Patient = require("../models/patient");

const authMiddleware = require("../middleware/authMiddleware");
const patientAuthMiddleware = require("../middleware/patientAuthMiddleware");
const familyAuthMiddleware = require("../middleware/familyAuthMiddleware");

const router = express.Router();


// =====================================================
// DATE HELPER
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


// =====================================================
// PATIENT - CREATE EMERGENCY ALERT
// =====================================================

router.post(
  "/patient",
  patientAuthMiddleware,
  async (req, res) => {
    try {
      const { message } = req.body;

      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      // Prevent emergency alerts after care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "Your post-discharge care period has ended.",
        });
      }

      const alert =
        await EmergencyAlert.create({
          hospitalId: patient.hospitalId,

          patientId: patient._id,

          patientName: patient.name,

          message:
            message ||
            "Emergency assistance requested.",

          status: "Pending",
        });

      res.status(201).json({
        message:
          "Emergency alert sent successfully.",

        alert,
      });
    } catch (error) {
      console.error(
        "Create patient emergency error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while creating emergency alert.",
      });
    }
  }
);


// =====================================================
// PATIENT - GET OWN EMERGENCY ALERTS
// =====================================================

router.get(
  "/patient",
  patientAuthMiddleware,
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      });

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

      const alerts =
        await EmergencyAlert.find({
          patientId: req.patientId,

          hospitalId: req.hospitalId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        alerts,
      });
    } catch (error) {
      console.error(
        "Get patient emergency alerts error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching emergency alerts.",
      });
    }
  }
);


// =====================================================
// FAMILY - CREATE EMERGENCY ALERT
// =====================================================

router.post(
  "/family",
  familyAuthMiddleware,
  async (req, res) => {
    try {
      const { message } = req.body;

      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      });

      if (!patient) {
        return res.status(404).json({
          message:
            "Linked patient not found.",
        });
      }

      // Prevent family emergency alerts
      // after patient's care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "The patient's post-discharge care period has ended.",
        });
      }

      const alert =
        await EmergencyAlert.create({
          hospitalId: patient.hospitalId,

          patientId: patient._id,

          patientName: patient.name,

          message:
            message ||
            "Emergency assistance requested by family.",

          status: "Pending",
        });

      res.status(201).json({
        message:
          "Emergency alert sent successfully.",

        alert,
      });
    } catch (error) {
      console.error(
        "Family emergency error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while creating emergency alert.",
      });
    }
  }
);


// =====================================================
// FAMILY - GET LINKED PATIENT ALERTS
// =====================================================

router.get(
  "/family",
  familyAuthMiddleware,
  async (req, res) => {
    try {
      const patient = await Patient.findOne({
        _id: req.patientId,
        hospitalId: req.hospitalId,
      });

      if (!patient) {
        return res.status(404).json({
          message:
            "Linked patient not found.",
        });
      }

      // Prevent access after care period
      if (isCareExpired(patient.careEndDate)) {
        return res.status(403).json({
          message:
            "The patient's post-discharge care period has ended.",
        });
      }

      const alerts =
        await EmergencyAlert.find({
          patientId: req.patientId,

          hospitalId: req.hospitalId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        alerts,
      });
    } catch (error) {
      console.error(
        "Family alerts error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching emergency alerts.",
      });
    }
  }
);


// =====================================================
// HOSPITAL - GET OWN EMERGENCY ALERTS
// =====================================================

router.get(
  "/hospital",
  authMiddleware,
  async (req, res) => {
    try {
      const alerts =
        await EmergencyAlert.find({
          hospitalId: req.hospitalId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        alerts,
      });
    } catch (error) {
      console.error(
        "Get hospital emergency alerts error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while fetching emergency alerts.",
      });
    }
  }
);


// =====================================================
// HOSPITAL - UPDATE EMERGENCY STATUS
// =====================================================

router.put(
  "/hospital/:id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        ![
          "Pending",
          "Acknowledged",
          "Resolved",
        ].includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid emergency status.",
        });
      }

      const alert =
        await EmergencyAlert.findOne({
          _id: req.params.id,

          hospitalId: req.hospitalId,
        });

      if (!alert) {
        return res.status(404).json({
          message:
            "Emergency alert not found.",
        });
      }

      alert.status = status;

      if (status === "Acknowledged") {
        alert.acknowledgedAt =
          new Date();
      }

      if (status === "Resolved") {
        if (!alert.acknowledgedAt) {
          alert.acknowledgedAt =
            new Date();
        }

        alert.resolvedAt =
          new Date();
      }

      await alert.save();

      res.status(200).json({
        message:
          "Emergency status updated successfully.",

        alert,
      });
    } catch (error) {
      console.error(
        "Update emergency status error:",
        error.message
      );

      res.status(500).json({
        message:
          "Server error while updating emergency status.",
      });
    }
  }
);


module.exports = router;