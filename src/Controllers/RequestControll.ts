import { Request as DataRequest, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Request from "../Models/Request";
import { ErrorHandler } from "../Utils/ErrorHandling";


export const CreateRequest = TryCatch(async (req: DataRequest, res: Response) => {
    const { fullName,
        email,
        password,
        collegeName,
        departmentName } = req.body;

    if (fullName &&
        email &&
        password &&
        collegeName &&
        departmentName) {

        const newRequest = await Request.create({
            fullName,
            email,
            password,
            collegeName,
            departmentName,
            accepted: false,
            rejected: false
        })

        if(!newRequest){
            return ErrorHandler(res , "Something Went Wrong !!" , 404);
        }

        res.status(200).json({
            success:true,
            message:"Request Sended !!",
            RequestID:newRequest._id
        })
    }else{
        return ErrorHandler(res , "Server will not Get proper Data !!")
    }

})