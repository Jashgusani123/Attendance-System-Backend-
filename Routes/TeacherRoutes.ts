import express from "express";
import { GenerateQR, GetClasses, getTeacher, login, Logout, Register } from "../Controllers/TeacherContoll";
import { GetUser } from '../Utils/Authentication';

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
app.get("/getclasses" , GetUser , GetClasses)
app.post("/generate-qr",GenerateQR);

// app.get("/f" , IsLoggedin , f)
app.get("/getteacher" , GetUser , getTeacher)

export default app;
