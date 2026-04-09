import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const query = `
      query GetEmployee($id: ID!) {
        getEmployee(id: $id) {
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
    `;
    fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id } }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.getEmployee) {
          setEmployee(res.data.getEmployee);
        } else {
          setMessage("Employee not found.");
        }
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setEmployee((prev) => ({ ...prev, CurrentStatus: e.target.value === "true" }));
  };

  const handleUpdate = async () => {
    const mutation = `
      mutation UpdateEmployee($id: ID!, $changes: UpdateEmployeeInput!) {
        updateEmployee(id: $id, changes: $changes) {
          _id
        }
      }
    `;
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: {
          id,
          changes: {
            Title: employee.Title,
            Department: employee.Department,
            CurrentStatus: employee.CurrentStatus,
          },
        },
      }),
    });

    const json = await res.json();
    if (json.data?.updateEmployee?._id) {
      setMessage("Employee updated.");
    } else {
      setMessage("Failed to update employee.");
    }
  };

  const handleDelete = async () => {
    const mutation = `
      mutation DeleteEmployee($id: ID!) {
        deleteEmployee(id: $id)
      }
    `;
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables: { id } }),
    });

    const json = await res.json();
    if (json.data?.deleteEmployee) {
      navigate("/");
    } else {
      setMessage("Failed to delete employee.");
    }
  };

  const calculateRetirementCountdown = () => {
    const doj = new Date(employee.DateOfJoining);
    const ageAtJoin = employee.Age;
    const retirementDate = new Date(doj);
    retirementDate.setFullYear(doj.getFullYear() + (65 - ageAtJoin));
    const today = new Date();

    const diffTime = retirementDate - today;
    if (diffTime <= 0) return "Already eligible for retirement.";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = Math.floor((diffDays % 365) % 30);

    return `${days} days, ${months} months, ${years} years left until retirement.`;
  };

  if (!employee) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Container className="mt-4">
      <Card className="shadow-sm" style={{ backgroundColor: "#F9F7F2", padding: "30px" }}>
        <h3 className="mb-4 text-center text-uppercase" style={{ color: "#5D5C61" }}>
          Employee Details
        </h3>

        <Row className="mb-3">
          <Col><strong>Name:</strong> {employee.FirstName} {employee.LastName}</Col>
          <Col><strong>Age:</strong> {employee.Age}</Col>
        </Row>

        <Row className="mb-3">
          <Col><strong>Date of Joining:</strong> {new Date(employee.DateOfJoining).toLocaleDateString()}</Col>
          <Col><strong>Employee Type:</strong> {employee.EmployeeType}</Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <strong>Retirement Countdown:</strong><br />
            <span>{calculateRetirementCountdown()}</span>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Select name="Title" value={employee.Title} onChange={handleChange}>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Director">Director</option>
            <option value="VP">VP</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Select name="Department" value={employee.Department} onChange={handleChange}>
            <option value="IT">IT</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Engineering">Engineering</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select name="CurrentStatus" value={employee.CurrentStatus} onChange={handleStatusChange}>
            <option value="true">Working</option>
            <option value="false">Left</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2 mt-3">
          <Button
            onClick={handleUpdate}
            style={{ backgroundColor: "#C2B280", border: "none", fontWeight: "bold" }}
          >
            Update
          </Button>
          <Button
            onClick={handleDelete}
            style={{ backgroundColor: "#C2B280", border: "none", fontWeight: "bold" }}
          >
            Delete
          </Button>
        </div>

        {message && <Alert variant="info" className="mt-3">{message}</Alert>}
      </Card>
    </Container>
  );
};

export default EmployeeDetails;
