import { Request, Response } from "express";
import { RoleModel } from "../../model/roleModel";

export class RoleController {
  public addRole = async (req: Request, res: Response) => {
    try {
      const { role_name, role_permission, role_specific_details } = req.body;

      if (
        !role_name ||
        !Array.isArray(role_permission) ||
        !role_specific_details
      ) {
        res
          .status(400)
          .json({ statuscode: 400, error: "Invalid role data provided" });
      }

      for (const detail of role_specific_details) {
        if (!detail.name || !detail.type) {
          res.status(400).json({
            statuscode: 400,
            error:
              "Each role-specific detail must include 'name' and 'type' fields",
          });
        }
      }

      const role = new RoleModel({
        role_name,
        role_permission,
        role_specific_details,
      });

      const savedRole = await role.save();

      res.status(201).json({
        statuscode: 201,
        message: "Role added successfully",
        role: savedRole,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statuscode: 500, error: "Failed to add role" });
    }
  };

  public deleteRole = async (req: Request, res: Response) => {
    try {
      const  roleId = req.params.roleid;
  
      if (!roleId) {
         res
          .status(400)
          .json({ statuscode: 400, error: "Role ID is required" });
      }else{
  
      const deletedRole = await RoleModel.findByIdAndDelete(roleId);
  
      if (!deletedRole) {
         res
          .status(404)
          .json({ statuscode: 404, error: "Role not found" });
      }
  
      res.status(200).json({
        statuscode: 200,
        message: "Role deleted successfully",
        role: deletedRole,
      });
    }
    } catch (error) {
      console.error(error);
      res.status(500).json({ statuscode: 500, error: "Failed to delete role" });
    }
  };


  public updateRole = async (req: Request, res: Response) => {
    try {
      const { roleid } = req.params; // Role ID to update
      const { role_name, role_permission, role_specific_details } = req.body;
  
      if (!roleid) {
        res.status(400).json({ statuscode: 400, error: "Role ID is required" });
        return;
      }
  
      // Validate role_permission
      if (role_permission && !Array.isArray(role_permission)) {
        res.status(400).json({ statuscode: 400, error: "role_permission must be an array" });
        return;
      }
  
      // Validate role_specific_details
      if (role_specific_details) {
        for (const detail of role_specific_details) {
          if (!detail.name || !detail.type) {
            res.status(400).json({
              statuscode: 400,
              error: "Each role-specific detail must include 'name' and 'type' fields",
            });
            return;
          }
        }
      }
  
      // Prepare fields to update
      const updatedFields: any = {};
      if (role_name) updatedFields.role_name = role_name;
      if (role_permission) updatedFields.role_permission = role_permission;
      if (role_specific_details) updatedFields.role_specific_details = role_specific_details;
  
      // Find the role by ID and update it
      const updatedRole = await RoleModel.findByIdAndUpdate(roleid, updatedFields, { new: true });
  
      // If no role was found with the provided ID
      if (!updatedRole) {
        res.status(404).json({ statuscode: 404, error: "Role not found" });
        return;
      }
  
      // Send success response
      res.status(200).json({
        statuscode: 200,
        message: "Role updated successfully",
        role: updatedRole,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statuscode: 500, error: "Failed to update role" });
    }
  };
  
  
 
  
}
