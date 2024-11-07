import express from "express";
import {validateRegisterUser} from "../validators/authValidator";
import { validateLoginUser } from "../validators/authValidator";


import {AuthController} from "../controllers/auth.controller";
import { getUserFromToken } from "../controllers/admin.controller";
export const authRoutes = express();

const  authController = new AuthController();
authRoutes.post("/register",validateRegisterUser, authController.register);
authRoutes.post("/login",validateLoginUser,authController.login);
authRoutes.post("/getuserbytoken", authController.getUserByToken);

authRoutes.post("/forgotpassword", authController.forgotPassword);
// authRoutes.post("/resetpassword?token=<resetToken>&id=<userId>", authController.resetPassword);
authRoutes.post("/resetpassword", authController.resetPassword);
