import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, onValue, push, update, get } from "firebase/database";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import LogoutIcon from "@mui/icons-material/Logout";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SearchIcon from "@mui/icons-material/Search";

function Dashboard() {
  const navigate = useNavigate();
const [showUsers, setShowUsers] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [amount, setAmount] = useState("");
const [desc, setDesc] = useState("");
const [location, setLocation] = useState(null);
const [placeName, setPlaceName] = useState("");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState("Null");

  const [entries, setEntries] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);

  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- AUTH ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);
const exportPDF = () => {
  const doc = new jsPDF();

// const exportCSV = () => {
//   const doc = new CSV();

  doc.setFontSize(16);
  doc.text("Timesheet Report", 14, 15);

  const tableData = entries.map((e) => [
    e.userName,
    e.date,
    e.loginTime,
    e.logoutTime,
    e.totalHours,
  ]);
const handleCheckIn = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const loc = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };

    setLocation(loc);

    setActiveSession({
      loginTime: new Date(),
      location: loc,
    });
  });
};
  autoTable(doc, {
    head: [["Name", "Date", "Login", "Logout", "Hours"]],
    body: tableData,
    startY: 25,
  });

  doc.save("timesheet.pdf");
};
  // ---------------- USERS ----------------
  useEffect(() => {
    if (!user) return;

    const usersRef = ref(db, "users");

    onValue(usersRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const list = Object.values(data);

      setUsers(list);

      const current = list.find(
        (u) => u.email?.toLowerCase() === user.email?.toLowerCase()
      );

      if (current) {
        setUserName(current.name || user.email);
        setIsAdmin(current.role === "admin");
      }
    });
  }, [user]);
  const submitReimbursement = async () => {
  if (!amount || !desc) return alert("Fill all fields");

  await push(ref(db, "reimbursements"), {
    userId: user.uid,
    userName: userName,
    email: user.email,
    amount,
    description: desc,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  setAmount("");
  setDesc("");
  alert("Reimbursement submitted");
};

  // ---------------- TIMESHEET ----------------
  useEffect(() => {
    if (!user) return;

    const refSheet = ref(db, "timesheets");

    onValue(refSheet, (snap) => {
      const data = snap.val();
      if (!data) return setEntries([]);

      let list = Object.values(data);

      if (!isAdmin) {
        list = list.filter((e) => e.userId === user.uid);
      }

      if (isAdmin && selectedUser !== "ALL") {
        list = list.filter((e) => e.userId === selectedUser.uid);
      }

      setEntries(list.reverse());
    });
  }, [user, isAdmin, selectedUser]);

  // ---------------- LEAVES ----------------
  useEffect(() => {
    if (!user) return;

    const refLeaves = ref(db, "leaves");

    onValue(refLeaves, (snap) => {
      const data = snap.val();
      if (!data) return setLeaves([]);

      let list = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));

      if (!isAdmin) {
        list = list.filter((l) => l.userId === user.uid);
      }

      if (isAdmin && selectedUser !== "ALL") {
        list = list.filter((l) => l.userId === selectedUser.uid);
      }

      setLeaves(list.reverse());
    });
  }, [user, isAdmin, selectedUser]);

  // ---------------- REIMBURSEMENT ----------------
  useEffect(() => {
    if (!user) return;

    const refData = ref(db, "reimbursements");

    onValue(refData, (snap) => {
      const data = snap.val();
      if (!data) return setReimbursements([]);

      let list = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));

      if (!isAdmin) {
        list = list.filter((r) => r.userId === user.uid);
      }

      if (isAdmin && selectedUser !== "ALL") {
        list = list.filter((r) => r.userId === selectedUser.uid);
      }

      setReimbursements(list.reverse());
    });
  }, [user, isAdmin, selectedUser]);

  // ---------------- CHECK IN ----------------
  const handleCheckIn = () => {
    setActiveSession({ loginTime: new Date() });
  };

  // ---------------- CHECK OUT ----------------
  const handleCheckOut = async () => {
    const logout = new Date();
    const diff =
      (logout - activeSession.loginTime) / (1000 * 60 * 60);

    await push(ref(db, "timesheets"), {
      userId: user.uid,
      userName: userName,
      date: new Date().toLocaleDateString(),
      loginTime: activeSession.loginTime.toLocaleTimeString(),
      logoutTime: logout.toLocaleTimeString(),
      totalHours: diff.toFixed(2),
    });

    setActiveSession(null);
  };

  // ---------------- STATUS UPDATE ----------------
  const updateStatus = (path, id, status) => {
    update(ref(db, `${path}/${id}`), { status });
  };

  // ---------------- SEARCH USERS ----------------
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f7ff" }}>

      {/* SIDEBAR */}
      <Box sx={{ width: 260, bgcolor: "#111827", color: "#fff", p: 2 }}>

        <Typography fontWeight="bold">Vseek Ventures</Typography>
        <Divider sx={{ bgcolor: "#333", my: 2 }} />

        <Stack spacing={2}>

          {/* <Button sx={{ color: "#fff" }}>
            Dashboard
          </Button> */}

          <Button
            sx={{ color: "#fff" }}
            startIcon={<EventNoteIcon />}
            onClick={() => navigate("/leave")}
          >
            Leave
          </Button>
{/* <Button sx={{ color: "#fff" }} onClick={exportCSV}>
  Export CSV
</Button> */}

