import express from 'express';
import { RetailerController } from '../controllers/retailer.controller';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';
import { validateToken } from '../middleware/validateToken';

const retailerRoutes = express.Router();
const retailerController = new RetailerController();


retailerRoutes.put("/addRequest/:organization_id",validateToken,RoleBaseValidation('add_request'), retailerController.addRequest);



export default retailerRoutes;