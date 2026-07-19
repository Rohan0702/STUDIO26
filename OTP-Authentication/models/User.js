const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "Engineer" },
  otp: { type: String },
  otpExpire: { type: Date },
  isVerified: { type: Boolean, default: false },
  joined: { type: String, default: () => new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
