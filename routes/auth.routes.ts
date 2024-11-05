import express from "express";
import {validateRegisterUser} from "../validators/authValidator";
import { validateLoginUser } from "../validators/authValidator";


import {AuthController} from "../controllers/auth.controller";
export const authRoutes = express();

const  authController = new AuthController();
authRoutes.post("/register", validateRegisterUser,authController.register);
authRoutes.post("/login",validateLoginUser, authController.login);