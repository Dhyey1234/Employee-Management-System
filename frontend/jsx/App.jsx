import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EmployeeList from "./EmployeeList";
import EmployeeCreate from "./EmployeeCreate";
import EmployeeDetails from "./EmployeeDetails";
import UpcomingRetirement from "./UpcomingRetirement"; // 👈 New import

const App = () => {
  const containerStyle = {
    fontFamily: "Segoe UI, sans-serif",
    padding: "30px",
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "#F4F4F2",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
  };

  const navStyle = {
    marginBottom: "30px",
    display: "flex",
    gap: "20px",
  };

  const linkStyle = {
    color: "#5D5C61",
    fontWeight: "600",
    fontSize: "16px",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: "#E8E8E8",
    transition: "background-color 0.2s",
  };

  return (
    <Router>
      <div style={containerStyle}>
        <nav style={navStyle}>
          <Link to="/" style={linkStyle}>Employee List</Link>
          <Link to="/create" style={linkStyle}>Add Employee</Link>
          <Link to="/upcoming-retirement" style={linkStyle}>Upcoming Retirement</Link> {/* 👈 New link */}
        </nav>
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/create" element={<EmployeeCreate />} />
          <Route path="/employee/:id" element={<EmployeeDetails />} />
          <Route path="/upcoming-retirement" element={<UpcomingRetirement />} /> {/* 👈 New route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
