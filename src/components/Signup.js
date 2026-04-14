import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, set } from "firebase/database";

function Signup() {
  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
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
      });

      alert("User created!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" align="center">
            Signup
          </Typography>

          <Box component="form" onSubmit={handleSignup}>
            
            {/* ✅ USERNAME FIELD */}
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Email"
              fullWidth
              margin="normal"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Signup
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Signup;