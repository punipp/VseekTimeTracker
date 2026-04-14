import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  Fade,
  IconButton,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import { push, ref, get } from "firebase/database";
import { db, auth } from "../firebase";

function Reimbursement() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [userName, setUserName] = useState("");

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

  const submitRequest = async () => {
    await push(ref(db, "reimbursements"), {
      userId: auth.currentUser.uid,
      userName: userName,
      email: auth.currentUser.email,
      amount,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    alert("Reimbursement request submitted");
    setAmount("");
    setDescription("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        p: 2,
      }}
    >
      {/* 🔙 FLOATING BACK BUTTON (OUTSIDE CARD) */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          "&:hover": {
            background: "rgba(255,255,255,0.3)",
            transform: "scale(1.1)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Fade in>
        <Card
          sx={{
            width: 450,
            borderRadius: 4,
            p: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* TITLE */}
          <Typography variant="h6" fontWeight="bold">
            Reimbursement Request
            {userName && (
              <span style={{ fontWeight: 400, color: "#666" }}>
                {" "}
                - {userName}
              </span>
            )}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* FORM */}
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={submitRequest}
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: 2,
              fontWeight: "bold",
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              textTransform: "none",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 10px 30px rgba(102,126,234,0.4)",
              },
            }}
          >
            Submit Request
          </Button>
        </Card>
      </Fade>
    </Box>
  );
}

export default Reimbursement;