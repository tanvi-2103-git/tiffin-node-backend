import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { EmployeeController } from "../controllers/Employee/employee.controller";
export const employeeRoutes = express();

const  employeeController = new EmployeeController();


employeeRoutes.get("/getalltrendyretailers",validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getallretailersoforg/:retailerid",validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllRetailersofOrg);
employeeRoutes.get("/getalltiffinoforg",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinsByRetailer);
employeeRoutes.get("/getTiffinofOrgById",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getTiffinofOrgById);



//retailer request
