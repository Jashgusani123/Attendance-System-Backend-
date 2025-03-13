import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { TryCatch } from '../Middlewares/error';
import Class from '../Models/Class';
import Student from '../Models/Student';
import Teacher, { ITeacher } from '../Models/Teacher';
import { NewTeacher, TeacherLogin } from '../Types/TeacherType';
import { AuthRequest } from '../Utils/Authentication';
import CookieSender from '../Utils/CookieSender';
import { ErrorHandler } from '../Utils/ErrorHandling';
import { google } from 'googleapis';
import ExcelJS from 'exceljs'
import fs from 'fs'

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

export const GetOverview = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.type === "Teacher" && req.Id) {
        const teacher = await Teacher.findById(req.Id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        const last7DaysData: Array<{ date: string; totalClass: number; studentsAttended: number; totalStudents: number }> = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 1; i <= 7; i++) { // Looping for the last 7 days
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - i);

            const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

            const allClasses = await Class.find({createdAt: { $gte: startOfDay, $lt: endOfDay } , createdBy:req.Id });

            const totalClasses = allClasses.length;

            const studentsAttended = allClasses.reduce((count , classs) => count + (classs.presentStudent.length | 0) , 0);

            const totalStudents = allClasses.reduce((count , classs) => count + (classs.allStudent.length | 0) , 0);

            const day = days[startOfDay.getUTCDay()];

            last7DaysData.push({
                date: day,
                totalClass: totalClasses,
                studentsAttended: studentsAttended,
                totalStudents: totalStudents
            });
        }

        return res.status(200).json({
            success: true,
            last7DaysData
        });
    } else {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
});

export const GetLastsClasses = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.type === "Teacher" && req.Id) {
        const today = new Date();
        const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

        const allClasses = await Class.find({
            createdBy: req.Id,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        })
        .select("subjectName starting ending") ;     // Populate 'starting' and 'ending' fields

        if (!allClasses || allClasses.length === 0) {
            return ErrorHandler(res, "Classes Not Found!!");
        }

        res.status(200).json({
            success: true,
            allClasses
        });
    } else {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
});


export const GenerateExcel = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { sheetName, fileName } = req.body;

    if (req.type !== "Teacher" || !req.Id) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    const allClasses = await Class.find({ createdAt: { $gte: startOfDay, $lt: endOfDay }, createdBy: req.Id });
    const teacher = await Teacher.findById(req.Id);

    const fields: any[] = [];

    for (const classes of allClasses) {
        for (const studentId of classes.allStudent) {
            const student = await Student.findOne({ enrollmentNumber: studentId });
            if (!student) continue;

            const isPresent = classes.presentStudent.includes(student.enrollmentNumber);

            fields.push([
                today.toISOString().split("T")[0],  // Date
                classes.subjectName,               // Subject Name
                teacher?.fullName || "Unknown",    // Teacher Name
                student.fullName,                  // Student Name
                student.enrollmentNumber,          // Student ER Number
                isPresent ? "Present" : "Absent",  // Status
            ]);
        }
    }

    if (fields.length === 0) {
        return res.status(404).json({ success: false, message: "No data available to generate Excel." });
    }

    // ✅ Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.CREDENTIAL_FILE, // Replace with your service account JSON
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "14bue8qzU8kb8mFlqYqpuTru5csirKCgMPe1GCMzo9oE";

    // ✅ Write data to Google Sheets
    await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId, // ✅ Corrected from `spreadsheetsId`
        range: "Sheet1!A1:F", // ✅ Corrected from `renge`
        valueInputOption: "RAW",
        requestBody: { values: [["Date", "Subject", "Teacher", "Student", "Enrollment", "Status"], ...fields] },
    });

    res.status(200).json({ success: true, message: "Google Sheet updated successfully!" });
});


export const downloadSheet = TryCatch(async(req:Request , res:Response , next:NextFunction)=>{
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.CREDENTIAL_FILE, // Your service account key
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      
      const sheets = google.sheets({ version: "v4", auth });
      
      const SPREADSHEET_ID = "14bue8qzU8kb8mFlqYqpuTru5csirKCgMPe1GCMzo9oE";
      const RANGE = "Sheet1!A1:F"; // Change based on your sheet range
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
          });
      
          const rows = response.data.values;
          
          if (!rows || rows.length === 0) {
            return res.status(404).send("No data found.");
          }
      
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("Attendance");
      
          worksheet.addRows(rows ?? []);
      
          const filePath = "attendance.xlsx";
          await workbook.xlsx.writeFile(filePath);
      
          res.download(filePath, () => {
            fs.unlinkSync(filePath);
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(500).send("Error generating file.");
        }
      
})
