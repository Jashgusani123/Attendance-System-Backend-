import Teacher, { ITeacher } from '../Models/Teacher'
import { NextFunction, Request, Response } from 'express';
import { TryCatch } from '../Middlewares/error';
import { NewTeacher, TeacherLogin } from '../Types/TeacherType';
import { ErrorHandler } from '../Utils/ErrorHandling'
import bcrypt from 'bcryptjs';
import CookieSender from '../Utils/CookieSender'
import { AuthRequest } from '../Utils/Authentication';
import Class from '../Models/Class';
import moment from 'moment';
import QRCode from 'qrcode';


export const Register = TryCatch(
    async (
        req: Request<{}, {}, NewTeacher>,
        res: Response,
        next: NextFunction
    ) => {
        const { fullName, email, password, departmentName, collegeName } = req.body;

        if (fullName && email && password && departmentName && collegeName && password.length >= 6) {
            const teacher = await Teacher.create({
                fullName,
                email,
                password,
                departmentName,
                collegeName,
            }) as ITeacher;
            CookieSender(res, teacher._id.toString(), "Teacher")
            res.status(201).json({
                success: true,
                message: `Register Commpleted !! ${teacher.fullName}`,
                user: teacher,
            });
        } else if (password.length < 6) {
            ErrorHandler(res, "Password Should be 6 length", 411);
        }
        else {

            ErrorHandler(res, "Required AllFileds!!", 400);
        }
    }
);

export const login = TryCatch(async (
    req: Request<{}, {}, TeacherLogin>,
    res: Response,
    next: NextFunction
) => {
    const { fullName, email, password } = req.body;
    if (fullName && email && password) {
        const teacher = await Teacher.findOne({ email: email });

        const truePassword = await bcrypt.compare(password, teacher?.password!);

        if (truePassword) {
            CookieSender(res, teacher!._id.toString(), "Teacher")
            return res.status(202).json({
                success: true,
                message: "WellCome " + teacher?.fullName,
                user: teacher
            })
        } else {
            ErrorHandler(res, "Email or Password Should be Wrong !!", 401);
        }
    } else {
        ErrorHandler(res, "Required AllFileds!!", 400);
    }
});

export const Logout = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const cookieOptions = {
        maxAge: 0, // Expire immediately
        sameSite: "none" as const,
        httpOnly: true,
        secure: true,
    };

    res.cookie("Teacher", "", cookieOptions);

    res.status(200).json({
        success: true,
        message: "Logout Done!!",
    });
});

export const GetClasses = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const Classes = await Class.find({ createdBy: req.Id });

    const currentDateTime = moment(); // Current full timestamp

    let upcomingClasses: any[] = [];

    if (Classes) {
        upcomingClasses = Classes.filter((i) => {
            const classEndTime = moment(i.ending, "YYYY-MM-DD HH:mm"); // Full date-time
            return classEndTime.isAfter(currentDateTime);
        });
    }

    res.status(200).json({
        success: true,
        upcomingClasses
    });
});

export const getTeacher = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {

    const teacher = await Teacher.findById(req.Id);
    res.status(200).json({
        success: true,
        teacher
    });


});

export const GetAllAttendance = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { classID } = req.body;

    if (!classID) {
        return res.status(404).json({ success: false, message: "I am Not Get ClassID" });
    }

    const GettedClass = await Class.findById(classID);

    if (!GettedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Combining both present and absent students in a structured way
    const allAttendance = [
        ...GettedClass.presentStudent.map((student: any, index: number) => ({
            id: index + 1,
            erno:student,
            isPresent:true
        })),
        ...GettedClass.absentStudent.map((student: any, index: number) => ({
            id: GettedClass.presentStudent.length + index + 1,
            erno:student,
            status: false
        }))
    ];

    return res.status(200).json({
        success: true,
        allAttendance
    });
});
