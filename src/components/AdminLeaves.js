import React, { useEffect, useState } from "react";
import { Card, Button, Typography, Box, Chip } from "@mui/material";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const leaveRef = ref(db, "leaves");

    onValue(leaveRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setLeaves(list.reverse());
      }
    });
  }, []);

  const updateStatus = (id, status) => {
    update(ref(db, `leaves/${id}`), { status });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Leave Requests</Typography>

      {leaves.map((l) => (
        <Card key={l.id} sx={{ p: 2, my: 2 }}>
          <Typography>{l.email}</Typography>
          <Typography>{l.reason}</Typography>

          <Chip label={l.status} sx={{ my: 1 }} />

          <Box>
            <Button
              onClick={() => updateStatus(l.id, "approved")}
              color="success"
            >
              Approve
            </Button>

            <Button
              onClick={() => updateStatus(l.id, "rejected")}
              color="error"
            >
              Reject
            </Button>
          </Box>
        </Card>
      ))}
    </Box>
  );
}

export default AdminLeaves;