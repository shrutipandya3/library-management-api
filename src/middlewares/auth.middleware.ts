import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/config/prisma";
import { sendResponse } from "@/utils/sendResponse";
import i18n from "@/config/i18n";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface AuthPayload {
  userId: number;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendResponse({
        res,
        statusCode: 401,
        message: req.__("unauthorized"),
        data: null,
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error(i18n.__("jwt_secret_missing"));
    }

    const decoded = jwt.verify(token, secret) as AuthPayload;

    if (!decoded) {
      sendResponse({
        res,
        statusCode: 401,
        message: req.__("token_invalid_or_expired"),
        data: null,
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, token: true },
    });

    if (!user || user.token !== token) {
      sendResponse({
        res,
        statusCode: 401,
        message: req.__("token_invalid"),
        data: null,
      });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
