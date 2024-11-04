import express from 'express';
import { TiffinItemController } from '../controllers/tiifinItem.controller';

const router = express.Router();
const tiffinItemRoutes = new TiffinItemController();

router.post('/add', tiffinItemRoutes.addTiffinItem);
router.get('/getall', tiffinItemRoutes.getAllTiffinItems);
router.get('/get/:id', tiffinItemRoutes.getTiffinItemById);
router.delete('/delete/:id', tiffinItemRoutes.deleteTiffinItem);
router.delete('/delete/:id', tiffinItemRoutes.deleteTiffinItem);
router.put('/update/:id', tiffinItemRoutes.updateTiffinItem);


export default router;