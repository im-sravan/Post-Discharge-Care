const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "Emergency assistance requested.",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Acknowledged",
        "Resolved",
      ],
      default: "Pending",
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmergencyAlert",
  emergencyAlertSchema
);