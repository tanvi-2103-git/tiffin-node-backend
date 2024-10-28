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

// export const login = 
// async (req: Request, res: Response) => {
     
//     // const user: User | null = await User.findOne({ email: req.body.email });
//     const emailId= req.body.email;
//     const user = await getUserByEmailService(emailId);
  
//     const { email, password } = req.body;
//      if (user) {
//        const matchPassword = await bcrypt.compare(password, user.password);
//        console.log("password", password);
//        console.log("user.password", user.password);
       
//        console.log("matchPassword",matchPassword);
       
//       if (email === user.email && matchPassword) {
//         // Generate JWT token
//         // const token = generateToken({ id: user._id, username: user.username });
//         const token = jwt.sign({ id: user._id, password: user.password }, 'your-secret-key-here', {
//           expiresIn: '2h',
//         });
//         res.json({
//           statuscode: 200,
//           success: true,
//           message: "Authentication successful!",
//           token: token,
//           _id: user._id
//         });
//       } else {
//         res.status(401).json({
//           success: false,
//           message: "Invalid username or password",
//         });
//       }
//     }
//   }



export const register = async (req: Request, res: Response) => {
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

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Prepare role-specific details based on the user's role
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
      role_specific_details = {}; // Empty object for SuperAdmin, assuming no specific fields.
    }

    // Create new user document
    const user = new UserModel({
      username,
      email,
      password: hash,
      contact_number,
      address,
      role,
      role_specific_details,
    });

    // Save the user to the database
    const userData = await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: userData._id, role: userData.role }, process.env.SECRET_KEY! , {
      expiresIn: '2h',
    });

    // Respond with success
    res.status(201).json({
      message: "User registered successfully",
      token,
      _id: userData._id,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "User registration failed" });
  }
};




