
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


router.post('/addOrganization',RoleBaseValidation('add_organization'), organizationRoutes.addOrganization);
router.get('/getallOrganization', organizationRoutes.getAllOrganizations);
router.get('/getOrganization/:id',RoleBaseValidation('get_organization'), organizationRoutes.getOrganizationById);
router.put('/updateOrganization/:id',RoleBaseValidation('SuperAdmin'), organizationRoutes.updateOrganization);
router.delete('/deleteOrganization/:id',RoleBaseValidation('SuperAdmin'), organizationRoutes.deleteOrganization);
export default router;
