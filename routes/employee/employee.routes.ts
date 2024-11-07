import express from "express";
import { validateToken } from "../../middleware/validateToken";
import { RoleBaseValidation } from "../../middleware/RoleBaseValidation";
import { EmployeeController } from "../../controllers/Employee/employee.controller";
import { validateGetRequest } from "../../validators/getRequestValidator";

export const employeeRoutes = express();

const  employeeController = new EmployeeController();


employeeRoutes.get("/getalltrendyretailers",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getalltiffinoforg",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinbyId",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateGetRequest({isPagination:true,isIdRequired:true}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinsByRetailer);


//retailer request
