import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Hod from "../Models/Hod";

export const GetAllCollege = TryCatch(
    async (
        req: Request<{}, {}, {}>,
        res: Response,
        next: NextFunction
    ) => {
        const Hods = await Hod.find({});
        const collegeNames = [...new Set(Hods.map((i) => i.collegeName))];
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
            const Hods = await Hod.find({collegeName:req.body.collegeName});
            const departmentNames = [...new Set(Hods.map((i) => i.departmentName))];
            res.status(200).json({ success: true , departmentNames });
        });