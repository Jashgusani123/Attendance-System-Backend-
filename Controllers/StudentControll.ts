import Student, { IStudent } from '../Models/Student'
import { NextFunction, Request, Response } from 'express';
import { TryCatch } from '../Middlewares/error';
import { NewStudent, StudentLogin, GetStudent } from '../Types/StudentType';
import { ErrorHandler } from '../Utils/ErrorHandling'
import bcrypt from 'bcryptjs';
import CookieSender from '../Utils/CookieSender'
import { AuthRequest } from '../Utils/Authentication';
import moment from 'moment';
import Class from '../Models/Class';


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
        } else if (password.length < 6) {
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
            console.log(trueEnrollmentNumber, truePassword);

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