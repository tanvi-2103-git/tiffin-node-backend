import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data,
  });
};

export const sendToken = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  token: string
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    token,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  error?: any
) => {
  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    error,
  });
};
