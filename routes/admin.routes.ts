import express from "express";

import { Admin, AdminController } from "../controllers/admin.controller";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { validateGetRequest } from "../validators/getRequestValidator";
export const adminRoutes = express();

const  adminController = new AdminController();
// 'approve_retailer_request',
//   'reject_retailer_request',
//   'get_pending_retailer_request',
//   'get_approved_retailer_request',
//   'get_rejected_retailer_request'

// adminRoutes.get("/Admin",validateToken,RoleBaseValidation("Admin"), Admin);
adminRoutes.get("/pendingRetailers",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_pending_retailer_request"), adminController.pendingApprovalRetailer);
adminRoutes.get("/getapprovedRetailers",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_approved_retailer_request"), adminController.getApprovedRetailer);
adminRoutes.get("/getrejectedRetailers",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_rejected_retailer_request"), adminController.getRejectedRetailer);

adminRoutes.put("/approveRetailer/:retailer_id",validateToken,RoleBaseValidation("approve_retailer_request"), adminController.approveRetailer);
adminRoutes.put("/rejectRetailer/:retailer_id",validateToken,RoleBaseValidation("reject_retailer_request"), adminController.rejectRetailer);
adminRoutes.put("/makeretailertrendy/:retailer_id",validateToken,RoleBaseValidation("reject_retailer_request"), adminController.makeRetailerTrendy);

//retailer request
