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
  Card,
  LinearProgress,
  Divider,
  Alert,
  Grid,
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
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please enter email/username and password");
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
          setError("Username not found");
          return;
        }

        emailToUse = email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!identifier) {
      setError("Enter email or username first");
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
        setError("Username not found");
        return;
      }

      emailToSend = email;
    }

    try {
      await sendPasswordResetEmail(auth, emailToSend);
      setError("");
      alert("Password reset email sent!");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          top: "-100px",
          left: "-100px",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          bottom: "-50px",
          right: "-50px",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={3}
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Grid item xs={12}>
            <Card
              sx={{
                backdropFilter: "blur(10px)",
                background: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {loading && <LinearProgress />}

              <Box sx={{ p: 4 }}>
                {/* HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    gap: 1,
                  }}
                >
                  <WorkHistoryIcon
                    sx={{
                      fontSize: 40,
                      color: "#667eea",
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Timesheet Tracker
                  </Typography>
                </Box>

                <Typography
                  align="center"
                  sx={{
                    fontSize: "0.95rem",
                    color: "#666",
                    mb: 3,
                  }}
                >
                  Welcome back! Login to your account
                </Typography>

                {/* ERROR ALERT */}
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      animation: "slideDown 0.3s ease",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                {/* FORM */}
                <Box component="form" onSubmit={handleLogin}>
                  {/* EMAIL / USERNAME */}
                  <Box
                    sx={{
                      mb: 2.5,
                      animation: "fadeIn 0.5s ease",
                    }}
                  >
                    <TextField
                      label="Email or Username"
                      fullWidth
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon
                              sx={{
                                color:
                                  focusedField === "email"
                                    ? "#667eea"
                                    : "#999",
                                transition: "color 0.3s",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* PASSWORD WITH SHOW/HIDE */}
                  <Box
                    sx={{
                      mb: 2.5,
                      animation: "fadeIn 0.7s ease",
                    }}
                  >
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon
                              sx={{
                                color:
                                  focusedField === "password"
                                    ? "#667eea"
                                    : "#999",
                                transition: "color 0.3s",
                              }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowPassword(!showPassword)
                              }
                              edge="end"
                              disabled={loading}
                              sx={{
                                color: "#667eea",
                                "&:hover": {
                                  background:
                                    "rgba(102, 126, 234, 0.1)",
                                },
                              }}
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
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover fieldset": {
                            borderColor: "#667eea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#667eea",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* LOGIN BUTTON */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 1.5,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "1rem",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #667eea, #764ba2)",
                      textTransform: "none",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow:
                          "0 10px 30px rgba(102, 126, 234, 0.3)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #667eea, #764ba2)",
                        opacity: 0.7,
                      },
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  {/* FORGOT PASSWORD */}
                  <Button
                    fullWidth
                    onClick={handleForgotPassword}
                    disabled={loading}
                    sx={{
                      textTransform: "none",
                      color: "#667eea",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      "&:hover": {
                        background: "rgba(102, 126, 234, 0.08)",
                      },
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* SIGNUP LINK */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      color: "#666",
                    }}
                  >
                    Don't have an account?{" "}
                    <Typography
                      component="span"
                      onClick={() => navigate("/signup")}
                      sx={{
                        color: "#667eea",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          color: "#764ba2",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Sign Up
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}

export default Login;