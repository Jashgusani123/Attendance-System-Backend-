import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { TryCatch } from '../Middlewares/error';
import Class from '../Models/Class';
import Student, { IStudent } from '../Models/Student';
import { NewStudent, StudentLogin } from '../Types/StudentType';
import { AuthRequest } from '../Utils/Authentication';
import CookieSender from '../Utils/CookieSender';
import { ErrorHandler } from '../Utils/ErrorHandling';


export const Register = TryCatch(
    async (
        req: Request<{}, {}, NewStudent>,
        res: Response,
        next: NextFunction
    ) => {
        const { fullName, email, password, semester, departmentName, enrollmentNumber, collegeName, collegeJoiningDate } = req.body;

        if (fullName && email && password && semester && departmentName && enrollmentNumber && collegeName && collegeJoiningDate && password.length >= 6) {
            const student = await Student.create({
                fullName,
                email,
                password,
                semester,
                departmentName,
                enrollmentNumber,
                collegeName,
                collegeJoiningDate
            }) as IStudent;
            CookieSender(res, student._id.toString(), "Student")
            res.status(201).json({
                success: true,
                message: `Register Commpleted !! ${student.fullName}`,
                user: student,
            });
        } else if (password.length <= 6) {
            ErrorHandler(res, "Password Should be 6 length", 411);
        }
        else {

            ErrorHandler(res, "Required AllFileds!!", 400);
        }
    }
);

export const login = TryCatch(async (
    req: Request<{}, {}, StudentLogin>,
    res: Response,
    next: NextFunction
) => {
    const { fullName, email, password, enrollmentNumber } = req.body;
    if (fullName && email && password && enrollmentNumber) {
        const student = await Student.findOne({ email });
        const truePassword = await bcrypt.compare(password, student?.password!);
        const trueEnrollmentNumber = student?.enrollmentNumber === enrollmentNumber;
        if (truePassword && trueEnrollmentNumber) {
            CookieSender(res, student._id.toString(), "Student")
            return res.status(202).json({
                success: true,
                message: "WellCome " + student?.fullName,
                user: student
            })
        } else {

            ErrorHandler(res, "Email or Password or EnrollmentNumber Should be Wrong !!", 401);
        }
    } else {
        ErrorHandler(res, "Required AllFileds!!", 400);
    }
})

export const f = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "Work"
    });
};

export const Logout = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const cookieOptions = {
        maxAge: 0, // Expire immediately
        sameSite: "none" as const,
        httpOnly: true,
        secure: true,
    };

    res.cookie("Student", "", cookieOptions);

    res.status(200).json({
        success: true,
        message: "Logout Done!!",
    });
});

export const getStudent = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {

    const student = await Student.findById(req.Id);
    res.status(200).json({
        success: true,
        student
    });


});

export const GetClasses = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const student = await Student.findById(req.Id);
    const Classes = await Class.find({ allStudent:{ $in: [student?.enrollmentNumber] }  });

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

export const GetLastAttendance = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.type === "Student" && req.Id) {
        const student = await Student.findById(req.Id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const enrollmentNumber = student.enrollmentNumber;
        const last7DaysData: Array<{ date: string, totalClasses: number, yourAttendance: number }> = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 1; i < 8; i++) {
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - i);

            const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

            const totalClasses = await Class.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } });

            const yourAttendance = await Class.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay },
                presentStudent: { $in: [enrollmentNumber] }
            });

            let day = days[startOfDay.getDay()];

            last7DaysData.push({
                date:day, // Format as YYYY-MM-DD
                totalClasses,
                yourAttendance
            });
        }
        
        return res.status(200).json({
            success: true,
            last7DaysData: last7DaysData.reverse()
        });
    } else {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
});