import { Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import { MulterCollegeRequest } from "../Types/AdminType";
import { ErrorHandler } from "../Utils/ErrorHandling";
import College from '../Models/College'
import { UploadToCloudinary } from "../Utils/UploadToCloudinary";
import Hod from "../Models/Hod";
import Teacher from "../Models/Teacher";
import Student from "../Models/Student";
import Class from "../Models/Class";
import Panding from "../Models/Panding";
import Notification from "../Models/Notification";
import moment from "moment";
import Admin from "../Models/Admin";
import CookieSender from "../Utils/CookieSender";
import bcrypt from 'bcryptjs';
import { AuthRequest } from "../Utils/Authentication";
import jwt from "jsonwebtoken";



export const Registraction = TryCatch(async(req:Request , res:Response)=>{
  const {email , password} = req.body;
  if(!email || !password){
    return ErrorHandler(res , "Not Get Proper Data !!" , 404);
  }
  const newAdmin = await Admin.create({
    email ,
    password
  })
  CookieSender(res, newAdmin._id.toString(), "Admin");
  res.status(201).json({
    success: true,
    message: `Registration Completed!! `,
    user: newAdmin
});
  
});

export const login = TryCatch(async (req: Request,res: Response) => {
  const {  email, password } = req.body;
  if ( email && password) {
      const admin = await Admin.findOne({ email });
      const truePassword = await bcrypt.compare(password, admin?.password!);
      if (truePassword && admin) {
          CookieSender(res, admin._id.toString(), "Admin")
          return res.status(202).json({
              success: true,
              message: "WellCome Admin",
              user: admin
          })
      } else {

          ErrorHandler(res, "Email or Password Should be Wrong !!", 401);
      }
  } else {
      ErrorHandler(res, "Required AllFileds!!", 400);
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

export const CreateCollege = TryCatch(async (req: Request, res: Response) => {

  const typedReq = req as MulterCollegeRequest;

  let { collegename, place } = typedReq.body;
  const logo = typedReq.files?.["logo"]?.[0];
  const image = typedReq.files?.["image"]?.[0];


  let category = typedReq.body.category as string | string[];
  let department = typedReq.body.department as string | string[];

  // Ensure both are arrays
  category = Array.isArray(category) ? category : category.split(",");
  department = Array.isArray(department) ? department : department.split(",");
  if (
    !collegename ||
    !place ||
    !category ||
    category.length === 0 ||
    !department ||
    department.length === 0 ||
    !logo ||
    !image
  ) {
    return ErrorHandler(res, "All Items are Needed !!", 404);
  }



  const imageUrl = await UploadToCloudinary(image);
  const logoUrl = await UploadToCloudinary(logo);


  const newCollege = await College.create({
    collegename: collegename.toLowerCase(),
    place: place.toLowerCase(),
    category,
    department,
    logoUrl,
    imageUrl
  });

  if (!newCollege) {
    res.status(404).json({
      success: false
    })
  }

  res.status(200).json({
    success: true,
    message: "College Added !!"
  })


});

export const GetAllCollege = TryCatch(async (req: Request, res: Response) => {
  const AllColleges = await College.find();
  res.status(200).json({
    success: true,
    AllColleges
  })
});

export const bySearchCollege = TryCatch(async (req: Request, res: Response) => {
  const search = req.query.search as string;

  if (!search) {
    return res.status(200).json({
      success: true,
      colleges: [],
    });
  }

  const colleges = await College.find({
    collegename: { $regex: search, $options: "i" },
  });

  res.status(200).json({
    success: true,
    colleges,
  });
});

export const CardDataGoted = TryCatch(async (req: Request, res: Response) => {
  // Card First
  const [HodCount, TeacherCount, StudentCount] = await Promise.all([
    Hod.countDocuments(),
    Teacher.countDocuments(),
    Student.countDocuments()
  ]);

  const cardFirst = {
    HODs: HodCount,
    Teachers: TeacherCount,
    Student: StudentCount
  };

  // Card Second
  const cardSecond: Array<{ date: string; PresentCount: number; CreatedClassCount: number }> = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);

    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    const AllClasses = await Class.find({ createdAt: { $gte: start, $lt: end } });

    const PresentCount = AllClasses.reduce(
      (count, current) => count + (current.presentStudent?.length || 0),
      0
    );
    const CreatedClassCount = AllClasses.length;
    const day = days[start.getUTCDay()];

    cardSecond.push({ date: day, PresentCount, CreatedClassCount });
  }

  // Card Third
  const cardThird: Array<{ date: string; PandingRequestCount: number; NotificationRequestCount: number }> = [];

  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);

    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    const [PandingRequestCount, NotificationRequestCount] = await Promise.all([
      Panding.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Notification.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    ]);

    const day = days[start.getUTCDay()];

    cardThird.push({ date: day, PandingRequestCount, NotificationRequestCount });
  }

  res.status(200).json({
    success: true,
    Data: { cardFirst, cardSecond, cardThird }
  });
});

