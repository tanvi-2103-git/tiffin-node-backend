
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
import { OrganizationController } from '../controllers/organization.controller';

const router = express.Router();
const organizationRoutes = new OrganizationController();

router.get('/', organizationRoutes.getAllOrganizations);
router.get('/:id', organizationRoutes.getOrganizationById);
router.put('/:id', organizationRoutes.updateOrganization);

export default router;
