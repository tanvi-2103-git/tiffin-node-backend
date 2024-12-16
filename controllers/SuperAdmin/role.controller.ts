import { Request, Response } from "express";
import { RoleModel } from "../../model/roleModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";

export class RoleController {
  public addRole = async (req: Request, res: Response) => {
    try {
      const { role_name, role_permission, role_specific_details } = req.body;

      if (
        !role_name ||
        !Array.isArray(role_permission) ||
        !role_specific_details
      ) throw "Invalid role data provided"
      

      for (const detail of role_specific_details) {
        if (!detail.name || !detail.type) throw "Each role-specific detail must include 'name' and 'type' fields"
         
      }

      const role = new RoleModel({
        role_name,
        role_permission,
        role_specific_details,
      });

      const savedRole = await role.save();
      sendSuccessResponse(res, 201, true, "Role added successfully", savedRole);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to add role", error);
    }
  };

  public deleteRole = async (req: Request, res: Response) => {
    try {
      const roleId = req.params.role_id;

      if (!roleId) {
        return sendSuccessResponse(res, 200, true, "Role ID is required");
      }

      const deletedRole = await RoleModel.findByIdAndUpdate(
        { _id: roleId },
        { isActive: false }
      );

      if (!deletedRole) {
        return sendSuccessResponse(res, 200, true, "Role not found");
      }

      sendSuccessResponse(
        res,
        200,
        true,
        "Role deleted successfully",
        deletedRole
      );
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to add role", error);
    }
  };

  public getAllRoles = async (req: Request, res: Response) => {
    try {
      const roles = await RoleModel.find({ isActive: true });
      sendSuccessResponse(res, 200, true, "All roles", roles);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to add role", error);
    }
  };

  public getAllPermissions = async (req: Request, res: Response) => {
    try {
      const roles = await RoleModel.find({ isActive: true });
      var allPermission: string[] = [];
      const permissions = roles.map((role) => {
        role.role_permission.map((permission) => {
          allPermission.push(permission);
        });
      });
      const uniquePermission = [...new Set(allPermission)];
      sendSuccessResponse(res, 200, true, "All permissions", uniquePermission);
    } catch (error) {
      sendErrorResponse(res, 500, false, "Failed to add role", error);
    }
  };
}
