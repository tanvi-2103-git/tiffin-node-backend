import express from "express";

import cors from "cors";
import { SuperAdminController } from "../controllers/superAdmin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
export const superAdminRoutes = express();
superAdminRoutes.use(cors());
const  superAdminController = new SuperAdminController();
superAdminRoutes.get("/pendingApproval",RoleBaseValidation('SuperAdmin'), superAdminController.pendingApproval);

