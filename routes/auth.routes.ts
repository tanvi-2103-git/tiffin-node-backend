import express from "express";

import cors from "cors";

import {AuthController} from "../controllers/auth.controller";
export const authRoutes = express();
authRoutes.use(cors());
const  authController = new AuthController();
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);