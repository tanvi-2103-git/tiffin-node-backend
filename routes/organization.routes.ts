
import express, {Router} from 'express';
import organizationController from '../controllers/organization.controller';

// const router = express.Router();
const router: Router = express.Router();

router.post('/', organizationController.addOrganization);
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganizationById);
router.put('/:id', organizationController.updateOrganization); 
router.delete('/:id', organizationController.deleteOrganization); 

export default router;
