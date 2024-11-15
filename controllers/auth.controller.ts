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
import { getUserFromToken } from "./admin.controller";
import { sendError, sendResponse, sendToken } from "../utils/responsesUtils";
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
      const { email, password } = req.body;
      const newEmail = email.toLowerCase();
      const user = await this.getUserByEmail(newEmail);
      if (user) {
        const matchPassword = await bcrypt.compare(password, user.password);

        if (matchPassword) {
          const token = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );
          sendToken(res, 200, true, "Authentication successful!", token);
        } else {
          sendError(res, 401, false, "Invalid username or password");
        }
      } else {
        sendError(res, 404, false, "User not found");
      }
    } catch (error) {
      sendError(res, 404, false, "User Login failed", error);
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
        sendError(res, 400, false, "Invalid role ID provided");
      } else {
        let role_specific_details: RoleSpecificDetail = {};
        const roleTemplate = roleDoc.role_specific_details;

        for (const field of roleTemplate) {
          const fieldName = field.name;

          role_specific_details[fieldName] =
            inputRoleSpecificDetails[fieldName];
        }

        const newEmail = email.toLowerCase();
        const user = new UserModel({
          username,
          email: newEmail,
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
        sendToken(res, 201, true, "User registered successfully", token);
      }
    } catch (error) {
      console.error(error);
      sendError(res, 400, false, `User registration failed ${error}`);
    }
  };

  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const emailtemp = req.body.email;
      const emailId = emailtemp.toLowerCase();
      const user = await this.getUserByEmail(emailId);
      if (!user) {
        sendError(res, 404, false, "Invalid email ID provided");
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExpiry = moment().add(5, "minutes").toDate();

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

        const resetURL = `http://localhost:5000/api/auth/resetpassword?token=${resetToken}`;

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

        sendToken(
          res,
          200,
          true,
          "Password reset link sent to your email",
          resetToken
        );
      }
    } catch (error) {
      sendError(res, 500, false, "Error sending reset email");
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      const { password } = req.body;

      if (token) {
        const hashedToken = crypto
          .createHash("sha256")
          .update(token as string)
          .digest("hex");

        const user = await UserModel.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpires: { $gte: moment().toDate() },
        });

        if (!user) {
          sendError(res, 400, true, "Invalid or expired token");
        } else {
          user.password = await bcrypt.hash(password, 10);
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpires = undefined;
          await user.save();
          sendResponse(res, 200, true, "Password reset successful");
        }
      } else {
        sendError(res, 400, false, "Token not found");
      }
    } catch (error) {
      sendError(res, 500, false, "Failed to reset password");
    }
  };

  getUserByToken = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        sendError(res, 404, false, `No token provided`);
      } else {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;

        if (!user) {
          sendError(res, 404, false, `User not found`);
        }
        sendResponse(res, 200, true, "user found", user);
      }
    } catch (error) {
      sendError(res, 500, false, `${error}`);
    }
  };

  public uploadUserImage = async (req: Request, res: Response) => {
    try {
      const user_id = req.params.userid;

      const cloudinaryUrl = req.body.cloudinaryUrl;

      if (!cloudinaryUrl) {
        // console.error("No Cloudinary URLs found.");
        sendError(res, 500, false, "Internal Server Error");
      } else {
        const user = await UserModel.findByIdAndUpdate(
          user_id,
          { user_image: cloudinaryUrl },
          { new: true, runValidators: true }
        );

        if (user) {
          sendResponse(res, 200, true, "successfully added image", user);
        } else {
          sendError(res, 404, false, "user not found");
        }
      }
    } catch (error) {
      sendError(res, 500, false, "error in the catch");
    }
  };

  public updateLoc = async (req: Request, res: Response) => {
    try {
      const org_location = req.query.org_location;
      const user = (await getUserFromToken(req)) as User;
      const updateloc = await UserModel.updateOne(
        {
          _id: user._id,
        },
        { $set: { "role_specific_details.org_location": org_location } }
      );
      sendResponse(res, 200, true, "org updated", updateloc);
    } catch (error) {
      sendError(res, 500, false, `Internal server error ${error}`);
    }
  };
}
