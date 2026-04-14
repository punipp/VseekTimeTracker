import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, onValue } from "firebase/database";

// 👁️ ICONS
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Please enter username/email and password");
      return;
    }

    try {
      setLoading(true);

      let emailToUse = identifier;

      // 🔥 username → email conversion
      if (!identifier.includes("@")) {
        const usersRef = ref(db, "users");

        const email = await new Promise((resolve) => {
          onValue(
            usersRef,
            (snapshot) => {
              const data = snapshot.val();
              if (!data) return resolve(null);

              const found = Object.values(data).find(
                (u) =>
                  u.name?.toLowerCase() === identifier.toLowerCase()
              );

              resolve(found?.email || null);
            },
            { onlyOnce: true }
          );
        });

        if (!email) {
          alert("Username not found");
          return;
        }

        emailToUse = email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!identifier) {
      alert("Enter email or username first");
      return;
    }

    let emailToSend = identifier;

    if (!identifier.includes("@")) {
      const usersRef = ref(db, "users");

      const email = await new Promise((resolve) => {
        onValue(
          usersRef,
          (snapshot) => {
            const data = snapshot.val();
            if (!data) return resolve(null);

            const found = Object.values(data).find(
              (u) =>
                u.name?.toLowerCase() === identifier.toLowerCase()
            );

            resolve(found?.email || null);
          },
          { onlyOnce: true }
        );
      });

      if (!email) {
        alert("Username not found");
        return;
      }

      emailToSend = email;
    }

    try {
      await sendPasswordResetEmail(auth, emailToSend);
      alert("Password reset email sent!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1976d2, #42a5f5)",
      }}
    >
      <Container maxWidth="sm">
        <Box display="flex" alignItems="center" minHeight="100vh">
          <Paper sx={{ p: 4, borderRadius: 3, width: "100%" }}>

            <Typography variant="h4" align="center">
              Timesheet Tracker
            </Typography>

            <Typography align="center" gutterBottom>
              Login to your account
            </Typography>

            <Box component="form" onSubmit={handleLogin}>
              
              {/* EMAIL / USERNAME */}
              <TextField
                label="Email or Username"
                fullWidth
                margin="normal"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              {/* PASSWORD WITH SHOW/HIDE */}
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              {/* FORGOT PASSWORD */}
              <Button
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </Button>
            </Box>

            <Typography align="center" mt={2}>
              Don't have an account?{" "}
              <span
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </Typography>

          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;