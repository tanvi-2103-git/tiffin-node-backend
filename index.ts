import express from "express";
import "./config/mongoDBConfig";
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { authRoutes } from "./routes/auth.routes";
import { adminRoutes } from "./routes/admin.routes";
import organizationRoutes from "./routes/organization.routes";
// import { superAdminRoutes } from "./routes/superAdmin.routes";
import  RetailerRoutes from "./routes/retailer.routes"
import TiffinItemRoutes from "./routes/tiffinItem.routes"
import ApprovalRoutes from "./routes/approval.routes"

app.use(express.json());
app.use(cors());
dotenv.config();


//port
app.listen(process.env.PORT, () => console.log("Application sever started"));


// Middleware
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


// Use the organization routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/retailers', RetailerRoutes); // Crud controller left- to do
app.use('/api/tiffinItems', TiffinItemRoutes);
app.use('/api/approvals', ApprovalRoutes);
