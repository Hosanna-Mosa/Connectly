import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
// import {Button} from "@mui/material";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { ButtonBase, Snackbar } from "@mui/material";
import { AuthContext } from "../contexts/Authcontext.jsx";
import "../utils/Authencation.css";

const defaultTheme = createTheme();

export default function Authencation() {
  const [userName, setUserName] = React.useState();
  const [name, setName] = React.useState();
  const [password, setPassword] = React.useState();
  const [formState, setFormState] = React.useState(1);
  const [error, setError] = React.useState();
  const [message, setMessage] = React.useState();
  const [open, setOpen] = React.useState(false);

  const { handleRegister , handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    console.log("Camed to auth");

    try {
      if (formState === 0) {
        setUserName("");
        setPassword("");
        let request = await handleLogin(userName,password);
        console.log(request);
        setOpen(true);
        setMessage(request);
        setError("");
        // setUserName("");
        // setPassword("");
        // setFormState(0);
        // setName();
        
      }
      if (formState === 1) {
        let request = await handleRegister(name, userName, password);
        console.log(request);

        setOpen(true);
        setMessage(request);
        setError("");
        setUserName("");
        setPassword("");
        setFormState(0);
      }
    } catch (error) {
    //   return console.log(error);

      let message = error.response.data.message;
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <div>
                <Button
                  variant={formState === 0 ? "contained" : ""}
                  onClick={() => {
                    setFormState(0);
                  }}
                >
                  Sing in
                </Button>
                <Button
                  variant={formState === 1 ? "contained" : ""}
                  onClick={() => {
                    setFormState(1);
                  }}
                >
                  Sing Up
                </Button>
              </div>
              <Box
                // component="form"
                noValidate
                onSubmit={handleAuth}
                sx={{ mt: 1 }}
              >
                {formState === 1 ? (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="name"
                    name="name"
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    // autoFocus
                  />
                ) : null}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="userName"
                  label="username"
                  name="userName"
                  value={userName}
                  //   autoComplete="email"
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                //   autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                //   autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <p style={{ color: "red" }}>{error}</p>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleAuth}
                >
                  
                  {formState === 0 ? "Login" : "Register"}
                </Button>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </div>
              </Box>
            </Box>
          </Paper>
        </div>
      </div>
      <Snackbar open={open} autoHideDuration={3} message={message} />
    </ThemeProvider>
  );
}
