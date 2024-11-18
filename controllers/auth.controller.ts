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
import { CustomRequest } from "../middleware/validateToken";
import {
  sendErrorResponse,
  sendSuccessResponse,
  sendSuccessToken,
} from "../utils/responsesUtils";
import { upload } from "../config/cloudinaryConfig";
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
<<<<<<< Updated upstream
        
=======

>>>>>>> Stashed changes
        if (matchPassword) {
          const token = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );

          const refreshToken = jwt.sign(
            { id: user._id, role: user.role_id },
            process.env.REFRESH_SECRET_KEY!,
            {
              expiresIn: "7h",
            }
          );

          user.refreshToken = refreshToken;
          await user.save();

          sendSuccessToken(
            res,
            200,
            true,
            "Authentication successful!",
            token,
            refreshToken
          );

          // res.json({
          //   statuscode: 200,
          //   success: true,
          //   message: "Authentication successful!",
          //   token: token,
          //   refreshToken : refreshToken,//sending access token and refresh token
          //   _id: user._id,
          //   role_id: user.role_id,
          // });
        } else {
          sendErrorResponse(res, 401, false, "Invalid username or password");
        }
      } else {
        sendErrorResponse(res, 404, false, "User not found");
      }
    } catch (error) {
      sendErrorResponse(res, 404, false, "User login failed");
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
        sendErrorResponse(res, 400, false, "Invalid role ID provided");
      } else {
        let role_specific_details: RoleSpecificDetail = {};
        const roleTemplate = roleDoc.role_specific_details;

        for (const field of roleTemplate) {
          const fieldName = field.name;

          role_specific_details[fieldName] =
            inputRoleSpecificDetails[fieldName];
        }
<<<<<<< Updated upstream
       
=======

>>>>>>> Stashed changes
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

        sendErrorResponse(
          res,
          201,
          true,
          "User registered successfully",
          token
        );
        // res.status(201).json({
        //   statuscode: 201,
        //   message: "User registered successfully",
        //   token,
        //   _id: userData._id,
        //   role_id: userData.role_id,
        // });
      }
    } catch (error) {
      sendErrorResponse(res, 400, false, `User registration failed ${error}`);
    }
  };

  public logoutUser = async (
    req: Request,
    res: Response
  ): Promise<undefined> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
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
        sendErrorResponse(res, 404, false, "User not found");
        // return undefined;
      } else {
        sendSuccessResponse(res, 200, true, "User logged out successfully");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Server error while logging out");
    }
  };

  public refreshAccessToken = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const incomingRefreshToken = req.body.refreshToken;

      if (!incomingRefreshToken) {
        sendErrorResponse(res, 401, false, "Refresh token is required");
      }

      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_SECRET_KEY!
      ) as { id: string; role: string };

      const user = await UserModel.findById(decodedToken.id);

      if (!user) {
        sendErrorResponse(res, 401, false, "Invalid refresh token");
      } else {
        if (incomingRefreshToken !== user?.refreshToken) {
          sendErrorResponse(res, 401, false, "Invalid refresh token");
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
        sendSuccessResponse(
          res,
          200,
          true,
          "Access token refreshed successfully",
          newAccessToken,
          newRefreshToken
        );
      }
    } catch (error) {
      sendErrorResponse(
        res,
        400,
        false,
        "Something went wrong while refreshing the access token"
      );
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
        sendErrorResponse(res, 400, false, "Invalid email ID provided");
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

        sendSuccessToken(
          res,
          200,
          true,
          "Password reset link sent to your email",
          resetToken
        );
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error sending reset email", error);
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
          sendErrorResponse(res, 404, true, "Invalid or expired token");
        } else {
          user.password = await bcrypt.hash(password, 10);
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpires = undefined;
          await user.save();
          sendSuccessResponse(res, 200, true, "Password reset successful");
        }
      } else {
        sendErrorResponse(res, 404, true, "Token not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Token not found");
    }
  };

  getUserByToken = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        sendErrorResponse(res, 404, false, `No token provided`);
      } else {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;

        if (!user) {
          sendErrorResponse(res, 404, false, `User not found`);
        }
        sendSuccessResponse(res, 200, true, "user", user);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, ` ${error}`);
    }
  };

  public uploadUserImage = async (req: Request, res: Response) => {
    try {
      const user_id = req.params.userid;
      const cloudinaryUrl = req.body.cloudinaryUrl;

      if (!cloudinaryUrl) {
<<<<<<< Updated upstream
        res.status(500).send("Internal Server Error");
=======
        sendErrorResponse(res, 500, false, "Internal Server Error");
>>>>>>> Stashed changes
      } else {
        const user = await UserModel.findByIdAndUpdate(
          user_id,
          { user_image: cloudinaryUrl },
          { new: true, runValidators: true }
        );

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
        if (user) {
          sendSuccessResponse(res, 200, true, "image uploaded", user);
        } else {
          sendErrorResponse(res, 404, false, "user not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "error in the catch");
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

      sendSuccessResponse(res, 200, true, "updated loc", updateloc);
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
    }
  };
}
