
import express from 'express';
import { OrganizationController } from '../controllers/SuperAdmin/organization.controller';
import { RoleBaseValidation } from '../middleware/RoleBaseValidation';
import { validateOrganization } from '../validators/organizationVaildator';
import { validateGetRequest } from '../validators/getRequestValidator';
import { upload, uploadToCloudinary } from "../config/cloudinaryConfig";
import { validateToken } from '../middleware/validateToken';

const router = express.Router();
const organizationRoutes = new OrganizationController();



router.post('/addOrganization',validateOrganization,validateToken, RoleBaseValidation('add_organization'), organizationRoutes.addOrganization);
router.get('/getallOrganization', validateGetRequest({isPagination: true,isIdRequired:false}),organizationRoutes.getAllOrganizations);
router.get('/getOrganization/:id',organizationRoutes.getOrganizationById);
router.get('/searchOrganizations',validateGetRequest({isPagination:false,isIdRequired:false}),organizationRoutes.searchOrganizations);
router.put('/updateOrganization/:id',validateOrganization,validateToken,RoleBaseValidation('edit_organization'), organizationRoutes.updateOrganization);
router.get('/getallOrganizationname',organizationRoutes.getallOrganizationName);

router.delete('/deleteOrganization/:id',validateToken,RoleBaseValidation('delete_organization'), organizationRoutes.deleteOrganization);

router.post("/upload", upload.single('recfile'), uploadToCloudinary("org_image"));

// router.post("/upload/:orgid", upload.single('recfile'), uploadToCloudinary("org_image"), organizationRoutes.uploadOrganizationImage)
// add: validateToken,RoleBaseValidation("update_tiffin")
export default router;