<Button sx={{ color: "#fff", ml: 1 }} onClick={exportPDF}>
  Export PDF
</Button>
          <Button
            sx={{ color: "#fff" }}
            startIcon={<AttachMoneyIcon />}
            onClick={() => navigate("/reimbursement")}
          >
            Reimbursement
          </Button>
           <Button
            sx={{ color: "#fff" }}
            startIcon={<LogoutIcon />}
            onClick={() => signOut(auth)}
          >
            Logout
          </Button>

          {/* USER SEARCH (ADMIN) */}
          {/* USER SEARCH (ADMIN) */}
{isAdmin && (
  <>
    <Divider sx={{ bgcolor: "#333", my: 1 }} />

    {/* TOGGLE BUTTON */}
    <Button
      fullWidth
      variant="outlined"
      sx={{ color: "#fff", borderColor: "#555" }}
      onClick={() => setShowUsers((prev) => !prev)}
    >
      {showUsers ? "Hide Users" : "View All Users"}
    </Button>

    {/* SEARCH */}
    {showUsers && (
      <TextField
        size="small"
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          bgcolor: "#fff",
          borderRadius: 1,
          mt: 1,
        }}
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
      />
    )}

    {/* USER LIST */}
    {showUsers && (
      <List dense>
        {/* ALL USERS */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setSelectedUser(null)}>
            {/* <ListItemText primary="All Users" /> */}
          </ListItemButton>
        </ListItem>

        {/* FILTERED USERS */}
        {filteredUsers.map((u) => (
          <ListItem key={u.uid} disablePadding>
            <ListItemButton
              selected={selectedUser?.uid === u.uid}
              onClick={() => setSelectedUser(u)}
            >
              <ListItemText primary={u.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    )}
  </>
)}

        </Stack>
      </Box>

      {/* MAIN */}
   <Box
  sx={{
    flex: 1,
    p: 3,
    background: "linear-gradient(135deg,#f4f7ff,#eef2ff)",
    minHeight: "100vh",
  }}
>

  {/* HEADER */}
  <Card
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 4,
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(8px)",
      transition: "0.3s",
      "&:hover": { transform: "translateY(-2px)" },
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">

      <Box display="flex" gap={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#6366f1", boxShadow: 2 }}>
          {userName?.charAt(0)}
        </Avatar>

        <Box>
          <Typography variant="h5" fontWeight="800">
            {isAdmin && selectedUser
              ? `Viewing ${selectedUser?.name || "User"}`
              : `Welcome, ${userName}`}
          </Typography>

          <Typography sx={{ opacity: 0.7 }}>
            {isAdmin ? "Admin Control Panel" : "Employee Portal"}
          </Typography>
        </Box>
      </Box>

    </Box>
  </Card>

  {/* ATTENDANCE */}
  <Card
  sx={{
    p: 1,
    mb: .5,
    borderRadius: 2,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    transition: "0.3s",
    "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  }}
>
  <Typography variant="h6" fontWeight="700" mb={2}>
    Attendance
  </Typography>

  {!activeSession ? (
    <Button
      variant="contained"
      sx={{
        borderRadius: 3,
        textTransform: "none",
        px: 3,
        py: 1,
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      }}
      onClick={handleCheckIn}
    >
      Check In
    </Button>
  ) : (
    <Stack spacing={2}>

      {/* CHECK-IN TIME */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Checked in at {activeSession.loginTime.toLocaleTimeString()}
      </Alert>

      {/* LOCATION CARD */}
      {location && (
        <Card
          sx={{
            p: 2,
            borderRadius: 3,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography fontSize={13} fontWeight={600}>
            📍 Live Location
          </Typography>

          <Typography fontSize={12} sx={{ mt: 0.5, color: "#475569" }}>
            {placeName}
          </Typography>

          <Typography fontSize={12} sx={{ mt: 0.5 }}>
            Latitude: {location.lat.toFixed(4)}
          </Typography>

          <Typography fontSize={12}>
            Longitude: {location.lng.toFixed(4)}
          </Typography>

          {/* GOOGLE MAPS BUTTON */}
          <Button
            size="small"
            sx={{
              mt: 1,
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              color: "#2563eb",
              paddingLeft: 0,
              "&:hover": {
                background: "transparent",
                textDecoration: "underline",
              },
            }}
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                "_blank"
              )
            }
          >
            🗺️ Open in Google Maps
          </Button>
        </Card>
      )}

      {/* CHECK OUT BUTTON */}
      <Button
        variant="contained"
        color="error"
        sx={{ borderRadius: 3 }}
        onClick={handleCheckOut}
      >
        Check Out
      </Button>
    </Stack>
  )}
</Card>

  {/* LEAVES */}
  <Card sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 2 }}>
    <Typography variant="h6" fontWeight="700" mb={2}>
      Leaves {isAdmin && selectedUser && `- ${selectedUser?.name}`}
    </Typography>

    <Table>
      <TableHead>
        <TableRow sx={{ background: "#f1f5f9" }}>
          <TableCell><b>Name</b></TableCell>
          <TableCell><b>Reason</b></TableCell>
          <TableCell><b>Status</b></TableCell>
          {isAdmin && <TableCell><b>Action</b></TableCell>}
        </TableRow>
      </TableHead>

      <TableBody>
        {leaves.map((l) => (
          <TableRow
            key={l.id}
            hover
            sx={{
              "&:hover": { background: "#f8fafc" },
            }}
          >
            <TableCell>{l.userName}</TableCell>
            <TableCell sx={{ color: "#475569" }}>{l.reason}</TableCell>

            <TableCell>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    l.status === "approved"
                      ? "#dcfce7"
                      : l.status === "rejected"
                      ? "#fee2e2"
                      : "#fef9c3",
                  color:
                    l.status === "approved"
                      ? "#166534"
                      : l.status === "rejected"
                      ? "#991b1b"
                      : "#92400e",
                }}
              >
                {l.status?.toUpperCase()}
              </span>
            </TableCell>

            {isAdmin && (
              <TableCell>
                <Button size="small" sx={{ mr: 1 }} onClick={() => updateStatus("leaves", l.id, "approved")}>
                  Approve
                </Button>

                <Button size="small" color="error" onClick={() => updateStatus("leaves", l.id, "rejected")}>
                  Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>

  {/* TIMESHEET */}
  <Card sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 2 }}>
    <Typography variant="h6" fontWeight="700" mb={2}>
      Timesheet {isAdmin && selectedUser && `- ${selectedUser?.name}`}
    </Typography>

    <Table>
      <TableHead>
        <TableRow sx={{ background: "#f1f5f9" }}>
          <TableCell><b>Name</b></TableCell>
          <TableCell><b>Date</b></TableCell>
          <TableCell><b>Login</b></TableCell>
          <TableCell><b>Logout</b></TableCell>
          <TableCell><b>Hours</b></TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {entries.map((e, i) => (
          <TableRow
            key={i}
            hover
            sx={{ "&:hover": { background: "#f8fafc" } }}
          >
            <TableCell>{e.userName}</TableCell>
            <TableCell>{e.date}</TableCell>
            <TableCell sx={{ color: "#10b981" }}>{e.loginTime}</TableCell>
            <TableCell sx={{ color: "#ef4444" }}>{e.logoutTime}</TableCell>
            <TableCell>
              <b style={{ color: "#6366f1" }}>{e.totalHours}</b>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>

  {/* REIMBURSEMENTS */}
  <Card sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}>
    <Typography variant="h6" fontWeight="700" mb={2}>
      Reimbursements {isAdmin && selectedUser && `- ${selectedUser?.name}`}
    </Typography>

    <Table>
      <TableHead>
        <TableRow sx={{ background: "#f1f5f9" }}>
          <TableCell><b>Name</b></TableCell>
          <TableCell><b>Amount</b></TableCell>
          <TableCell><b>Description</b></TableCell>
          <TableCell><b>Status</b></TableCell>
          {isAdmin && <TableCell><b>Action</b></TableCell>}
        </TableRow>
      </TableHead>

      <TableBody>
        {reimbursements.map((r) => (
          <TableRow
            key={r.id}
            hover
            sx={{ "&:hover": { background: "#f8fafc" } }}
          >
            <TableCell>{r.userName}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>₹{r.amount}</TableCell>
            <TableCell sx={{ color: "#475569" }}>{r.description}</TableCell>

            <TableCell>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    r.status === "approved"
                      ? "#dcfce7"
                      : r.status === "rejected"
                      ? "#fee2e2"
                      : "#fef9c3",
                  color:
                    r.status === "approved"
                      ? "#166534"
                      : r.status === "rejected"
                      ? "#991b1b"
                      : "#92400e",
                }}
              >
                {r.status?.toUpperCase()}
              </span>
            </TableCell>

            {isAdmin && (
              <TableCell>
                <Button size="small" sx={{ mr: 1 }} onClick={() => updateStatus("reimbursements", r.id, "approved")}>
                  Approve
                </Button>

                <Button size="small" color="error" onClick={() => updateStatus("reimbursements", r.id, "rejected")}>
                  Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>

</Box>
    </Box>
  );
}

export default Dashboard;