import express from "express";

import { Admin, AdminController } from "../controllers/admin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
export const adminRoutes = express();

const  adminController = new AdminController();

adminRoutes.get("/Admin",validateToken,RoleBaseValidation("Admin"), Admin);
adminRoutes.get("/pendingRetailers",validateToken,RoleBaseValidation("Admin"), adminController.pendingApprovalRetailer);
adminRoutes.get("/getapprovedRetailers",validateToken,RoleBaseValidation("Admin"), adminController.getApprovedRetailer);
adminRoutes.get("/getrejectedRetailers",validateToken,RoleBaseValidation("Admin"), adminController.getRejectedRetailer);

adminRoutes.put("/approveRetailer/:retailer_id",validateToken,RoleBaseValidation("Admin"), adminController.approveRetailer);
adminRoutes.put("/rejectRetailer/:retailer_id",validateToken,RoleBaseValidation("Admin"), adminController.rejectRetailer);

adminRoutes.put("/addRequest/:organization_id",validateToken,RoleBaseValidation("Retailer"), adminController.addRequest);
