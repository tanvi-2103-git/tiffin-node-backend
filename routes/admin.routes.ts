import express from "express";

import cors from "cors";
import { Admin } from "../controllers/admin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
export const adminRoutes = express();
adminRoutes.use(cors());
adminRoutes.get("/Admin",RoleBaseValidation("Admin"), Admin);
