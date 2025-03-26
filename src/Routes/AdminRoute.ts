import express from 'express'
import { Register, login, Logout, GetAllStudents , GetAllTeachers} from '../Controllers/AdminControll'
import { GetUser } from '../Utils/Authentication'
const app = express()

app.post("/register" , Register)
app.post("/login" , login)
app.get("/logout" , Logout)
app.get("/getallstudent" , GetUser ,GetAllStudents )
app.get("/getallteacher" , GetUser ,GetAllTeachers )

export default app