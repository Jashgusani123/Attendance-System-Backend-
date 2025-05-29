import { Request } from "express";

export interface RequestCreateCollegeBody {
  collegename: string;
  place: string;
  category: string;
  department: string;
}

export interface MulterCollegeRequest extends Request {
  body: {
    collegename: string;
    place: string;
    category: string[];
    department: string[];
  };
  files?: {
    [fieldname: string]: Express.Multer.File[]; // More generic, avoids the error
  };
}
