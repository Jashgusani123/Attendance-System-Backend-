import express from 'express'
import { Register } from '../Controllers/AdminControll'
const app = express()

app.post("/register" , Register)

export default app