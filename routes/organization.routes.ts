
import express from 'express';
import { OrganizationController } from '../controllers/SuperAdmin/organization.controller';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';
import { validateOrganization } from '../validators/organizationVaildator';
import { validateGetRequest } from '../validators/getRequestValidator';
import { upload, uploadToCloudinary } from "../config/cloudinaryConfig";

const router = express.Router();
const organizationRoutes = new OrganizationController();

// router.post('/addOrganization', organizationRoutes.addOrganization);
// router.get('/getallOrganization', organizationRoutes.getAllOrganizations);
// router.get('/getOrganization/:id', organizationRoutes.getOrganizationById);
// router.put('/updateOrganization/:id', organizationRoutes.updateOrganization);
// router.delete('/deleteOrganization/:id', organizationRoutes.deleteOrganization);



router.post('/addOrganization',upload.array('recfile'), uploadToCloudinary("org_image"), RoleBaseValidation('add_organization'), organizationRoutes.addOrganization);
router.get('/getallOrganization', validateGetRequest({isPagination: true,isIdRequired:false}),organizationRoutes.getAllOrganizations);
router.get('/getOrganization/:id',validateGetRequest({ isPagination:false,isIdRequired:true,idType: 'id'}),RoleBaseValidation('get_organization'), organizationRoutes.getOrganizationById);
router.put('/updateOrganization/:id',validateOrganization,RoleBaseValidation('edit_organization'), organizationRoutes.updateOrganization);
router.put('/deleteOrganization/:id',RoleBaseValidation('delete_organization'), organizationRoutes.deleteOrganization);
export default router;

router.post("/upload/:orgid", upload.single('recfile'), uploadToCloudinary("org_image"), organizationRoutes.uploadOrganizationImage)
// add: validateToken,RoleBaseValidation("update_tiffin")