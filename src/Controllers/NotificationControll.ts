import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Notification from "../Models/Notification";
import { ErrorHandler } from "../Utils/ErrorHandling";
import { AuthRequest } from "../Utils/Authentication";

export const CreateNotification = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { type ,allStudent, upperHeadding, description, to, pandingId } = req.body;
    
    let userType = ""
    if (req.type === "Teacher") {
        userType = "Teacher";
    } else if(req.type === "Hod" || req.type === "Panding"){
        userType = "Hod";
    }
    
    if (type === process.env.CLASSCREATION && allStudent) {
        if (!upperHeadding || !description) {
            ErrorHandler(res, "Give Title and Description For that!!")
        } else {
            const notification = await Notification.create({
                type,
                allStudent,
                upperHeadding,
                description,
                userType
            })
            res.status(200).json({
                sucess: true,
                message: "Notificatoin Created ",
                notification
            })
        }
    } else if (type === process.env.WELLCOME && to) {
        const notification = await Notification.create({
            type,
            upperHeadding,
            description,
            userType,
            to
        });
        res.status(200).json({
            sucess: true,
            message: "Notificatoin Created ",
            notification
        });
    } else if(type === "request" && to && pandingId){
        const notification = await Notification.create({
            type,
            upperHeadding,
            description,
            userType,
            to,
            pandingId
        });
        res.status(200).json({
            sucess: true,
            message: "Notificatoin Created ",
            notification
        });
    }
    else {
        res.status(404).json({
            success: false,
            message: "Notification not Created !!"
        })
    }

});

export const GetUserNotifications = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { erno, id } = req.body;

    if (!erno && !id) {
        return ErrorHandler(res, "Enter Your Enrollment Number Or Id...", 404);
    }
    let allNotification;
    if (erno && !id) {
        allNotification = await Notification.find({
            $or: [
                { to: erno },
                { allStudent: { $in: [erno] } }
            ]
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    } else if (id && !erno) {
        allNotification = await Notification.find({
            to: id
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    }


});

