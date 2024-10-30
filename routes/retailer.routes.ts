import express from 'express';
import { RetailerController } from '../controllers/retailer.controller';

const router = express.Router();
const retailerRoutes = new RetailerController();

router.post('/add', retailerRoutes.addTiffinItem);
router.get('/getall', retailerRoutes.getAllTiffinItems);
router.get('/get/:id', retailerRoutes.getTiffinItemById);



export default router;