import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { EmployeeController } from "../controllers/Employee/employee.controller";
import { validateGetRequest } from "../validators/getRequestValidator";
export const employeeRoutes = express();

const  employeeController = new EmployeeController();


employeeRoutes.get("/getalltrendyretailers",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getallretailersoforg/:retailerid",validateGetRequest({isPagination:true,isIdRequired:true,idType:'retailerid'}),validateToken,RoleBaseValidation("get_render_by_organization"), employeeController.getAllRetailersofOrg);
employeeRoutes.get("/getalltiffinoforg",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateGetRequest({isPagination:true,isIdRequired:true,idType:'retailerid'}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getAllTiffinsByRetailer);
employeeRoutes.get("/getTiffinofOrgById",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getTiffinofOrgById);
employeeRoutes.get("/getdeliveredorders",validateToken,RoleBaseValidation("get_order"), employeeController.getDeliveredOrders);
employeeRoutes.get("/getpendingorders",validateToken,RoleBaseValidation("get_order"), employeeController.getPendngOrders);
employeeRoutes.get("/cancelorder/:orderid",validateGetRequest({isPagination:true,isIdRequired:true,idType:'orderid'}),validateToken,RoleBaseValidation("cancel_order"), employeeController.cancelOrder);




//retailer request
