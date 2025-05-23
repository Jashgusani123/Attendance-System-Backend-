import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import Hod from "../Models/Hod";

// Extend Request type to include custom properties
export interface AuthRequest extends Request {
  Id?: string; // Assuming Id is a string
  isLoggedIn?: boolean;
  type?:string
}


export const GetUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token1 = req.cookies?.["Hod"]; // Hod token
    const token2 = req.cookies?.["Teacher"]; // Teacher token
    const token3 = req.cookies?.["Student"]; // Student token
    const token4 = req.cookies?.["Panding"]; // Student token

    

    if (!token1 && !token2 && !token3 && !token4) {
      
      res.status(401).json({ message: "Unauthorized: No token provided"});
      return; // Stops execution if no tokens are provided
    }
    
    
    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "Internal Server Error: Missing JWT_SECRET" });
      return; // Stops execution if JWT_SECRET is missing
    }

    let decoded: { _id: string } | null = null;
    let userType: string | null = null;

    // Decode the token based on which one is available
    if (token1) {
      decoded = jwt.verify(token1, process.env.JWT_SECRET) as { _id: string };
      userType = "Hod";
    } else if (token2) {
      decoded = jwt.verify(token2, process.env.JWT_SECRET) as { _id: string };
      userType = "Teacher";
    } else if (token3) {
      decoded = jwt.verify(token3, process.env.JWT_SECRET) as { _id: string };
      userType = "Student";
    }else {
      decoded = jwt.verify(token4, process.env.JWT_SECRET) as { _id: string };
      userType = "Panding";
    }

    // If a decoded user exists, assign the values to the request and proceed
    if (decoded && userType) {
      req.Id = decoded._id; // Assign the user ID
      req.isLoggedIn = true; // Mark the user as logged in
      req.type = userType; // Assign the user type (Hod/Teacher/Student)
      next(); // Proceed to the next middleware
    } else {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return; // Stops execution if decoding fails
    }
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return; // Stops execution on error
  }
};
