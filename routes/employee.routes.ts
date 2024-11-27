import express from "express";

import { RoleBaseValidation } from "../middleware/RoleBaseValidation";
import { validateToken } from "../middleware/validateToken";
import { EmployeeController } from "../controllers/Employee/employee.controller";
import { validateGetRequest } from "../validators/getRequestValidator";
export const employeeRoutes = express();

const  employeeController = new EmployeeController();

// "get_tiffin_of_organization"
// "get_retailer_by_organization"
// "add_to_cart"
// 3
// "remove_from_cart"
// 4
// "remove_cart"
// 5
// "get_cart"
// 6
// "place_order"
// 7
// "get_order"
// 8
// "cancel_order"
employeeRoutes.get("/getalltrendyretailers",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_retailer_by_organization"), employeeController.getAllTrendyRetailers);
employeeRoutes.get("/getallretailersoforg",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_retailer_by_organization"), employeeController.getAllRetailersofOrg);
employeeRoutes.get("/getalltiffinoforg",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getAllTiffinofOrg);
//employeeRoutes.get("/searchAllTiffinofOrg",validateToken,employeeController.searchAllTiffinofOrg);
employeeRoutes.get("/getalltiffinsbyretailer/:retailerid",validateGetRequest({isPagination:true,isIdRequired:true,idType:'retailerid'}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getAllTiffinsByRetailer);
employeeRoutes.get("/getTiffinofOrgById/:tifinid",validateGetRequest({isPagination:true,isIdRequired:true,idType:"tifinid"}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getTiffinofOrgById);
employeeRoutes.get("/getdeliveredorders",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_order"), employeeController.getDeliveredOrders);
employeeRoutes.get("/getpendingorders",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_order"), employeeController.getPendingOrders);
employeeRoutes.get("/cancelorder/:orderid",validateGetRequest({isPagination:false,isIdRequired:true,idType:'orderid'}),validateToken,RoleBaseValidation("cancel_order"), employeeController.cancelOrder);
employeeRoutes.get("/searchretailersoforg",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,employeeController.searchRetailersOfOrg);
employeeRoutes.get("/getallretailerswithtiffin",validateGetRequest({isPagination:true,isIdRequired:false}),validateToken,RoleBaseValidation("get_tiffin_of_organization"), employeeController.getAllRetailersWithTiffin);
employeeRoutes.get("/getAllOrders",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,employeeController.getAllOrders);




//retailer request
