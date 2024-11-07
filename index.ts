import express from "express";
import "./config/mongoDBConfig";
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { Request, Response } from "express";

import { authRoutes } from "./routes/auth.routes";
import { adminRoutes } from "./routes/admin.routes";
import organizationRoutes from "./routes/organization.routes";
import { superAdminRoutes } from "./routes/superAdmin.routes";
import  RetailerRoutes from "./routes/retailer.routes"
import TiffinItemRoutes from "./routes/tiffinItem.routes"
import { roleRoutes } from "./routes/role.routes";
import retailerRoutes from "./routes/retailer.routes";
import { employeeRoutes } from "./routes/employee/employee.routes";
import { cartRoutes } from "./routes/employee/cart.routes";
import {upload, uploadToCloudinary } from './config/cloudinaryConfig'; //the file path where you had written this functions in earlier

app.use(express.json());
app.use(cors());
dotenv.config();
// app.use(express.json());
    // app.use(express.urlencoded({extended:true}));

//port
app.listen(process.env.PORT, () => console.log("Application sever started"));


// Middleware
app.use(bodyParser.json());

//user registration login route
app.use("/api/auth", authRoutes);

//admin routes
app.use("/api/admin", adminRoutes);




//superadmin routes
app.use('/api/superadmin/role',roleRoutes);
app.use('/api/superadmin',superAdminRoutes);
app.use('/api/superadmin/organizations', organizationRoutes); 

//retailer routes
app.use('/api/retailers', retailerRoutes); 
app.use('/api/retailers/tiffinItems', TiffinItemRoutes);

//employee routes
app.use('/api/employees', employeeRoutes);
app.use('/api/employees/cart', cartRoutes);

 const imageUploadRouter = express();



app.use('/api',TiffinItemRoutes);