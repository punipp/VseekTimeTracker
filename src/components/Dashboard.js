import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
} from "@mui/material";

import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, push, onValue } from "firebase/database";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Dashboard() {
  const user = auth.currentUser;

  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 🔥 CHECK ADMIN
  useEffect(() => {
    if (!user) return;

    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list = Object.values(data);

        // set user list for admin panel
        setUsers(list);

        list.forEach((u) => {
          if (
            u.email?.toLowerCase() === user.email.toLowerCase() &&
            u.role === "admin"
          ) {
            setIsAdmin(true);
          }
        });
      }
    });
  }, [user]);

  // 📥 FETCH TIMESHEETS
  useEffect(() => {
    if (!user) return;

    const timesheetRef = ref(db, "timesheets");

    onValue(timesheetRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setEntries([]);
        return;
      }

      const list = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));

      // 🔥 FILTER BASED ON SELECTION
      let filtered = list;

      if (!isAdmin) {
        filtered = list.filter((e) => e.userId === user.uid);
      }

      if (isAdmin && selectedUser) {
        filtered = list.filter((e) => e.userId === selectedUser.uid);
      }

      setEntries(filtered.reverse());
    });
  }, [isAdmin, user, selectedUser]);

  // 🟢 CLOCK IN
  const handleLoginTime = () => {
    setCurrentShift({ loginTime: new Date() });
  };

  // 🔴 CLOCK OUT
  const handleLogoutTime = () => {
    const logoutTime = new Date();
    const diff =
      (logoutTime - currentShift.loginTime) / (1000 * 60 * 60);

    const entry = {
      email: user.email,
      userId: user.uid,
      date: new Date().toLocaleDateString(),
      loginTime: currentShift.loginTime.toLocaleTimeString(),
      logoutTime: logoutTime.toLocaleTimeString(),
      totalHours: diff.toFixed(2),
    };

    push(ref(db, "timesheets"), entry);
    setCurrentShift(null);
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
  };

  // 📄 EXPORT PDF (ADMIN)
  const exportPDF = () => {
    const doc = new jsPDF();

    const name = selectedUser?.name || selectedUser?.email || "User";

    doc.text(`Timesheet Report - ${name}`, 14, 15);

    const tableData = entries.map((e) => [
      e.date,
      e.loginTime,
      e.logoutTime,
      e.totalHours,
    ]);

    autoTable(doc, {
      head: [["Date", "Login", "Logout", "Hours"]],
      body: tableData,
      startY: 25,
    });

    doc.save(`${name}-timesheet.pdf`);
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: "100vh", background: "#f4f6f8", py: 4 }}>
      <Container maxWidth="lg">

        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5">
            {isAdmin ? "Admin Dashboard 👑" : "User Dashboard"}
          </Typography>

          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {/* 🔥 ADMIN USER LIST */}
        {isAdmin && (
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6">Users</Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
              {users.map((u, i) => (
                <Button
                  key={i}
                  variant={
                    selectedUser?.uid === u.uid
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setSelectedUser(u)}
                >
                  {u.name || u.email}
                </Button>
              ))}
            </Box>

            {selectedUser && (
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={exportPDF}
              >
                Export PDF
              </Button>
            )}
          </Card>
        )}

        {/* SHIFT CONTROLS */}
        {!isAdmin && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Shift Controls</Typography>

              <Box mt={2} display="flex" gap={2}>
                <Button variant="contained" onClick={handleLoginTime}>
                  Clock In
                </Button>

                <Button variant="contained" onClick={handleLogoutTime}>
                  Clock Out
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* TABLE */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Timesheet Records
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Login</TableCell>
                <TableCell>Logout</TableCell>
                <TableCell>Hours</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No records
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.loginTime}</TableCell>
                    <TableCell>{e.logoutTime}</TableCell>
                    <TableCell>{e.totalHours} hrs</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

      </Container>
    </Box>
  );
}

export default Dashboard;