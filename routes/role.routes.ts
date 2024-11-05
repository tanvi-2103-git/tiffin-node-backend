import express from "express";
import { RoleController } from "../controllers/SuperAdmin/role.controller";
import { validateToken } from "../middleware/validateToken";
import { RoleBaseValidation } from "../middleware/RoleBaseValidation";


export const roleRoutes = express();
const  roleController = new RoleController();
//   'add_role',
//   'delete_role',
//   'update_role',
//   'get_role',
//   'getall_roles'
roleRoutes.post("/addRole",validateToken, RoleBaseValidation('add_role'), roleController.addRole);
roleRoutes.delete("/deleteRole/:roleid",validateToken, RoleBaseValidation('delete_role'), roleController.deleteRole);
roleRoutes.put("/updateRole/:roleid",validateToken, RoleBaseValidation('update_role'), roleController.updateRole);