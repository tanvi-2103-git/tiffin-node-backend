import express from 'express';
import { RetailerController } from '../controllers/retailer.controller';

const router = express.Router();
const retailerRoutes = new RetailerController();





export default router;