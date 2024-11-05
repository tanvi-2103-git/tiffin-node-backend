import express, { NextFunction } from "express";
import { Request, Response } from "express";

import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/userModel";
import { RoleModel } from "../model/roleModel";
export const userRoutes = express();
userRoutes.use(cors());
dotenv.config();

interface RoleSpecificDetail {
  [key: string]: string | boolean | number; // Adjust this type as per your needs
}

export class AuthController {
  public getUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email: email });
  };

  public createPasswordResetToken = async () => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000;

    console.log(passwordResetToken, passwordResetTokenExpiry);

    return resetToken;
  };

  public login = async (req: Request, res: Response) => {
    try {
      const emailId = req.body.email;
      const user = await this.getUserByEmail(emailId);
      console.log(user);

      const { email, password } = req.body;
      if (user) {
        const matchPassword = await bcrypt.compare(password, user.password);

        if (email === user.email && matchPassword) {
          const token = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );
          res.json({
            statuscode: 200,
            success: true,
            message: "Authentication successful!",
            token: token,
            _id: user._id,
          });
        } else {
          res.status(401).json({
            statuscode: 401,
            success: false,
            message: "Invalid username or password",
          });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ statuscode: 400, error: "User Login failed" });
    }
  };

  public register = async (req: Request, res: Response) => {
    try {
      const {
        username,
        password,
        email,
        contact_number,
        address,
        role_id,
        role_specific_details: inputRoleSpecificDetails,
      } = req.body;

      const hash = await bcrypt.hash(password, 10);

      const roleDoc = await RoleModel.findById(role_id);
      if (!roleDoc) {
        res
          .status(400)
          .json({ statuscode: 400, error: "Invalid role ID provided" });
      } else {
        // Validate and build role_specific_details based on Role document
        let role_specific_details: RoleSpecificDetail = {};
        const roleTemplate = roleDoc.role_specific_details; // expected structure from Role

        // Ensure each field in roleTemplate exists in inputRoleSpecificDetails
        for (const field of roleTemplate) {
          const fieldName = field.name;
          // if (!(fieldName in inputRoleSpecificDetails)) {
          //    res.status(400).json({
          //     statuscode: 400,
          //     error: `Missing required role-specific field: ${fieldName}`,
          //   });
          // }
          // Set the field in role_specific_details to ensure it matches Role structure
          role_specific_details[fieldName] =
            inputRoleSpecificDetails[fieldName];
          console.log(role_specific_details[fieldName]);
        }

        // Create the user document
        const user = new UserModel({
          username,
          email,
          password: hash,
          contact_number,
          address,
          role_id: roleDoc._id,
          role_specific_details,
        });

        // Save the user
        const userData = await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { id: userData._id, role: userData.role_id },
          process.env.SECRET_KEY!,
          {
            expiresIn: "2h",
          }
        );

        // Respond with success
        res.status(201).json({
          statuscode: 201,
          message: "User registered successfully",
          token,
          _id: userData._id,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ statuscode: 400, error: `User registration failed ${error}` });
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
  ) => {
    // todo:
    // 1.get user based on posted email
    // 2.generate a random reset token
    // 3. send the token back to the user
  try{
    const emailId = req.body.email;
    const user = await this.getUserByEmail(emailId);
    if (!user) {
      res
        .status(404)
        .json({ statuscode: 404, error: "Invalid email ID provided" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log(resetToken);
    if (user) {
      user.resetPasswordToken = hashedToken;
      user.resetPasswordTokenExpires = resetTokenExpiry;
      await user.save();
      console.log(user);
      console.log(process.env.EMAIL_USER);
      
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,   // sender
        pass: process.env.EMAIL_PASS,   
      },
    });
    // console.log(transporter);
    

    const resetURL = `http://localhost:5000/api/auth/forgotpassword?token=${resetToken}&id=${user._id}`;
    console.log(resetURL);
    
    const message = `
      <h3>Password Reset</h3>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetURL}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await transporter.sendMail({
      from: `"Tiffin Service" <${process.env.EMAIL_USER}>`,
      to: user.email,  // reciever
      subject: "Password Reset Request",
      html: message,
    });

    res.json({ success: true, message: "Password reset link sent to your email" });
  
  }
  }catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending reset email" });
  }
    
  }
};

  // public resetPassword = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {

  // };

  //   public register = async (req: Request, res: Response) => {
  //   try {
  //     const {
  //       username,
  //       password,
  //       email,
  //       contact_number,
  //       address,
  //       role,
  //       gst_no,
  //       employee_code,
  //       organization_id,

  //     } = req.body;

  //     const hash = await bcrypt.hash(password, 10);

  //     let role_specific_details = {};

  //     if (role === 'Retailer') {
  //       role_specific_details = {
  //         retailer: {
  //           gst_no
  //         },
  //       };
  //     } else if (role === 'Employee') {
  //       role_specific_details = {
  //         employee: {
  //           employee_code,
  //           organization_id,
  //         },
  //       };
  //     } else if (role === 'Admin') {
  //       role_specific_details = {
  //         subadmin: {
  //           organization_id,

  //         },
  //       };
  //     } else if (role === 'SuperAdmin') {
  //       role_specific_details = {};
  //     }

  //     const user = new UserModel({
  //       username,
  //       email,
  //       password: hash,
  //       contact_number,
  //       address,
  //       role,
  //       role_specific_details,
  //     });

  //     const userData = await user.save();

  //     const token = jwt.sign({ id: userData._id, role: userData.role_id }, process.env.SECRET_KEY! , {
  //       expiresIn: '2h',
  //     });

  //     res.status(201).json({
  //       statuscode:201,
  //       message: "User registered successfully",
  //       token,
  //       _id: userData._id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(400).json({statuscode:400, error: "User registration failed" });
  //   }
  // };
// }
