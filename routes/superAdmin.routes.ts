import express from "express";

import { SuperAdminController } from "../controllers/superAdmin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
export const superAdminRoutes = express();
const  superAdminController = new SuperAdminController();
superAdminRoutes.get("/pendingApproval",RoleBaseValidation('SuperAdmin'), superAdminController.pendingApproval);

