import express from "express";
import { RoleController } from "../controllers/SuperAdmin/role.controller";
import { validateToken } from "../middleware/validateToken";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateRole } from "../validators/roleValidator";


export const roleRoutes = express();
const  roleController = new RoleController();
//   'add_role',
//   'delete_role',
//   'update_role',
//   'get_role',
//   'getall_roles'
roleRoutes.post("/addRole",validateRole,validateToken, RoleBaseValidation('add_role'), roleController.addRole);
roleRoutes.delete("/deleteRole/:role_id",validateToken, RoleBaseValidation('delete_role'), roleController.addRole);