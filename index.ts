import express from "express";
import "./config/mongoDBConfig";
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { authRoutes } from "./routes/auth.routes";

app.use(express.json());
app.use(cors());
dotenv.config();


//port
app.listen(process.env.PORT, () => console.log("Application sever started"));

// Middleware
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
