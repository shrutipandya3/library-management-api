import { Request, Response, NextFunction } from "express";
import { loginUser, logoutUser, registerUser } from "@/services/auth.service";
import { sendResponse } from "@/utils/sendResponse";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { LoginInput, RegisterInput } from "@/validators/auth.validatior";

export const registerHandler = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body;
    const createdUser = await registerUser(data, req.getLocale());

    sendResponse({
      res,
      statusCode: 201,
      message: req.__("user_registered"),
      data: createdUser,
    });

    return;
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const loggedInUser = await loginUser(email, password, req.getLocale());

    sendResponse({
      res,
      statusCode: 200,
      message: req.__("login_successful"),
      data: loggedInUser,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await logoutUser(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: req.__("logout_successful"),
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
