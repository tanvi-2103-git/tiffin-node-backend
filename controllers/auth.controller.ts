import express from "express";
import { Request, Response } from 'express';

import dotenv from 'dotenv';

import cors from "cors";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import { UserModel } from "../model/userModel";
export const userRoutes = express();
userRoutes.use(cors());
dotenv.config();
export class AuthController{

public  getUserByEmail = async function(email:string){
  return await UserModel.findOne({ email: email });
  
} 


public login = 
async (req: Request, res: Response) => {
  try {
    const emailId= req.body.email;
    const user = await this.getUserByEmail(emailId);
  
    const { email, password } = req.body;
     if (user) {
       const matchPassword = await bcrypt.compare(password, user.password);
      
       
      if (email === user.email && matchPassword) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY!, {
          expiresIn: '2h',
        });
        res.json({
          statuscode: 200,
          success: true,
          message: "Authentication successful!",
          token: token,
          _id: user._id
        });
      } else {
        res.status(401).json({
          statuscode:401,
          success: false,
          message: "Invalid username or password",
        });
      }
    } } catch (error) {
      console.error(error);
      res.status(400).json({statuscode:400, error: "User Login failed" });
    }
  }



  public register = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      email,
      contact_number,
      address,
      role,
      gst_no,
      employee_code,
      organization_id,
      
    } = req.body;


    const hash = await bcrypt.hash(password, 10);

    let role_specific_details = {};

    if (role === 'Retailer') {
      role_specific_details = {
        retailer: {
          gst_no
        },
      };
    } else if (role === 'Employee') {
      role_specific_details = {
        employee: {
          employee_code,
          organization_id,
        },
      };
    } else if (role === 'Admin') {
      role_specific_details = {
        subadmin: {
          organization_id,
         
        },
      };
    } else if (role === 'SuperAdmin') {
      role_specific_details = {}; 
    }

  
    const user = new UserModel({
      username,
      email,
      password: hash,
      contact_number,
      address,
      role,
      role_specific_details,
    });

 
    const userData = await user.save();


    const token = jwt.sign({ id: userData._id, role: userData.role }, process.env.SECRET_KEY! , {
      expiresIn: '2h',
    });

    res.status(201).json({
      statuscode:201,
      message: "User registered successfully",
      token,
      _id: userData._id,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({statuscode:400, error: "User registration failed" });
  }
};
}



