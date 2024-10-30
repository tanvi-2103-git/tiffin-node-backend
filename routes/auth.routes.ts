import express from "express";



import {AuthController} from "../controllers/auth.controller";
export const authRoutes = express();

const  authController = new AuthController();
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);