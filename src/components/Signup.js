import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Grid,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, set } from "firebase/database";

// 🎨 ICONS
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

function Signup() {
  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // 🔐 VALIDATION
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ✅ SAVE USER DATA IN DATABASE
      await set(ref(db, "users/" + user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      alert("Account created successfully! Redirecting to login...");
      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
                    Create Account
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
                  Join us and start tracking your time
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
                <Box component="form" onSubmit={handleSignup}>
                  {/* USERNAME FIELD */}
                  <Box
                    sx={{
                      mb: 2.5,
                      animation: "fadeIn 0.5s ease",
                    }}
                  >
                    <TextField
                      label="Username"
                      fullWidth
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon
                              sx={{
                                color:
                                  focusedField === "name"
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

                  {/* EMAIL FIELD */}
                  <Box
                    sx={{
                      mb: 2.5,
                      animation: "fadeIn 0.6s ease",
                    }}
                  >
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
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

                  {/* PASSWORD FIELD */}
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

                  {/* CONFIRM PASSWORD FIELD */}
                  <Box
                    sx={{
                      mb: 3,
                      animation: "fadeIn 0.8s ease",
                    }}
                  >
                    <TextField
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon
                              sx={{
                                color:
                                  focusedField === "confirmPassword"
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
                                setShowConfirmPassword(
                                  !showConfirmPassword
                                )
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
                              {showConfirmPassword ? (
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

                  {/* SIGNUP BUTTON */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
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
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* LOGIN LINK */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      color: "#666",
                    }}
                  >
                    Already have an account?{" "}
                    <Typography
                      component="span"
                      onClick={() => navigate("/")}
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
                      Sign In
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

export default Signup;