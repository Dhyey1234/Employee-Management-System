import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const dropdownOptions = {
  Title: ["Employee", "Manager", "Director", "VP"],
  Department: ["IT", "Marketing", "HR", "Engineering"],
  EmployeeType: ["FullTime", "PartTime", "Contract", "Seasonal"],
};

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    FirstName: "", LastName: "", Age: "", DateOfJoining: "",
    Title: "", Department: "", EmployeeType: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const inputStyle = {
    padding: "12px",
    width: "100%",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #CFCFCF",
    backgroundColor: "#FAFAFA",
    fontSize: "14px",
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#8D99AE",
    color: "#FFF",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = `
      mutation($input: CreateEmployeeInput!) {
        createEmployee(input: $input) { _id }
      }
    `;
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: { ...form, Age: Number(form.Age) } }
      }),
    });
    const json = await res.json();
    if (json.data?.createEmployee?._id) {
      setMsg("Added successfully");
      navigate("/");
    } else {
      setMsg("Failed to add employee");
    }
  };

  return (
    <>
      <h2 style={{ color: "#2E2E2E" }}>Add Employee</h2>
      <form onSubmit={handleSubmit}>
        {["FirstName", "LastName", "Age", "DateOfJoining"].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f}
            type={f === "Age" ? "number" : f === "DateOfJoining" ? "date" : "text"}
            value={form[f]}
            onChange={handleChange}
            style={inputStyle}
          />
        ))}
        {["Title", "Department", "EmployeeType"].map((field) => (
          <select key={field} name={field} value={form[field]} onChange={handleChange} style={inputStyle}>
            <option value="">Select {field}</option>
            {dropdownOptions[field].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}
        <button type="submit" style={buttonStyle}>Submit</button>
      </form>
      {msg && <p>{msg}</p>}
    </>
  );
};

export default EmployeeCreate;
