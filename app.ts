import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";  // Import for creating an HTTP server
import { Server, Socket } from "socket.io";
import connectDB from "./config/ConnectDB";
import StudetRoutes from './Routes/StudentRoutes';
import TeacherRoutes from './Routes/TeacherRoutes';
import ClassRoute from './Routes/ClassRoute';
import cookieParser from 'cookie-parser';
import { GetUser, AuthRequest } from "./Utils/Authentication";
import { Response } from "express";
import Student from "./Models/Student";
import Teacher from "./Models/Teacher";
import { Model } from 'mongoose';

dotenv.config(); // Load environment variables
const PORT = process.env.PORT || 5000;

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.192:5173",
  process.env.FRONTEND
].filter((origin): origin is string => !!origin);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.0.192:5173",
    "https://attendance-system-gold-six.vercel.app/"
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Create HTTP Server for Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.192:5173",
      "https://attendance-system-gold-six.vercel.app/"
    ],
    credentials: true,
  },
});
const StudentSockets = new Map<string, string>();
const TeacherSockets = new Map<string, string>();
// Socket.IO Connection
io.on("connection", (socket: Socket) => {
  console.log(`⚡ New Client Connected: ${socket.id}`);

  // Store student erno when they join
  socket.on("register-student", (erno: string) => {
    
    StudentSockets.set(erno, socket.id);
    console.log(`Student Registered: ${erno} -> ${socket.id}`);
  });

  socket.on("register-teacher" , (name:string)=>{
    console.log("gf");
    
    TeacherSockets.set(name, socket.id);
    console.log(`Teacher Registered: ${name} -> ${socket.id}`);
  })

  // Handle class going live
  socket.on("start-class", (students: string[], classDetails: object , classID:String) => {
    console.log(students , classDetails);
    
    students.forEach(erno => {
      const studentSocketId = StudentSockets.get(erno);
      
      if (studentSocketId) {
        io.to(studentSocketId).emit("class-live", classDetails,classID);
        console.log(`📢 Class Live Notification sent to: ${erno}`);
      }
      if(socket){
        console.log(socket.id);
        
        io.to(socket.id).emit("class-live", classDetails)
      }
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    StudentSockets.forEach((id, erno) => {
      if (id === socket.id) {
        StudentSockets.delete(erno);
        console.log(`🚪 Student Disconnected: ${erno}`);
      }
    });
  });
  socket.on("disconnect", () => {
    TeacherSockets.forEach((id, name) => {
      if (id === socket.id) {
        TeacherSockets.delete(name);
        console.log(`🚪 Student Disconnected: ${name}`);
      }
    });
  });
});

// Routes
app.use("/student", StudetRoutes);
app.use("/teacher", TeacherRoutes);
app.use("/class" , ClassRoute)
app.get("/getuser", GetUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let model: Model<any> | null = null;
    if (req.type === "Student") {
      model = Student;
    } else if (req.type === "Teacher") {
      model = Teacher;
    }

    if (!model || !req.Id) {
      res.status(400).json({ message: "Invalid user type or ID" });
      return;
    }

    const user = await model.findById(req.Id).exec();
    if (!user) {
      res.status(404).json({ message: `${req.type} not found` });
      return;
    }

    res.json({ success: true, type: req.type, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.get("/" , (req , res) =>{
  res.send("Hello World !!")
})
// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export {io,server , TeacherSockets}