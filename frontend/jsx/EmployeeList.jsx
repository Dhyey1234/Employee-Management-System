import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [retirementFilter, setRetirementFilter] = useState("All"); // New retirement filter
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            getEmployees {
              _id
              FirstName
              LastName
              Age
              DateOfJoining
              Title
              Department
              EmployeeType
              CurrentStatus
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.getEmployees) {
          setEmployees(res.data.getEmployees);
        }
      })
      .catch(console.error);
  }, []);

  // Calculate months left until retirement (65 years)
  const getMonthsUntilRetirement = (emp) => {
    const doj = new Date(emp.DateOfJoining);
    const today = new Date();
    const yearsWorked = (today - doj) / (1000 * 60 * 60 * 24 * 365.25);
    const currentAge = emp.Age + yearsWorked;
    const monthsLeft = (65 - currentAge) * 12;
    return monthsLeft;
  };

  const handleDelete = async (id, currentStatus) => {
    if (currentStatus) {
      alert("CAN’T DELETE EMPLOYEE – STATUS ACTIVE");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) return;

    await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation($id: ID!) {
            deleteEmployee(id: $id)
          }
        `,
        variables: { id },
      }),
    });

    setEmployees((prev) => prev.filter((emp) => emp._id !== id));
  };

  // Filtering employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesType = filterType === "All" || emp.EmployeeType === filterType;
    const matchesSearch = `${emp.FirstName} ${emp.LastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply retirement filter if set
    if (retirementFilter === "UpcomingRetirement") {
      const monthsLeft = getMonthsUntilRetirement(emp);
      if (monthsLeft < 0 || monthsLeft > 6) return false; // only include if retiring in next 6 months
    }

    return matchesType && matchesSearch;
  });

  return (
    <>
      <h2 style={{ marginBottom: "20px" }}>Employee List</h2>

      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "10px",
          marginRight: "10px",
          width: "250px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "10px",
          marginRight: "10px",
          width: "250px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <option value="All">All Types</option>
        <option value="FullTime">Full Time</option>
        <option value="PartTime">Part Time</option>
        <option value="Contract">Contract</option>
        <option value="Seasonal">Seasonal</option>
      </select>

      {/* New filter for Upcoming Retirement */}
      <select
        value={retirementFilter}
        onChange={(e) => setRetirementFilter(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "10px",
          marginRight: "10px",
          width: "250px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <option value="All">All Employees</option>
        <option value="UpcomingRetirement">Upcoming Retirement (6 months)</option>
      </select>

      {filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Joining Date</th>
              <th>Title</th>
              <th>Department</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.FirstName} {emp.LastName}</td>
                <td>{emp.Age}</td>
                <td>{new Date(emp.DateOfJoining).toLocaleDateString()}</td>
                <td>{emp.Title}</td>
                <td>{emp.Department}</td>
                <td>{emp.EmployeeType}</td>
                <td>{emp.CurrentStatus ? "Working" : "Left"}</td>
                <td>
                  <button
                    onClick={() => navigate(`/employee/${emp._id}`)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      backgroundColor: "#A68A64", // light brown from EmployeeDetails
                      fontWeight: "bold",
                      marginRight: "8px",
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id, emp.CurrentStatus)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      backgroundColor: "#C2B280", // pale olive from EmployeeDetails
                      fontWeight: "bold",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default EmployeeList;
