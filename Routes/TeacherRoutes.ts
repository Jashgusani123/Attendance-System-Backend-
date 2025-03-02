import express from "express";
import {  GetClasses, getTeacher, login, Logout, Register, GetAllAttendance } from "../Controllers/TeacherContoll";
import { GetUser } from '../Utils/Authentication';

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
app.get("/getclasses" , GetUser , GetClasses)
app.get("/getteacher" , GetUser , getTeacher)
app.post("/attendance"  , GetAllAttendance)

export default app;
