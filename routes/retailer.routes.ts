import express from 'express';
import { RetailerController } from '../controllers/retailer.controller';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';
import { validateToken } from '../middleware/validateToken';
import { validateGetRequest } from '../validators/getRequestValidator';

const retailerRoutes = express.Router();
const retailerController = new RetailerController();


retailerRoutes.put("/addRequest/:organization_id",validateToken,RoleBaseValidation('add_request'), retailerController.addRequest);
retailerRoutes.get("/getallorders",validateGetRequest({isPagination: true,isIdRequired:false}),validateToken,RoleBaseValidation("get_order"), retailerController.getAllOrders);
retailerRoutes.get("/getweeklyorders",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_order"), retailerController.getWeeklyOrders);
retailerRoutes.get("/getmonthlyorders",validateGetRequest({isPagination:false,isIdRequired:false}),validateToken,RoleBaseValidation("get_order"), retailerController.getMonthlylyOrders);
retailerRoutes.get("/searchorders",validateGetRequest({isPagination: false,isIdRequired:false}),validateToken, retailerController.searchOrders);

export default retailerRoutes;