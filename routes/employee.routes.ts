import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { EmployeeController } from "../controllers/Employee/employee.controller";
import { validateGetRequest } from "../validators/getRequestValidator";
export const employeeRoutes = express();

const  employeeController = new EmployeeController();


employeeRoutes.get("/getalltrendyretailers",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getallretailersoforg",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllRetailersofOrg);
employeeRoutes.get("/getalltiffinoforg",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateGetRequest({isPagination:true,isIdRequired:true,idType:'retailerid'}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getAllTiffinsByRetailer);
employeeRoutes.get("/getTiffinofOrgById/:tifinid",validateGetRequest({isPagination:true,isIdRequired:true,idType:"tifinid"}),validateToken,RoleBaseValidation("get_all_tiffin"), employeeController.getTiffinofOrgById);



//retailer request