export const allUsers = TryCatch(async (req: Request, res: Response) => {
  const [Hods, Teachers, Students] = await Promise.all([
    Hod.find().select("fullName email departmentName"),
    Teacher.find().select("fullName email departmentName"),
    Student.find().select("fullName email departmentName")
  ])

  res.status(200).json({
    success: true,
    Users: { Hods, Teachers, Students }
  })

});

export const GetCollege = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    return ErrorHandler(res, "Selectation Problem !!", 404);
  }

  const college = await College.findOne({ _id: id });
  if (!college) {
    return ErrorHandler(res, "College Not Founded !!");
  }

  const [Hods, Teachers, Students] = await Promise.all([
    Hod.find({ collegeName: college.collegename }).select("fullName email departmentName"),
    Teacher.find({ collegeName: college.collegename }).select("fullName email departmentName"),
    Student.find({ collegeName: college.collegename }).select("fullName email departmentName"),
  ])

  const HodCount = Hods.length;
  const TeacherCount = Teachers.length;
  const StudentCount = Students.length;

  const CollegeDetails = {
    collegename: college.collegename,
    logoUrl: college.logoUrl,
    imageUrl: college.imageUrl,
    place: college.place,
    category: college.category,
    department: college.department,
    HodCount,
    TeacherCount,
    StudentCount,
    Hods,
    Teachers,
    Students
  }

  res.status(200).json({
    success: true,
    CollegeDetails
  })
});

export const FirstTable = TryCatch(async (req: Request, res: Response) => {
  const colleges = await College.find();

  const table = await Promise.all(colleges.map(async (clg) => {
    const collegeName = clg.collegename || "Unknown";
    const departments = Array.isArray(clg.department) ? clg.department.length : 0;

    const [hods, teachers, students] = await Promise.all([
      Hod.countDocuments({ collegeName }),
      Teacher.countDocuments({ collegeName }),
      Student.countDocuments({ collegeName }),
    ]);

    return { college: collegeName, departments, hods, teachers, students };
  }));

  res.status(200).json({ success: true, tableData: table });
});

export const Departments = TryCatch(async (req: Request, res: Response) => {
  const colleges = await College.find();
  const DepartmentData: Array<{ collegeName: String, departments: { name: String, hod: String | null }[] }> = [];

  for (const college of colleges) {
    const departments = [];

    for (const deptName of college.department) {
      const hod = await Hod.findOne({ collegeName: college.collegename, departmentName: deptName.toLowerCase() });

      departments.push({
        name: deptName,
        hod: hod ? hod.fullName : "Not assigned",
      });
    }

    DepartmentData.push({
      collegeName: college.collegename,
      departments
    });
  }

  res.status(200).json({ success: true, data: DepartmentData });
});

