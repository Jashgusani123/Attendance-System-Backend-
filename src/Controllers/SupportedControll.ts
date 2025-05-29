import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import College from "../Models/College";

export const GetAllCollege = TryCatch(
    async (
        req: Request<{}, {}, {}>,
        res: Response,
        next: NextFunction
    ) => {
        const colleges = await College.find({});
        const collegeNames = [...new Set(colleges.map((i) => i.collegename))];
        res.status(200).json({ success: true, collegeNames });
});

export const GetAllDepartment = TryCatch(
    async (
        req: Request<{}, {}, {
            collegeName: string
        }>,
        res: Response,
        next: NextFunction
    ) => {
        const college = await College.find({ collegename: req.body.collegeName });
        const departmentNames = college.map((i) => i.department);
        const uniqeDepartments = [...new Set(departmentNames)]
        const departmentnames = uniqeDepartments[0].map((i) => i);

        res.status(200).json({ success: true, departmentNames: departmentnames });
});