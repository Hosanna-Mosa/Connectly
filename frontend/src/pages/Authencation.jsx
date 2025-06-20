import * as React from "react";
//import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
// import {Button} from "@mui/material";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
//import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { ButtonBase, Snackbar } from "@mui/material";
import { AuthContext } from "../contexts/Authcontext.jsx";
import "../utils/Authencation.css";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import BadgeIcon from "@mui/icons-material/Badge";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Helmet } from "react-helmet";
import { Suspense, memo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const Avatar = React.lazy(() => import("@mui/material/Avatar"));
const LockOutlinedIcon = React.lazy(
  () => import("@mui/icons-material/LockOutlined")
);

const defaultTheme = createTheme();

const Authencation = memo(function Authencation() {
  const [userName, setUserName] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [formState, setFormState] = React.useState(1);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState("");
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotValue, setForgotValue] = React.useState("");
  const [forgotLoading, setForgotLoading] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    if (strength === 5) return "Strong";
    return "Weak";
  };

  React.useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const validateFields = () => {
    if (formState === 1) {
      if (!name || name.trim().length < 2) {
        setError("Name is required (min 2 characters)");
        return false;
      }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setError("A valid email is required");
        return false;
      }
    }
    if (!userName || userName.trim().length < 3) {
      setError("Username is required (min 3 characters)");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (formState === 1) {
      // Registration: enforce strong password
      if (passwordStrength !== "Strong") {
        setError(
          "Password must be Strong (min 8 chars, uppercase, lowercase, number, special char)"
        );
        return false;
      }
    }
    return true;
  };

  const  handleAuth = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!validateFields()) return;
    try {
      if (formState === 0) {
        setUserName("");
        setPassword("");
        let request = await handleLogin(userName, password);
        setOpen(true);
        setMessage(request);
        setError("");
      } 
      if (formState === 1) {
        let request = await handleRegister(name, email, userName, password);
        setOpen(true);
        setMessage(request);
        setError("");
        setUserName("");
        setPassword("");
        setFormState(0);
      }
    } catch (error) {
      let message = error.response?.data?.message || "Authentication failed";
      setError(message);
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    // Simulate API call
    setTimeout(() => {
      setForgotLoading(false);
      setForgotOpen(false);
      setOpen(true);
      setMessage(
        `If an account exists for '${forgotValue}', a password reset link has been sent.`
      );
      setForgotValue("");
    }, 1500);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Helmet>
        <title>Connectly | Authentication</title>
        <meta
          name="description"
          content="Sign in or sign up to Connectly, the best way to connect with your loved ones via secure video calls."
        />
        <meta
          name="keywords"
          content="Connectly, video call, sign in, sign up, authentication, secure, chat, connect"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          rel="preload"
          as="image"
          href="https://static.canva.com/static/images/android-192x192-2.png"
        />
        <link
          rel="icon"
          href="https://static.canva.com/static/images/android-192x192-2.png"
          sizes="192x192"
        />
      </Helmet>
      <div style={{ display: "flex", height: "100vh" }}>
        <CssBaseline />
        {/* Left side background */}
        <div
          style={{
            flex: 6,
            backgroundImage: "url(https://picsum.photos/800/600)",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#f5f5f5",
            backgroundSize: "cover",
            backgroundPosition: "left",
          }}
          className="randomimg"
          aria-label="Decorative background image"
        />
        {/* Right side form */}
        <div
          style={{
            flex: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={6}
            style={{
              padding: "50px", // Increased padding for more inner spacing
              width: "100%", // Makes it occupy full available space
              maxWidth: "600px", // Increased max width for a bigger form
            }}
            aria-label="Authentication form section"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Suspense fallback={<div style={{ height: 56 }}></div>}>
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: formState === 0 ? "secondary.main" : "#ff7043",
                  }}
                  alt={formState === 0 ? "Sign in icon" : "Sign up icon"}
                >
                  <Suspense fallback={null}>
                    <LockOutlinedIcon />
                  </Suspense>
                </Avatar>
              </Suspense>
              <div>
                <Button
                  variant={formState === 0 ? "contained" : ""}
                  onClick={() => {
                    setFormState(0);
                  }}
                  startIcon={<PersonIcon />}
                  aria-label="Switch to sign in form"
                >
                  Sing in
                </Button>
                <Button
                  variant={formState === 1 ? "contained" : ""}
                  onClick={() => {
                    setFormState(1);
                  }}
                  startIcon={<BadgeIcon />}
                  aria-label="Switch to sign up form"
                >
                  Sing Up
                </Button>
              </div>
              <Box
                noValidate
                component="form"
                onSubmit={handleAuth}
                sx={{ mt: 1 }}
                className={formState === 0 ? "signin-form" : "signup-form"}
                aria-label={formState === 0 ? "Sign in form" : "Sign up form"}
              >
                {formState === 1 ? (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ "aria-label": "Name" }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ "aria-label": "Email" }}
                    />
                  </>
                ) : null}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="userName"
                  label="Username"
                  name="userName"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ "aria-label": "Username" }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword((show) => !show)}
                          tabIndex={-1}
                          style={{ minWidth: 0, padding: 4 }}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ "aria-label": "Password" }}
                />
                {/* Password strength meter for signup */}
                {formState === 1 && passwordTouched && (
                  <div
                    style={{
                      margin: "8px 0 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          passwordStrength === "Strong"
                            ? "#43e97b"
                            : passwordStrength === "Medium"
                              ? "#ffa726"
                              : "#e53935",
                      }}
                    >
                      {passwordStrength} Password
                    </span>
                    <div
                      style={{
                        width: 80,
                        height: 8,
                        borderRadius: 6,
                        background: "#eee",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width:
                            passwordStrength === "Strong"
                              ? "100%"
                              : passwordStrength === "Medium"
                                ? "60%"
                                : "30%",
                          height: "100%",
                          background:
                            passwordStrength === "Strong"
                              ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"
                              : passwordStrength === "Medium"
                                ? "#ffa726"
                                : "#e53935",
                          transition: "width 0.3s, background 0.3s",
                        }}
                      />
                    </div>
                  </div>
                )}
                <p style={{ color: "red", minHeight: 24 }}>{error}</p>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleAuth}
                  endIcon={formState === 0 ? <LockIcon /> : <BadgeIcon />}
                >
                  {formState === 0 ? "Login" : "Register"}
                </Button>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Link
                    href="#"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setForgotOpen(true);
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </Box>
            </Box>
          </Paper>
        </div>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        ContentProps={{
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: "1.1rem",
            background:
              message && message.toLowerCase().includes("success")
                ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"
                : undefined,
            color:
              message && message.toLowerCase().includes("success")
                ? "#222"
                : undefined,
          },
        }}
        message={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {message && message.toLowerCase().includes("success") ? (
              <BadgeIcon style={{ color: "#43e97b" }} />
            ) : (
              <LockIcon style={{ color: "#fff" }} />
            )}
            {message}
          </span>
        }
        action={
          <Button
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpen(false)}
            style={{ minWidth: 0 }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        }
      />
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="forgot-email"
            label="Email or Username"
            type="text"
            fullWidth
            variant="standard"
            value={forgotValue}
            onChange={(e) => setForgotValue(e.target.value)}
            disabled={forgotLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)} disabled={forgotLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={!forgotValue || forgotLoading}
            variant="contained"
            color="primary"
          >
            {forgotLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
});

export default Authencation;
