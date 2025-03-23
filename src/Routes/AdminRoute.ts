import express from 'express'
import { Register, login, Logout} from '../Controllers/AdminControll'
const app = express()

app.post("/register" , Register)
app.post("/login" , login)
app.get("/logout" , Logout)

export default app