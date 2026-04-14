import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useNavigate } from "react-router-dom";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { push, ref, get } from "firebase/database";
import { db, auth } from "../firebase";

function Leave() {
  const navigate = useNavigate();

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [reason, setReason] = useState("");

  const [userName, setUserName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------- GET USER ----------------
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await get(ref(db, `users/${user.uid}`));

      if (snap.exists()) {
        setUserName(snap.val().name || user.email);
      } else {
        setUserName(user.email);
      }
    };

    fetchUser();
  }, []);

  // ---------------- DAYS ----------------
  const getDays = () => {
    if (!from || !to) return 0;
    const diff = dayjs(to).diff(dayjs(from), "day") + 1;
    return diff > 0 ? diff : 0;
  };

  // ---------------- SUBMIT ----------------
  const submitLeave = async () => {
    setError("");
    setSuccess("");

    const user = auth.currentUser;

    if (!user) return setError("User not logged in");
    if (!from || !to || !reason) return setError("Please fill all fields");

    if (dayjs(to).isBefore(dayjs(from))) {
      return setError("End date cannot be before start date");
    }

    try {
      setLoading(true);

      await push(ref(db, "leaves"), {
        userId: user.uid,
        userName,
        email: user.email,
        from: from.format("YYYY-MM-DD"),
        to: to.format("YYYY-MM-DD"),
        reason,
        days: getDays(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSuccess("Leave request submitted successfully 🎉");

      setFrom(null);
      setTo(null);
      setReason("");
    } catch (err) {
      setError("Failed to submit leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at top,#1e293b,#0f172a)",
          p: 2,
        }}
      >
        <Card
          sx={{
            width: 520,
            p: 3,
            borderRadius: 4,
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* TOP BAR */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Tooltip title="Back">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                  "&:hover": { background: "rgba(255,255,255,0.2)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            <Typography variant="h6" fontWeight="bold">
              Leave Request
            </Typography>

            <Box width={40} />
          </Box>

          <Typography sx={{ opacity: 0.7, mt: 1, mb: 2 }}>
            {userName}
          </Typography>

          <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />

          {/* ALERTS */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* FORM */}
          <Stack spacing={2.5}>
            <DatePicker
              label="From Date"
              value={from}
              onChange={setFrom}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                  },
                },
              }}
            />

            <DatePicker
              label="To Date"
              value={to}
              onChange={setTo}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                  },
                },
              }}
            />

            <TextField
              label="Reason for Leave"
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              sx={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            />
          </Stack>

          {/* SUMMARY */}
          {getDays() > 0 && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Total Leave: ${getDays()} day(s)`}
                sx={{
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              />
            </Box>
          )}

          {/* BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={submitLeave}
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: 3,
              fontWeight: "bold",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            {loading ? "Submitting..." : "Apply Leave"}
          </Button>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}

export default Leave;