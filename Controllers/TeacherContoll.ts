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
            last7DaysData:last7DaysData.reverse()
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
                classes.semester,  // Semester
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
        range: "Sheet1!A1:G", // ✅ Corrected from `renge`
        valueInputOption: "RAW",
        requestBody: { values: [["Date", "Subject", "Teacher", "Student", "Enrollment", "Status" , "Semester"], ...fields] },
    });

    res.status(200).json({ success: true, message: "Google Sheet updated successfully!" });
});


export const downloadSheet = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.CREDENTIAL_FILE,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const SPREADSHEET_ID = "14bue8qzU8kb8mFlqYqpuTru5csirKCgMPe1GCMzo9oE";
    const RANGE = "Sheet1!A1:G"; // Adjust based on your data range

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).send("No data found.");
        }

        // Remove header row and process data
        const data = rows.slice(1);
        const groupedData: { [semester: string]: { [subject: string]: { teacher: string, date: string, students: any[][] } } } = {};

        data.forEach((row) => {
            const [date, subject, teacher, student, enrollment, status, semester] = row;

            if (!groupedData[semester]) {
                groupedData[semester] = {};
            }
            if (!groupedData[semester][subject]) {
                groupedData[semester][subject] = { teacher, date, students: [] };
            }

            groupedData[semester][subject].students.push([student, enrollment, status]);
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Attendance");

        // Set Column Widths
        worksheet.getColumn(1).width = 25; // Student Name
        worksheet.getColumn(2).width = 20; // Enrollment Number
        worksheet.getColumn(3).width = 15; // Status

        let rowNumber = 1;

        Object.keys(groupedData).sort().forEach((semester) => {
            worksheet.addRow([]); // Blank row before each semester

            // Merging two columns for Semester title
            const semesterRow = worksheet.addRow([`Semester ${semester}`, ""]);
            worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
            semesterRow.font = { bold: true, size: 14 };
            semesterRow.alignment = { horizontal: "center" };
            rowNumber++;

            Object.keys(groupedData[semester]).forEach((subject) => {
                worksheet.addRow([]); // Blank row before each subject

                const subjectRow = worksheet.addRow([
                    `Subject: ${subject} (Teacher: ${groupedData[semester][subject].teacher}) - Date: ${groupedData[semester][subject].date}`
                ]);
                worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);
                subjectRow.font = { bold: true, size: 12 };
                subjectRow.alignment = { horizontal: "left" };
                rowNumber++;

                // Add student data headers
                const headerRow = worksheet.addRow(["Student Name", "Enrollment Number", "Status"]);
                headerRow.font = { bold: true };
                headerRow.alignment = { horizontal: "center" };

                groupedData[semester][subject].students.forEach((row) => {
                    const studentRow = worksheet.addRow(row);
                    
                    // Apply conditional styling for status
                    const statusCell = studentRow.getCell(3);
                    if (row[2] === "Present") {
                        statusCell.font = { color: { argb: "008000" } }; // Green text
                        statusCell.border = {
                            top: { style: "thin", color: { argb: "008000" } },
                            left: { style: "thin", color: { argb: "008000" } },
                            bottom: { style: "thin", color: { argb: "008000" } },
                            right: { style: "thin", color: { argb: "008000" } },
                        };
                    } else if (row[2] === "Absent") {
                        statusCell.font = { color: { argb: "FF0000" } }; // Red text
                        statusCell.border = {
                            top: { style: "thin", color: { argb: "FF0000" } },
                            left: { style: "thin", color: { argb: "FF0000" } },
                            bottom: { style: "thin", color: { argb: "FF0000" } },
                            right: { style: "thin", color: { argb: "FF0000" } },
                        };
                    }

                    rowNumber++;
                });

                rowNumber++;
            });
        });

        // Generate file and send it
        const filePath = "attendance.xlsx";
        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, () => {
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error generating file.");
    }
});

