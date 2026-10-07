const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    time: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    // Whether this medicine was taken today
    taken: {
      type: Boolean,
      default: false,
    },

    // Date on which it was taken
    takenOn: {
      type: String,
      default: null,
    },

    // Exact time at which patient marked it taken
    takenAt: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: String,
      trim: true,
    },

    date: {
      type: String,
    },

    time: {
      type: String,
    },

    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    issue: {
      type: String,
      required: true,
      trim: true,
    },

    dischargeDate: {
      type: String,
      required: true,
    },

    careEndDate: {
      type: String,
      required: true,
    },

    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    patientPassword: {
      type: String,
      required: true,
    },

    familyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    familyPassword: {
      type: String,
      required: true,
    },

    medicines: {
      type: [medicineSchema],
      default: [],
    },

    diet: {
      type: String,
      default: "",
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },

    appointment: {
      type: appointmentSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Patient",
  patientSchema
);