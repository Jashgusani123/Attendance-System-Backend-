import bcrypt from 'bcryptjs';
import { Request, Response } from "express";
import moment from "moment";
import { TryCatch } from "../Middlewares/error";
import Admin from "../Models/Admin";
import Class from "../Models/Class";
import Notification from "../Models/Notification";
import Student from "../Models/Student";
import Teacher from "../Models/Teacher";
import { AuthRequest } from "../Utils/Authentication";
import cookieSender from "../Utils/CookieSender";
import { ErrorHandler } from "../Utils/ErrorHandling";
import { sendEmail } from "../Utils/SendEmail";
import Panding from '../Models/Panding';


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
    cookieSender(res, newAdmin._id.toString() , "Admin")
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
                cookieSender(res, getUser._id.toString() , "Admin");
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

// For DashBoard 
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

        if (!presentPercentage && !absentPercentage) {
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
        success: true,
        StudentData
    })


});

export const GetAllTeachers = TryCatch(async (req: AuthRequest, res: Response) => {
    const isAdmin = await Admin.findById(req.Id);
    if (!isAdmin) {
        return ErrorHandler(res, "Something Went Wrong !! (147)", 404)
    }

    const AllTeachersData = await Teacher.find({ departmentName: isAdmin.departmentName, collegeName: isAdmin.collegeName });
    const allTeachers = [];

    for (const i of AllTeachersData) {
        allTeachers.push({
            fullName: i.fullName,
            avatarName: i.fullName.split(" ").map(word => word[0]).join("").toUpperCase(),
            _id: i._id
        });
    }

    res.status(200).json({
        success: true,
        TeacherData: allTeachers
    });
});

export const GetNotification = TryCatch(async(req:AuthRequest , res:Response)=>{
    const AllNotifications = await Notification.find({to:req.Id , userType:"Admin"}).select("upperHeadding description type pandingId");
    res.status(200).json({ success: true, notifications: AllNotifications });
});

// ManagePage 
export const GetTeacherInfoFromId = TryCatch(async (req: Request, res: Response) => {
    const { _id } = req.body;

    if (!_id) {
        return ErrorHandler(res, "we Can't Get Propar Data !! (172)", 404)
    }

    const teacher = await Teacher.findById(_id);
    if (!teacher) {
        return ErrorHandler(res, "We Can't Get Proper Date !! (178)", 404);
    }
    const object = {
        fullName: teacher?.fullName,
        departmentName: teacher?.departmentName,
        email: teacher?.email,
        collegeJoiningData: moment(teacher?.createdAt).format("D/M/YYYY"),
        avatarName: teacher.fullName.split(" ").map(word => word[0]).join("").toUpperCase()
    }

    res.status(200).json({
        success: true,
        teacherInfo: object
    })

});

export const SendNotification = TryCatch(async(req:AuthRequest , res:Response)=>{
    const {message , teacherId} = req.body;
    if(!message || !teacherId) return ErrorHandler(res , "Server Can't Get Proper Data (199)" , 404);
    const isAdmin = await Admin.findById(req.Id);
    if(!isAdmin) return ErrorHandler(res , "Server Can't Get Proper Data (201)" , 404);

    await Notification.create({
        upperHeadding:`${isAdmin.fullName} Send You New Message...`,
        description:message,
        to:teacherId,
        userType:"Teacher",
        type:"message"  
    });

    res.status(200).json({
        success:true,
        message:"Send !!"
    })
})

// AnalysisPage 
export const GetPersentagesOFPresentAbsentIn7Days = TryCatch(async (req: Request, res: Response) => {
    const { Id } = req.body;
    if (!Id) return ErrorHandler(res, "Server Can't Get Proper Data (197)");

    // const isTeacher = await Teacher.findById(Id);
    // if(!isTeacher) return ErrorHandler(res , "Teacher Not Found (200)" , 404);

    const AllClassesOf7Days = await Class.find({ createdBy: Id });

    if (AllClassesOf7Days.length < 0) {
        return ErrorHandler(res, "Not Any Classes (205)", 400)
    }

    let TotalStudents = 0;
    let PresentStudents = 0;
    let AbsentStudents = 0;

    AllClassesOf7Days.forEach((currentClass) => {
        TotalStudents += currentClass.allStudent.length;
        PresentStudents += currentClass.presentStudent.length;
        // AbsentStudents += currentClass.absentStudent.length;
        AbsentStudents = TotalStudents - PresentStudents;
    })

    res.status(200).json({
        success: true,
        APData: { TotalStudents, PresentStudents, AbsentStudents }
    })

});

