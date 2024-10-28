import express from "express";

import cors from "cors";
import { register } from "../controllers/auth.controller";
export const authRoutes = express();
authRoutes.use(cors());
authRoutes.post("/register", register);