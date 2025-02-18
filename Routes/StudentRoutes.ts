import express from "express";
import { login, Register , getStudent , Logout } from "../Controllers/StudentControll";
import {GetUser} from '../Utils/Authentication'

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
// app.get("/f" , IsLoggedin , f)
app.get("/getstudent" , GetUser , getStudent)

export default app;
