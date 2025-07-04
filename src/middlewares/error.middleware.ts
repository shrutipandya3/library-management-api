import i18n from "@/config/i18n";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || req.__("internal_server_error");

  res.status(statusCode).json({
    message,
    ...(err.errors ? { errors: err.errors } : {}), // Include errors array if present
  });
};
