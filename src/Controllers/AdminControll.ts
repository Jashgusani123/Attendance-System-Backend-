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
