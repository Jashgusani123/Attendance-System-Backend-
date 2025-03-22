import { Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import { ErrorHandler } from "../Utils/ErrorHandling";
import Admin from "../Models/Admin";
import cookieSender from "../Utils/CookieSender";
import { sendEmail } from "../Utils/SendEmail";


export const Register = TryCatch(async (req: Request, res: Response) => {
    const { fullName, email, password, collegeName, departmentName } = req.body;

    if (!fullName && !email && !password && !collegeName && !departmentName) {
        return ErrorHandler(res, "All Data Not Get Properly!!", 404)
    }
    if (password.length < 6) {
        return ErrorHandler(res, "Password Should be 6 length", 411)
    }
    const isAdmin = await Admin.findOne({ email: email });

    if (isAdmin) {
        return ErrorHandler(res, "This Account Created Once!!")
    }

    const newAdmin = await Admin.create({
        fullName, email, password, collegeName, departmentName
    });
    const secretKey = newAdmin._id.toString().slice(-10);
    newAdmin.secretKey = secretKey;
    newAdmin.save();
    const text = `Dear Admin,

Welcome to the Attendance System!

Our platform is designed to make attendance management **quick, efficient, and hassle-free** for both teachers and students. With just a few clicks, you can mark attendance, track records, and generate reports—**saving valuable time during class sessions**.

As an admin, you have full access to manage users, monitor attendance records, and ensure a smooth experience for all.

To log in as an administrator, please use the secret key provided below:

🔑 Your Admin Secret Key: ${secretKey}

For security reasons, please **do not share this key with anyone**. If you did not request this access, please contact support immediately.

Best regards,  
Attendance System Team `;
    sendEmail(email, "QuickAttend - Admin Access Key for Secure Login", text)
    cookieSender(res, newAdmin._id.toString())
    res.status(202).json({
        success: true,
        user: await newAdmin.populate("fullName email collegeName departmentName"),
        message: "Account Created !!"
    })
});

export const login = TryCatch(async(req:Request , res:Response)=>{
    const {email , password , secretKey} = req.body;

    if(email && password && secretKey){
        const getUser = await Admin.findOne({email:email});
        if(getUser){
            cookieSender(res, getUser._id.toString());
            res.status(200).json({
                success:true,
                message:`Wellcome ${getUser.fullName}`
            })
        }
    }

})