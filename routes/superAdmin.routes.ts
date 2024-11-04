import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { ApprovalController } from "../controllers/SuperAdmin/approval.controller";
export const superAdminRoutes = express();
const  approval = new ApprovalController()
// superAdminRoutes.get("/pendingApproval",RoleBaseValidation('SuperAdmin'), superAdminController.pendingApproval);
// 'approve_admin_request',
//   'reject_admin_request',
//   'get_pending_admin_request',
//   'get_approved_admin_request',
//   'get_rejected_admin_request',
//   'add_role',
//   'delete_role',
//   'update_role',
//   'get_role',
//   'getall_roles'
superAdminRoutes.get("/pendingAdminApproval",RoleBaseValidation('get_pending_admin_request'), approval.getAllPendingAdminApprovalRequests);
superAdminRoutes.get("/approvedAdminApproval",RoleBaseValidation('get_approved_admin_request'), approval.getAllApprovedAdmin);
superAdminRoutes.get("/rejectedAdminApproval",RoleBaseValidation('get_rejected_admin_request'), approval.getAllRejectedAdmin);

superAdminRoutes.put("/rejectadmin/:admin_id",RoleBaseValidation('reject_admin_request'), approval.rejectApprovalRequest);
superAdminRoutes.put("/approveadmin/:admin_id",RoleBaseValidation('approve_admin_request'), approval.approveAdminRequest);


