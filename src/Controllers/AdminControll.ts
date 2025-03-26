import { Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import { ErrorHandler } from "../Utils/ErrorHandling";
import Admin from "../Models/Admin";
import cookieSender from "../Utils/CookieSender";
import { sendEmail } from "../Utils/SendEmail";
import bcrypt from 'bcryptjs';
import { AuthRequest } from "../Utils/Authentication";
import Student from "../Models/Student";
import Class from "../Models/Class";
import Teacher from "../Models/Teacher";


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

export const login = TryCatch(async (req: Request, res: Response) => {
    const { email, password, secretKey } = req.body;
    
    if (email && password && secretKey) {
        const getUser = await Admin.findOne({ email: email });
        if (getUser) {
            const compareSecretKey = getUser?.secretKey === secretKey;
            const comparePassword = await bcrypt.compare(password, getUser?.password);
            if (comparePassword && compareSecretKey) {
                cookieSender(res, getUser._id.toString());
                res.status(200).json({
                    success: true,
                    message: `Wellcome ${getUser.fullName}`,
                    user: getUser
                })
            } else if (!compareSecretKey) {
                return ErrorHandler(res, "Enter Valid SecretKey !!", 404);
            } else {
                return ErrorHandler(res, "Email OR Password Worng !!", 404);
            }

        } else {
            return ErrorHandler(res, "Email OR Password Worng !!", 404);
        }
    } else {
        return ErrorHandler(res, "Requird All Fileds ...")
    }

});

export const Logout = TryCatch(async (req: Request, res: Response) => {
    const cookieOptions = {
        maxAge: 0, // Expire immediately
        sameSite: "none" as const,
        httpOnly: true,
        secure: true,
    };

    res.cookie("Admin", "", cookieOptions);

    res.status(200).json({
        success: true,
        message: "Logout Done!!",
    });
});

export const GetAllStudents = TryCatch(async (req: AuthRequest, res: Response) => {
    const isAdmin = await Admin.findById(req.Id);
    if (!isAdmin) {
        return ErrorHandler(res, "Something Went Wrong !!", 404);
    }
    const GetAllStudents = await Student.find({ departmentName: isAdmin.departmentName, collegeName: isAdmin.collegeName });

    const StudentData = [];

    for (const i of GetAllStudents) {
        const allClasses = await Class.find({ allStudent: { $in: [i.enrollmentNumber] } }).countDocuments();
        const presentClasses = await Class.find({ presentStudent: { $in: [i.enrollmentNumber] } }).countDocuments();

        let presentPercentage: number = Number((presentClasses / allClasses) * 100);
        let absentPercentage = 100 - presentPercentage;

        if(!presentPercentage && !absentPercentage){
            presentPercentage = 0;
            absentPercentage = 0;
        }

        StudentData.push({
            fullName: i.fullName,
            enrollmentNumber: i.enrollmentNumber,
            departmentName: i.departmentName,
            semester: i.semester,
            present: Math.round(presentPercentage),
            absent: Math.round(absentPercentage)
        });
    }

    res.status(200).json({
        success:true,
        StudentData
    })


});

export const GetAllTeachers = TryCatch(async(req:AuthRequest , res:Response)=>{
    const isAdmin = await Admin.findById(req.Id);
    if(!isAdmin){
        return ErrorHandler(res , "Something Went Wrong !! (147)" , 404)
    }
     
    const AllTeachersData = await Teacher.find({departmentName:isAdmin.departmentName , collegeName:isAdmin.collegeName});
    const allTeachers = [];

    for (const i of AllTeachersData){
        allTeachers.push({
            fullName:i.fullName,
            avatarName:i.fullName.split(" ").map(word => word[0]).join("").toUpperCase(),
            _id:i._id
        });
    }

    res.status(200).json({
        success:true,
        TeacherData:allTeachers
    });
})