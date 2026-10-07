const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Hospital = require("../models/hospital");

const router = express.Router();

// =====================================================
// HOSPITAL REGISTRATION
// =====================================================

router.post("/register", async (req, res) => {
  try {
    const {
      hospitalName,
      branch,
      area,
      email,
      password,
    } = req.body;

    if (
      !hospitalName ||
      !branch ||
      !area ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const existingHospital = await Hospital.findOne({
      email: email.toLowerCase(),
    });

    if (existingHospital) {
      return res.status(409).json({
        message: "A hospital with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const hospital = await Hospital.create({
      hospitalName,
      branch,
      area,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Hospital registered successfully.",
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        branch: hospital.branch,
        area: hospital.area,
        email: hospital.email,
      },
    });
  } catch (error) {
    console.error(
      "Hospital registration error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while registering hospital.",
    });
  }
});

// =====================================================
// HOSPITAL LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const hospital = await Hospital.findOne({
      email: email.toLowerCase(),
    });

    if (!hospital) {
      return res.status(401).json({
        message: "Invalid hospital email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      hospital.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid hospital email or password.",
      });
    }

    const token = jwt.sign(
  {
    hospitalId: hospital._id.toString(),
    email: hospital.email,
    role: "hospital",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);

    res.status(200).json({
      message: "Hospital login successful.",
      token,
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        branch: hospital.branch,
        area: hospital.area,
        email: hospital.email,
      },
    });
  } catch (error) {
    console.error(
      "Hospital login error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while logging in.",
    });
  }
});

module.exports = router;