import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import moment from 'moment';
import { TryCatch } from '../Middlewares/error';
import Class from '../Models/Class';
import Student from '../Models/Student';
import Teacher, { ITeacher } from '../Models/Teacher';
import { NewTeacher, TeacherLogin } from '../Types/TeacherType';
import { AuthRequest } from '../Utils/Authentication';
import CookieSender from '../Utils/CookieSender';
import { ErrorHandler } from '../Utils/ErrorHandling';
import Hod from '../Models/Hod';
import Notification from '../Models/Notification';

export const Register = TryCatch(
    async (
        req: Request<{}, {}, NewTeacher>,
        res: Response,
        next: NextFunction
    ) => {
        const { fullName, email, password, departmentName, collegeName, gender } = req.body;
        console.log(password);
        
        if (fullName && email && password && departmentName && gender && collegeName && password.length >= 6) {
            const isTeacher = await Teacher.find({ email: email });
            
            if (isTeacher.length > 0) {
                return ErrorHandler(res, "This Account Allready Created!! ");
            }
            
            
            const teacher = await Teacher.create({
                fullName,
                email,
                password,
                departmentName,
                collegeName,
                gender
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

export const GetTeacher = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {

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
            erno: student,
            isPresent: true
        })),
        ...GettedClass.absentStudent.map((student: any, index: number) => ({
            id: GettedClass.presentStudent.length + index + 1,
            erno: student,
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

            const allClasses = await Class.find({ createdAt: { $gte: startOfDay, $lt: endOfDay }, createdBy: req.Id });

            const totalClasses = allClasses.length;

            const studentsAttended = allClasses.reduce((count, classs) => count + (classs.presentStudent.length | 0), 0);

            const totalStudents = allClasses.reduce((count, classs) => count + (classs.allStudent.length | 0), 0);

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
            last7DaysData: last7DaysData.reverse()
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
            .select("subjectName starting ending");     // Populate 'starting' and 'ending' fields

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
    let { sheetName = "Sheet1", fileName, spreadsheetId } = req.body;

    if (req.type !== "Teacher" || !req.Id) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
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
                formattedDate,
                classes.subjectName,
                teacher?.fullName || "Unknown",
                student.fullName,
                student.enrollmentNumber,
                isPresent ? "Present" : "Absent",
                classes.semester,
            ]);
        }
    }

    if (fields.length === 0) {
        return res.status(404).json({ success: false, message: "No data available to add to Excel." });
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: "/opt/render/project/src/src/gcp-credentials.json",  // Just pass the file path
        scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"],
    });


    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    let finalSpreadsheetId = spreadsheetId;
    let sheetId;

    if (!spreadsheetId) {
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title: fileName || `Attendance_Report_${formattedDate}` },
                sheets: [{ properties: { title: sheetName } }],
            },
        });

        finalSpreadsheetId = spreadsheet.data.spreadsheetId;
        sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId;

        const headers = [["Date", "Subject", "Teacher", "Student", "Enrollment", "Status", "Semester"]];
        await sheets.spreadsheets.values.update({
            spreadsheetId: finalSpreadsheetId,
            range: `${sheetName}!A1:G1`,
            valueInputOption: "RAW",
            requestBody: { values: headers },
        });
    } else {
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
        const fetchedFileName = sheetInfo.data.properties?.title;
        const sheet = sheetInfo.data.sheets?.[0];

        sheetId = sheet?.properties?.sheetId;
        const fetchedSheetName = sheet?.properties?.title;

        if (!fetchedSheetName) {
            return res.status(400).json({ success: false, message: `No sheets found in the spreadsheet.` });
        }

        sheetName = sheetName || fetchedSheetName;
    }



    const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: finalSpreadsheetId,
        range: `${sheetName}!A:A`,
    });
    const startRow = existingData.data.values ? existingData.data.values.length + 1 : 2;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: finalSpreadsheetId as string,
        requestBody: {
            requests: [
                // Make the first row (headers) bold and black
                {
                    repeatCell: {
                        range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1 },
                        cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } } } },
                        fields: "userEnteredFormat"
                    }
                },
                // Apply Green color for "Present"
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                sheetId: sheetId,
                                startRowIndex: startRow - 1, // Data rows only
                                endRowIndex: startRow - 1 + fields.length,
                                startColumnIndex: 5, // "Status" column index
                                endColumnIndex: 6
                            }],
                            booleanRule: {
                                condition: {
                                    type: "TEXT_EQ",
                                    values: [{ userEnteredValue: "Present" }]
                                },
                                format: {
                                    textFormat: { foregroundColor: { red: 0, green: 1, blue: 0 } } // Green
                                }
                            }
                        },
                        index: 0
                    }
                },
                // Apply Red color for "Absent"
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                sheetId: sheetId,
                                startRowIndex: startRow - 1, // Data rows only
                                endRowIndex: startRow - 1 + fields.length,
                                startColumnIndex: 5, // "Status" column index
                                endColumnIndex: 6
                            }],
                            booleanRule: {
                                condition: {
                                    type: "TEXT_EQ",
                                    values: [{ userEnteredValue: "Absent" }]
                                },
                                format: {
                                    textFormat: { foregroundColor: { red: 1, green: 0, blue: 0 } } // Red
                                }
                            }
                        },
                        index: 1
                    }
                }
            ]
        }
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: finalSpreadsheetId as string,
        range: `${sheetName}!A${startRow}:G`,
        valueInputOption: "RAW",
        requestBody: { values: fields },
    });

    await drive.permissions.create({
        fileId: finalSpreadsheetId as string,
        requestBody: {
            type: "user",
            role: "writer",
            emailAddress: teacher?.email,
        },
    });

    res.status(200).json({
        success: true,
        message: `Google Sheet '${fileName || "Attendance Report"}' updated and shared successfully!`,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${finalSpreadsheetId}`,
    });
});

export const SendNotification = TryCatch(async(req:AuthRequest , res:Response)=>{
    const {message} = req.body;

    if(!message) return ErrorHandler(res , "Server Can't Get Proper Data (408)", 404);
    
    const isTeacher = await Teacher.findById(req.Id);
    
    if(!isTeacher) return ErrorHandler(res , "Something went wrong(412) !!", 404);

    const isHod = await Hod.findOne({collegeName:isTeacher?.collegeName , departmentName:isTeacher?.departmentName});
    if(!isHod) return ErrorHandler(res , "Something went Wrong(415) !!", 404);

    const newNotification = await Notification.create({
        to:isHod._id,
        upperHeadding:`${isTeacher.fullName} Replay to You ...`,
        description:message,
        userType:"Hod",
        type:"message"  
    })
    res.status(200).json({
        success:true,
        message:"Send !!"
    })
})