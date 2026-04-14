import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, onValue } from "firebase/database";
import { Button, Box, Typography, Paper } from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AttendanceReport() {
  const user = auth.currentUser;

  const [records, setRecords] = useState([]);

  // 📥 FETCH DATA
  useEffect(() => {
    const timesheetRef = ref(db, "timesheets");

    onValue(timesheetRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) return setRecords([]);

      const list = Object.values(data);

      // 👉 FILTER ONLY CURRENT USER
      const filtered = list.filter((e) => e.userId === user.uid);

      setRecords(filtered);
    });
  }, [user]);

  // 📅 GET CURRENT MONTH DATA
  const getCurrentMonthData = () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    return records.filter((r) => {
      const date = new Date(r.date);
      return (
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });
  };

  // 📊 TOTAL HOURS
  const getTotalHours = (data) => {
    return data.reduce((sum, item) => {
      return sum + Number(item.totalHours || 0);
    }, 0);
  };

  // 📄 DOWNLOAD PDF
  const downloadPDF = () => {
    const data = getCurrentMonthData();

    const doc = new jsPDF();

    doc.text("Monthly Attendance Report", 14, 15);
    doc.text(`Name: ${user.email}`, 14, 25);

    const tableData = data.map((item) => [
      item.date,
      item.loginTime,
      item.logoutTime,
      item.totalHours,
    ]);

    autoTable(doc, {
      head: [["Date", "Login", "Logout", "Hours"]],
      body: tableData,
      startY: 35,
    });

    doc.text(
      `Total Hours: ${getTotalHours(data).toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("attendance-report.pdf");
  };

  const monthData = getCurrentMonthData();

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">
          Monthly Attendance Report
        </Typography>

        <Typography mt={1}>
          Total Records: {monthData.length}
        </Typography>

        <Typography>
          Total Hours: {getTotalHours(monthData).toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      </Paper>
    </Box>
  );
}

export default AttendanceReport;