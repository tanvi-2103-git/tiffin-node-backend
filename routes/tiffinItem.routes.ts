import express from 'express';
import { TiffinItemController } from '../controllers/tiifinItem.controller';
import { validateToken } from '../middleware/validateToken';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';

const retailerRoutes = express.Router();
const tiffinItemController = new TiffinItemController();

// "add_tiffin",
// "update_tiffin",
// "delete_tiffin",
// "add_request",
// get_all_tiffins,
// get_tiffin_by_id

retailerRoutes.post('/add',validateToken,RoleBaseValidation('add_tiffin'), tiffinItemController.addTiffinItem);
retailerRoutes.get('/getall',validateToken,RoleBaseValidation('get_all_tiffins'), tiffinItemController.getAllTiffinItems);
retailerRoutes.get('/get/:id',validateToken,RoleBaseValidation('get_tiffin_by_id'), tiffinItemController.getTiffinItemById);
retailerRoutes.delete('/delete/:id',validateToken,RoleBaseValidation('delete_tiffin'), tiffinItemController.deleteTiffinItem);
retailerRoutes.put('/update/:id',validateToken,RoleBaseValidation('update_tiffin'), tiffinItemController.updateTiffinItem);

export default retailerRoutes;