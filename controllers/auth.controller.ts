import express from "express";
import { Request, Response } from "express";

import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserModel } from "../model/userModel";
import { RoleModel } from "../model/roleModel";
import moment from "moment";
import { CustomRequest } from "../middleware/validateToken";
export const userRoutes = express();
userRoutes.use(cors());
dotenv.config();

interface RoleSpecificDetail {
  [key: string]: string | boolean | number;
}

export class AuthController {
  public getUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email: email });
  };

  public login = async (req: Request, res: Response) => {
    try {
      const emailId = req.body.email;
      const user = await this.getUserByEmail(emailId);

      const { email, password } = req.body;
      if (user) {
        console.log(user);
        const matchPassword = await bcrypt.compare(password, user.password);

        if (email === user.email && matchPassword) {
          const token = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );
         
          ////generate refresh token
          const refreshToken = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.REFRESH_SECRET_KEY!,
            {
              expiresIn: "7h",
            }
          );

          
          user.refreshToken = refreshToken 
          await user.save();
          
          res.json({
            statuscode: 200,
            success: true,
            message: "Authentication successful!",
            token: token,
            refreshToken : refreshToken,//sending access token and refresh token
            _id: user._id,
            role_id: user.role_id,
          });
        } else {
          res.status(401).json({
            statuscode: 401,
            success: false,
            message: "Invalid username or password",
          });
        }
      } else {
        res.status(404).json({
          statuscode: 404,
          success: false,
          message: "User not found",
        });
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
        let role_specific_details: RoleSpecificDetail = {};
        const roleTemplate = roleDoc.role_specific_details;

        for (const field of roleTemplate) {
          const fieldName = field.name;

          role_specific_details[fieldName] =
            inputRoleSpecificDetails[fieldName];
          // console.log(role_specific_details[fieldName]);
        }

        const user = new UserModel({
          username,
          email,
          password: hash,
          contact_number,
          address,
          role_id: roleDoc._id,
          role_specific_details,
        });

        const userData = await user.save();

        const token = jwt.sign(
          { id: userData._id, role: userData.role_id },
          process.env.SECRET_KEY!,
          {
            expiresIn: "2h",
          }
        );

        res.status(201).json({
          statuscode: 201,
          message: "User registered successfully",
          token,
          _id: userData._id,
          role_id: userData.role_id,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ statuscode: 400, error: `User registration failed ${error}` });
    }
  };

 

  public logoutUser = async (req: Request, res: Response) : Promise<undefined> =>{
    try {
      
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        console.error("No token provided");
        return undefined;
      }
  
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        id: string;
        role: string;
      };
     
      const updatedUser = await UserModel.findByIdAndUpdate(
        decoded.id,
        { $set: { refreshToken: undefined } }, // Reset the refresh token on logout
        { new: true } 
    );
  
      if (!updatedUser) {
         res.status(404).json({ statuscode: 404, message: "User not found" });
         return undefined;
      }else{
             
      res.json({
        statuscode: 200,
        success: true,
        message: "User logged out successfully",
      });
      }
  

    } catch (error) {
      console.error(error);
      res.status(500).json({ statuscode: 500, error: "Server error while logging out" });
    }
  }

  

  public refreshAccessToken = async (req: Request, res: Response) : Promise<void> => {
    try {
      const incomingRefreshToken = req.body.refreshToken;

      if (!incomingRefreshToken) {
           res
          .status(401)
          .json({ statuscode: 401, error: "Refresh token is required" });
      }
  
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_SECRET_KEY!) as { id: string, role: string };
  
      const user = await UserModel.findById(decodedToken.id);
  
     
      if (!user) {
           res
          .status(401)
          .json({ statuscode: 401, error: "Invalid refresh token" });
      }else{
        if (incomingRefreshToken !== user?.refreshToken) {
          res
         .status(401)
         .json({ statuscode: 401, error: "Invalid refresh token" });
     }
 
    
     const newAccessToken = jwt.sign(
       { id: user?._id, role: user?.role_id },
       process.env.SECRET_KEY!,
       {
         expiresIn: "2h", 
       }
     );
 
     const newRefreshToken = jwt.sign(
       { id: user?._id, role: user?.role_id },
       process.env.REFRESH_SECRET_KEY!,
       { expiresIn: "7h" } 
     );
 
    
       user.refreshToken = newRefreshToken;
       await user.save(); 
     
    
 
    
       res.json({
       statuscode: 200,
       success: true,
       message: "Access token refreshed successfully",
       token: newAccessToken,
       refreshToken: newRefreshToken,
     });
    }
  
      
      
  
    } catch (error) {
      console.error(error);
        res.status(400).json({
        statuscode: 400,
        error: "Something went wrong while refreshing the access token",
      });
    }
  };

  
  public forgotPassword = async (req: Request, res: Response) => {
    // todo:
    // 1.get user based on posted email
    // 2.generate a random reset token
    // 3. send the token back to the user
    try {
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
      const resetTokenExpiry = moment().add(10, "minutes").toDate();

      if (user) {
        user.resetPasswordToken = hashedToken;
        user.resetPasswordTokenExpires = resetTokenExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER, // sender
            pass: process.env.EMAIL_PASS,
          },
        });

        const resetURL = `http://localhost:5000/api/auth/resetpassword?token=${resetToken}&id=${user._id}`;

        const message = `
      <h3>Password Reset</h3>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetURL}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

        await transporter.sendMail({
          from: `"Tiffin Service" <${process.env.EMAIL_USER}>`,
          to: user.email, // reciever
          subject: "Password Reset Request",
          html: message,
        });

        res.json({
          success: true,
          message: "Password reset link sent to your email",
          token: resetToken,
          userid: user._id
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error sending reset email" });
    }
  };


  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, id } = req.query;
      const { password } = req.body;

      if (token) {
        const hashedToken = crypto
          .createHash("sha256")
          .update(token as string)
          .digest("hex");
          console.log(hashedToken);
          
        const user = await UserModel.findOne({
          _id: id,
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpires: { $gte: moment().toDate() },
        });
        console.log(user);
        
        if (!user) {
          res
            .status(400)
            .json({ success: false, message: "Invalid or expired token" });
        } else {
          user.password = await bcrypt.hash(password, 10);
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpires = undefined;
          await user.save();

          res.json({ success: true, message: "Password reset successful" });
        }
      } else {
        res.json({ success: false, message: "Token not found" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to reset password" });
    }
  };

  getUserByToken = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.json("No token provided");
        res.status(404).json({ statuscode: 404, message: `No token provided` });
      } else {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;

        if (!user) {
          res.status(404).json({ statuscode: 404, message: `User not found` });
        }
        res.status(200).json({ statuscode: 200, data: user });
      }
    } catch (error) {
      res.status(500).json({ statuscode: 500, message: ` ${error}` });
    }
  };

  

  public uploadUserImage = async (req: Request, res: Response) =>{
    try{
      const user_id = req.params.userid
      console.log(user_id);
      const cloudinaryUrl = req.body.cloudinaryUrl;
      console.log("cloudinaryUrl in controller:", cloudinaryUrl)

      if (!cloudinaryUrl) {
        console.error('No Cloudinary URLs found.');
         res.status(500).send('Internal Server Error');
      }else{
        const user = await UserModel.findByIdAndUpdate(
          user_id,
          {user_image: cloudinaryUrl },
          {new: true, runValidators: true}
        );

        // console.log('user in controller:', user)

        if(user){
          res.status(200).json({statuscode:200, data: user})
        }else{
          res.status(404).json({statuscode:404, message:"user not found"})
        }
      }

    }catch(error){
      res.status(500).json({ error, message: "error in the catch"});
    }

  }

}


