
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
import { validateOrganization } from '../validators/organizationVaildator';
import { validateGetRequest } from '../validators/getRequestValidator';

const router = express.Router();
const organizationRoutes = new OrganizationController();

// router.post('/addOrganization', organizationRoutes.addOrganization);
// router.get('/getallOrganization', organizationRoutes.getAllOrganizations);
// router.get('/getOrganization/:id', organizationRoutes.getOrganizationById);
// router.put('/updateOrganization/:id', organizationRoutes.updateOrganization);
// router.delete('/deleteOrganization/:id', organizationRoutes.deleteOrganization);



router.post('/addOrganization',validateOrganization,RoleBaseValidation('add_organization'), organizationRoutes.addOrganization);
router.get('/getallOrganization', validateGetRequest({isPagination: true}),organizationRoutes.getAllOrganizations);
router.get('/getOrganization/:id',validateGetRequest({ isPagination:false,isIdRequired:true}),RoleBaseValidation('get_organization'), organizationRoutes.getOrganizationById);
router.put('/updateOrganization/:id',validateOrganization,RoleBaseValidation('edit_organization'), organizationRoutes.updateOrganization);
router.delete('/deleteOrganization/:id',RoleBaseValidation('delete_organization'), organizationRoutes.deleteOrganization);
export default router;
