import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { GraphQLDate } from 'graphql-scalars';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Schema
const employeeSchema = new mongoose.Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Age: { type: Number, required: true },
  DateOfJoining: { type: String, required: true },
  Title: { type: String, required: true },
  Department: { type: String, required: true },
  EmployeeType: { type: String, required: true },
  CurrentStatus: { type: Boolean, default: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

// GraphQL Type Definitions
const typeDefs = gql`
  scalar Date

  type Employee {
    _id: ID!
    FirstName: String!
    LastName: String!
    Age: Int!
    DateOfJoining: String!
    Title: String!
    Department: String!
    EmployeeType: String!
    CurrentStatus: Boolean!
  }

  input CreateEmployeeInput {
    FirstName: String!
    LastName: String!
    Age: Int!
    DateOfJoining: String!
    Title: String!
    Department: String!
    EmployeeType: String!
  }

  input UpdateEmployeeInput {
    Title: String
    Department: String
    CurrentStatus: Boolean
  }

  type Query {
    getEmployees: [Employee]
    getEmployee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(input: CreateEmployeeInput!): Employee
    updateEmployee(id: ID!, changes: UpdateEmployeeInput!): Employee
    deleteEmployee(id: ID!): Boolean
  }
`;

// Resolvers
const getEmployees = async () => await Employee.find();
const getEmployee = async (_, { id }) => await Employee.findById(id);
const createEmployee = async (_, { input }) => {
  const emp = new Employee({ ...input, CurrentStatus: true });
  return await emp.save();
};
const updateEmployee = async (_, { id, changes }) =>
  await Employee.findByIdAndUpdate(id, changes, { new: true });
const deleteEmployee = async (_, { id }) => {
  await Employee.findByIdAndDelete(id);
  return true;
};

const resolvers = {
  Date: GraphQLDate,
  Query: {
    getEmployees,
    getEmployee,
  },
  Mutation: {
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
};

// ✅ Serve frontend/public from the correct relative path
const startServer = async () => {
  app.use(cors());
  app.use(express.static(path.join(__dirname, '../frontend/public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
  });

  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server ready at ${url}${server.graphqlPath}`);
    exec(`start ${url}`);
  });
};

startServer();
