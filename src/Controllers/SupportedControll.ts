import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Admin from "../Models/Admin";

export const GetAllCollege = TryCatch(
    async (
        req: Request<{}, {}, {}>,
        res: Response,
        next: NextFunction
    ) => {
        const admins = await Admin.find({});
        const collegeNames = [...new Set(admins.map((i) => i.collegeName))];
        res.status(200).json({ success: true , collegeNames });
    });

    export const GetAllDepartment = TryCatch(
        async (
            req: Request<{}, {}, {
                collegeName:string
            }>,
            res: Response,
            next: NextFunction
        ) => {
            const admins = await Admin.find({collegeName:req.body.collegeName});
            const departmentNames = [...new Set(admins.map((i) => i.departmentName))];
            res.status(200).json({ success: true , departmentNames });
        });