export const Get7DaysData = TryCatch(async (req: Request, res: Response) => {
    const { Id } = req.body;
    if (!Id) return ErrorHandler(res, "Server Can't Get Data (228)", 404);

    const last7DaysData: Array<{ date: string; TotalStudents: number; PresentStudents: number; AbsentStudents: number }> = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 1; i <= 7; i++) {
        const today = new Date();

        today.setUTCDate(today.getUTCDate() - i);

        const startingDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        const endingDay = new Date(Date.UTC(today.getFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

        const AllClasses = await Class.find({ createdAt: { $gte: startingDay, $lt: endingDay }, createdBy: Id });

        let TotalStudents = AllClasses.reduce((count, current) => count + (current.allStudent.length), 0);
        let PresentStudents = AllClasses.reduce((count, current) => count + (current.presentStudent.length), 0);
        // let AbsentStudents = AllClasses.reduce((count, current) => count + (current.absentStudent.length), 0);
        let AbsentStudents = TotalStudents - PresentStudents;
        const day = days[startingDay.getUTCDay()];
        last7DaysData.push({
            date: day,
            TotalStudents,
            PresentStudents,
            AbsentStudents
        })

    }
    res.status(200).json({
        success: true,
        DataOf7Days: last7DaysData
    })
});

export const Present_Absent_cards = TryCatch(async (req: Request, res: Response) => {
    const { Id } = req.body;

    if (!Id) return ErrorHandler(res, "Server Can't Get Proper Data (265)", 404);

    const collection_of_persentage: number[] = [];

    for (let i = 0; i < 7; i++) {
        const today = new Date();
        today.setUTCDate(today.getUTCDate() - i);

        const startingDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        const endingDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

        const AllClasses = await Class.find({ createdBy: Id, createdAt: { $gte: startingDay, $lt: endingDay } });

        if (AllClasses.length === 0) {
            collection_of_persentage.push(0); // No classes on this day
            continue;
        }

        let totalPercentage = 0;

        AllClasses.forEach((i) => {
            const totalStudent = i.allStudent.length;
            if (totalStudent === 0) return; // Avoid division by zero

            const presentStudent = i.presentStudent.length;

            const percentage = (presentStudent / totalStudent) * 100

            totalPercentage += Math.round(percentage);
        });

        // Average for the day
        collection_of_persentage.push(totalPercentage / AllClasses.length);
    }

    const averagePercentage = collection_of_persentage.reduce((sum, val) => sum + val, 0) / 7;

    res.status(200).json({
        success: true,
        PresentPersentage: averagePercentage
    });
});

// ViewPage
export const GetAllCards = TryCatch(async (req: Request, res: Response) => {
    const AllStudentCount = await Student.countDocuments();
    const AllTeacherCount = await Teacher.countDocuments();
    const AllAdminCount = await Admin.countDocuments();

    res.status(200).json({
        success: true,
        CardsData: { AllAdminCount, AllStudentCount, AllTeacherCount }
    })
});

export const GetOverview = TryCatch(async (req: Request, res: Response) => {
    const boys = await Student.find({ gender: "male" }).countDocuments();
    const girls = await Student.find({ gender: "female" }).countDocuments();
    

    res.status(200).json({
        success: true,
        CardsData: { boys, girls}
    })

});

export const GetAttendaceOverview = TryCatch(async(req:Request , res:Response)=>{
    const last7DaysData: Array<{ date: string; PresentStudents: number; AbsentStudents: number }> = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for(let i = 1 ; i <= 7 ; i++){
        const today = new Date();
        today.setUTCDate(today.getUTCDate() - i);
        
        const startingDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        const endingDay = new Date(Date.UTC(today.getFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

        const AllClasses = await Class.find({createdAt:{$gte:startingDay , $lt:endingDay}});

        let TotalCount = AllClasses.reduce((count , current)=> count + (current.allStudent.length) , 0);
        let PresentCount = AllClasses.reduce((count , current)=> count + (current.presentStudent.length) , 0);
        // let AbsentCount = AllClasses.reduce((count , current)=> count + (current.absentStudent.length) , 0);
        let AbsentCount = TotalCount - PresentCount
        
        const day = days[startingDay.getUTCDay()]
        last7DaysData.push({
            date: day,
            PresentStudents:PresentCount,
            AbsentStudents:AbsentCount
        })
    }

    res.status(200).json({
        success: true,
        DataOverview: last7DaysData
    })
})
