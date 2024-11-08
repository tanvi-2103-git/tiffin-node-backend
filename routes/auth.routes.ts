import express from "express";
import {validateRegisterUser} from "../validators/authValidator";
import { validateLoginUser } from "../validators/authValidator";


import {AuthController} from "../controllers/auth.controller";
import { getUserFromToken } from "../controllers/admin.controller";
import { upload, uploadToCloudinary } from "../config/cloudinaryConfig";
export const authRoutes = express();

const  authController = new AuthController();
authRoutes.post("/register",validateRegisterUser, authController.register);
authRoutes.post("/login",validateLoginUser,authController.login);
authRoutes.post("/getuserbytoken", authController.getUserByToken);

authRoutes.post("/forgotpassword", authController.forgotPassword);
// authRoutes.post("/resetpassword?token=<resetToken>&id=<userId>", authController.resetPassword);
authRoutes.post("/resetpassword", authController.resetPassword);
authRoutes.post("/uploaduserimage/:userid", upload.single('recfile'), uploadToCloudinary("user_image"), authController.uploadUserImage);