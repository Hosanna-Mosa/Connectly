// import User from "../models/userModel.js";
const User = require("../models/userModel.js");
const Meeting = require("../models/meeting.js");
const { status } = require("http-status");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

module.exports.register = async (req, res) => {
  const { name, email, userName, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ userName }, { email }] });
    if (user) {
      if (user.email === email) {
        return res
          .status(status.FOUND)
          .json({ message: "Email already registered" });
      }
      return res.status(status.FOUND).json({ message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      userName,
      password: hashedPassword,
    });

    await newUser.save();
    return res
      .status(status.CREATED)
      .json({ message: "User Registered Successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: `Something went wrong while registering user: ${error.message}`,
    });
  }
};

module.exports.login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const userData = await User.findOne({ userName });

    if (!userData) {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Username does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (isPasswordCorrect) {
      const token = crypto.randomBytes(20).toString("hex");
      userData.token = token;
      await userData.save();
      return res.status(status.OK).json({ token });
    }
    return res
      .status(status.UNAUTHORIZED)
      .json({ message: "Incorrect password" });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

module.exports.getUserHistory = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user.userName });
    return res.json(meetings);
  } catch (error) {
    console.error("Get user history error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

module.exports.addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  if (!token || !meeting_code) {
    return res
      .status(400)
      .json({ message: "Token and meeting code are required" });
  }

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newMeeting = new Meeting({
      user_id: user.userName,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res.status(status.CREATED).json({ message: "Added to History" });
  } catch (error) {
    console.error("Add to history error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    return res.status(200).json({
      message: "OTP sent to your email",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};
