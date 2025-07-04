import jwt, { JwtPayload } from "jsonwebtoken";

const EXPIRES_IN = "7d";

// Define the payload (data to be stored in the token)
interface UserPayload {
  userId: number;
}

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Use environment variables for production

export const generateToken = (payload: UserPayload): string => {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN }); // Token expires in 1 hour
  return token;
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded as JwtPayload;
  } catch (err) {
    return null;
  }
};
