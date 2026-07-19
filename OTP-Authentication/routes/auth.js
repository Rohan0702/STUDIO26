const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendOTP = require("../utils/email");

let lastOTP = "";

// Test helper route to fetch the last generated OTP programmatically during browser automation
if (process.env.NODE_ENV !== "production") {
  router.get("/test-get-otp", (req, res) => {
    res.json({ otp: lastOTP });
  });
}

// Register User
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "This email is already registered." });
      } else {
        // If unverified user exists, remove them so they can register again
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    // generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[REGISTER OTP] for ${emailLower}: ${otp}`);
    lastOTP = otp;

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      firstName,
      lastName,
      email: emailLower,
      password: hashedPassword,
      role: role || "Engineer",
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    await user.save();

    // send email
    await sendOTP(emailLower, otp);

    res.json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error during registration."
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      message: "Account verified successfully",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: (user.firstName[0] + user.lastName[0]).toUpperCase(),
        joined: user.joined
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[RESEND OTP] for ${emailLower}: ${otp}`);
    lastOTP = otp;
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTP(emailLower, otp);

    res.json({ message: "OTP resent successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error resending OTP." });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if account is verified
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[LOGIN OTP] for ${emailLower}: ${otp}`);
      lastOTP = otp;
      user.otp = otp;
      user.otpExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      await sendOTP(emailLower, otp);

      return res.status(403).json({
        verified: false,
        message: "Account not verified. A new OTP has been sent to your email."
      });
    }

    res.json({
      verified: true,
      message: "Login successful",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: (user.firstName[0] + user.lastName[0]).toUpperCase(),
        joined: user.joined
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Update Profile
router.post("/update-profile", async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: (user.firstName[0] + user.lastName[0]).toUpperCase(),
        joined: user.joined
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error updating profile." });
  }
});

// Update Password
router.post("/update-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error updating password." });
  }
});

// Delete Account
router.post("/delete-account", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailLower = email.toLowerCase().trim();
    const result = await User.deleteOne({ email: emailLower });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error deleting account." });
  }
});

module.exports = router;