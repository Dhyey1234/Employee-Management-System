import React, { useEffect, useState } from "react";

const getMonthsUntilRetirement = (emp) => {
  const doj = new Date(emp.DateOfJoining);
  const today = new Date();
  const yearsWorked = (today - doj) / (1000 * 60 * 60 * 24 * 365.25);
  const currentAge = emp.Age + yearsWorked;
  const monthsLeft = (65 - currentAge) * 12;
  return monthsLeft;
};

const UpcomingRetirement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
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
              EmployeeType
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.getEmployees) {
          setEmployees(res.data.getEmployees);
        } else {
          setError("No data found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data: {error}</div>;

  // Filter employees retiring in next 6 months
  const filtered = employees
    .filter((emp) => {
      const monthsLeft = getMonthsUntilRetirement(emp);
      return monthsLeft >= 0 && monthsLeft <= 6;
    })
    .filter(
      (emp) =>
        filterType === "All" || emp.EmployeeType === filterType
    )
    .filter((emp) =>
      `${emp.FirstName} ${emp.LastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  return (
    <>
      <h2 style={{ marginBottom: "20px" }}>
        Upcoming Retirements (Next 6 Months)
      </h2>

      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={inputStyle}
      />

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        style={inputStyle}
      >
        <option value="All">All Types</option>
        <option value="FullTime">Full Time</option>
        <option value="PartTime">Part Time</option>
        <option value="Contract">Contract</option>
        <option value="Seasonal">Seasonal</option>
      </select>

      {filtered.length === 0 ? (
        <p>No employees retiring in the next 6 months.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Employee Type</th>
              <th>Joining Date</th>
              <th>Months Left</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => {
              const monthsLeft = getMonthsUntilRetirement(emp);
              const currentAge = Math.floor(
                emp.Age +
                  (new Date() - new Date(emp.DateOfJoining)) /
                    (1000 * 60 * 60 * 24 * 365.25)
              );
              return (
                <tr key={emp._id}>
                  <td>{emp.FirstName} {emp.LastName}</td>
                  <td>{currentAge}</td>
                  <td>{emp.EmployeeType}</td>
                  <td>{new Date(emp.DateOfJoining).toLocaleDateString()}</td>
                  <td>{Math.round(monthsLeft)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};

// Styling (same as EmployeeList.jsx)
const inputStyle = {
  padding: "10px",
  marginBottom: "10px",
  marginRight: "10px",
  width: "250px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

export default UpcomingRetirement;
