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
      const  roleId = req.params.role_id;
  
      if (!roleId) {
        return res
          .status(400)
          .json({ statuscode: 400, error: "Role ID is required" });
      }
  
      const deletedRole = await RoleModel.findByIdAndDelete(roleId);
  
      if (!deletedRole) {
        return res
          .status(404)
          .json({ statuscode: 404, error: "Role not found" });
      }
  
      res.status(200).json({
        statuscode: 200,
        message: "Role deleted successfully",
        role: deletedRole,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statuscode: 500, error: "Failed to delete role" });
    }
  };

 
  
}
