import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { EmployeeController } from "../controllers/Employee/employee.controller";
export const employeeRoutes = express();

const  employeeController = new EmployeeController();


employeeRoutes.get("/getalltrendyretailers",validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getalltiffinoforg",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinbyId",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinsByRetailer);


//retailer request