export const GetClasses = TryCatch(async (req: Request, res: Response) => {
  const Classes = await Class.find();
  const now = moment(); // current time

  const liveClasses: Array<{ title: string, college: string, department: string, teacher: string, time: string, status: string }> = [];
  const lastClasses: Array<{ title: string, college: string, department: string, teacher: string, time: string, status: string }> = [];

  for (const i of Classes) {
    const start = moment(i.starting);
    const end = moment(i.ending);

    if (now.isBetween(start, end)) {
      liveClasses.push({
        title: i.subjectName,
        college: i.collegeName,
        department: i.departmentName,
        teacher: i.teacherName,
        time: `${start.format("HH:mm")} - ${end.format("HH:mm")}`,
        status: "Live Now"
      });
    } else if (now.isAfter(end)) {
      lastClasses.push({
        title: i.subjectName,
        college: i.collegeName,
        department: i.departmentName,
        teacher: i.teacherName,
        time: `${start.format("HH:mm")} - ${end.format("HH:mm")}`,
        status: "Completed"
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      liveClasses,
      lastClasses
    }
  });
});

export const GetRequests = TryCatch(async (req: Request, res: Response) => {
 
  const DataOfPandingRequests: Array<{
    id: String,
    title: String,
    college: String,
    department: String,
    reason: String,
    requestedTo: String,
    date: String,
    status: String,
  }> = []
  const PandingRequests = await Panding.find();
  const now = moment();
  for (const i of PandingRequests) {
    const hod = await Hod.findOne({_id:i.hodId});
    const formattedDate = new Date(i.createdAt!).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    let status ;
    if(!i.accepted && !i.rejected){
      status = "Working"
    }else{
      status = "Expired"
    }
    DataOfPandingRequests.push({
      id:i._id,
      title:"Panding Request",
      college:i.collegeName,
      department:i.departmentName,
      reason:"Create Account",
      requestedTo:hod?.fullName ? hod.fullName : "unkown",
      date:formattedDate,
      status:status
    })
  }
  res.status(200).json({ success: true, data: DataOfPandingRequests });

});

export const getAllFromClgAndDept = TryCatch(async (req: Request, res: Response) => {
  const {departmentName , collegeName} = req.body

  if(!departmentName || !collegeName){
    return ErrorHandler(res, "Not Get Proper Data !! " , 404);
  }
  const [Students , Hods , Teachers] = await Promise.all([
    Student.find({collegeName , departmentName}).select("fullName"),
    Hod.find({collegeName , departmentName}).select("fullName"),
    Teacher.find({collegeName , departmentName}).select("fullName")
  ])
  
  const users = [...Students , ...Hods , ...Teachers ];


  res.status(200).json({
    success:true,
    users
  })
});

export const GetAllNotifications = TryCatch(async(req:Request, res:Response)=>{
  const Notifications = await Notification.find({type:"adminmessage"}).select("upperHeadding description allUsers to userType");
 
  res.status(200).json({
    success:true,
    Notifications
  })

});

export const DeleteNotification = TryCatch(async(req:Request , res:Response)=>{
  const id = req.query.id as string; 

  if(!id) return ErrorHandler(res, "Not Got Proper Data !!" , 404);

  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    success:true,
    message:"Deleted Successfully !!"
  })

  
});

export const handleRegistation = TryCatch(async (req: AuthRequest, res: Response) => {
  const { credentialID, publicKey, counter, transports } = req.body;

  if (!credentialID || !publicKey) {
    return res.status(400).json({ message: "Missing credential data" });
  }
  
  // You can find the admin using session or for now use the first one
  const admin = await Admin.findById(req.Id); // Or use: await Admin.findById(req.adminId);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  admin.credentials.push({ credentialID, publicKey, counter, transports });
  await admin.save();

  res.status(200).json({ message: "Fingerprint credential registered" });
});
export const handleFingerprintLogin = TryCatch(async (req: Request, res: Response) => {
  const { credentialID } = req.body;
  if (!credentialID) return res.status(400).json({ message: "Missing credential ID" });

  const admin = await Admin.findOne({ "credentials.credentialID": credentialID });
  if (!admin) return res.status(401).json({ message: "Invalid fingerprint" });
  const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET!);

  // const token = generateToken(admin._id); // if using JWT
  res.status(200).json({ success: true, user: admin, token });
});
