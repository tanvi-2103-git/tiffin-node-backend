
// import express from 'express';
// import {OrganizationController} from '../controllers/organization.controller';
// // import { addOrganization, getOrganizationById } from '../controllers/tempOrganization'

// // const router = express.Router();
// const router = express.Router();
// const organizationRoutes = new OrganizationController();
// // router.post('/', addOrganization);
// router.get('/', organizationRoutes.getAllOrganizations);
// // router.get('/:id', getById);
// router.get('/:id', organizationRoutes.getOrganizationById)
// router.put('/:id', organizationRoutes.updateOrganization); 
// // router.delete('/:id', organizationController.deleteOrganization); 

// export default router;


import express from 'express';
import { OrganizationController } from '../controllers/SuperAdmin/organization.controller';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';
const router = express.Router();
const organizationRoutes = new OrganizationController();

router.post('/addorganization',RoleBaseValidation('SuperAdmin'), organizationRoutes.addOrganization);
router.get('/getallorganization', organizationRoutes.getAllOrganizations);
router.get('/getorganization/:id',RoleBaseValidation('SuperAdmin'), organizationRoutes.getOrganizationById);
router.put('/updateorganization/:id',RoleBaseValidation('SuperAdmin'), organizationRoutes.updateOrganization);
router.delete('/deleteorganization/:id',RoleBaseValidation('SuperAdmin'), organizationRoutes.deleteOrganization);
export default router;
