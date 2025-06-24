const { Router } = require("express");
const {
  register,
  login,
  addToHistory,
  getUserHistory,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/userController.js");
const bcrypt = require("bcrypt");

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

// export default router;
module.exports = router;


