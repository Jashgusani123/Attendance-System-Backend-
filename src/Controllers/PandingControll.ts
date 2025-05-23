import { Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Hod from "../Models/Hod";
import Panding from "../Models/Panding";
import { AuthRequest } from "../Utils/Authentication";
import cookieSender from "../Utils/CookieSender";
import { ErrorHandler } from "../Utils/ErrorHandling";
import Notification from "../Models/Notification";
import Teacher from "../Models/Teacher";


export const CreatePandingRequest = TryCatch(async (req: Request, res: Response) => {
    const { fullName, email, password, departmentName, collegeName, gender } = req.body;

    if (fullName && email && password && departmentName && gender && collegeName && password.length >= 6) {
        const isHod = await Hod.findOne({ departmentName, collegeName });
        if (!isHod) return ErrorHandler(res, "Invalid Request (11)", 404);

        const newPanding = await Panding.create({
            fullName, email, password, departmentName, collegeName, gender, accepted: false, hodId: isHod._id, rejected: false
        });
        cookieSender(res, newPanding._id.toString());

        res.status(200).json({
            success: true,
            newPanding
        })

    } else {
        return ErrorHandler(res, "Requirde All Fildes (24) !!", 404);
    }

});

export const DeletePandingRequest = TryCatch(async (req: AuthRequest, res: Response) => {
    if (req.type === "Panding") {
        if (!req.Id) return ErrorHandler(res, "Something went wrong (34) !!", 404);
        await Panding.findByIdAndDelete(req.Id);
        const cookieOptions = {
            maxAge: 0, // Expire immediately
            sameSite: "none" as const,
            httpOnly: true,
            secure: true,
        };

        res.cookie("Panding", "", cookieOptions);
        res.status(200).json({
            success: true
        })

    } else {
        return ErrorHandler(res, "Something went wrong (49) !!");
    }
});

export const AcceptPandingRequest = TryCatch(async (req: Request, res: Response) => {
    const { pandingId, _id } = req.body;
    if (!pandingId || !_id) {
        return ErrorHandler(res, "Server Can't Get Proper Data (57) !!", 404);
    }
    const isNotification = await Notification.findById(_id);
    
    const isPanding = await Panding.findById(pandingId);
    if (!isPanding) return ErrorHandler(res, "Something Went Wrong !!", 404);
    isPanding.accepted = true;
    isPanding.rejected = false;
    await isPanding.save();
    await isNotification?.deleteOne();

    res.status(200).json({
        success: true,
        message: "Accepted..."
    })
});

export const RejectPandingRequest = TryCatch(async (req: Request, res: Response) => {
    const { pandingId, _id } = req.body;
    if (!pandingId || !_id) {
        return ErrorHandler(res, "Server Can't Get Proper Data (57) !!", 404);
    }
    const isNotification = await Notification.findById(_id);
    
    const isPanding = await Panding.findById(pandingId);
    if (!isPanding) return ErrorHandler(res, "Something Went Wrong !!", 404);
    isPanding.accepted = false;
    isPanding.rejected = true;
    await isPanding.save();
    await isNotification?.deleteOne();
    res.status(200).json({
        success: true,
        message: "Rejectd..."
    })
});
