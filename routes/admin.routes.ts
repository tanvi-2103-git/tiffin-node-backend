import express from "express";

import cors from "cors";
import { Admin, AdminController } from "../controllers/admin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
export const adminRoutes = express();
adminRoutes.use(cors());
const  adminController = new AdminController();

adminRoutes.get("/Admin",RoleBaseValidation("Admin"), Admin);
adminRoutes.get("/pendingRetailers",RoleBaseValidation("Admin"), adminController.pendingApprovalRetailer);
adminRoutes.put("/addRequest/:organization_id",RoleBaseValidation("Retailer"), adminController.addRequest);
adminRoutes.put("/approveRetailer/:retailer_id",RoleBaseValidation("Admin"), adminController.approveRetailer);

