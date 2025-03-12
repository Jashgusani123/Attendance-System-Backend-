import express from "express";
import { login, Register , getStudent , Logout  , GetClasses, GetLastAttendance} from "../Controllers/StudentControll";
import {GetUser} from '../Utils/Authentication'

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
app.get("/getclasses" , GetUser , GetClasses)
app.get("/getstudent" , GetUser , getStudent)
app.get("/getlastdata" , GetUser , GetLastAttendance)

// app.get("/f" , IsLoggedin , f)

export default app;
