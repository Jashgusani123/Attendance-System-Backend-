import { Response } from "express";
import jwt from "jsonwebtoken";



const cookieSender = (res: Response, Id: string, type?: string): void => {

  const token = jwt.sign({ _id: Id }, process.env.JWT_SECRET!);

  const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "none" as const,  // Type assertion to literal type
    httpOnly: true,
    secure: true, // Use secure cookies in production
  };
  if (type && type === "Teacher") {
    res.status(200).cookie("Teacher", token, cookieOptions);
  } else if (type && type === "Student") {
    res.status(200).cookie("Student", token, cookieOptions);
  } else if (type && type === "Hod") {
    res.status(200).cookie("Hod", token, cookieOptions);
  } else {
    res.status(200).cookie("Panding", token, cookieOptions);
  }
};

export default cookieSender;
