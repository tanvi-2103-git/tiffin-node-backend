import express from "express";
import {validateRegisterUser} from "../validators/authValidator";
import { validateLoginUser } from "../validators/authValidator";


import {AuthController} from "../controllers/auth.controller";
export const authRoutes = express();

const  authController = new AuthController();
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/forgotpassword", authController.forgotPassword);
// authRoutes.post("/resetpassword?token=<resetToken>&id=<userId>", authController.resetPassword);
authRoutes.post("/resetpassword", authController.resetPassword);
