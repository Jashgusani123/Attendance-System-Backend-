import express from 'express'
import { GetAllCollege, GetAllDepartment } from '../Controllers/SupportedControll';

const app = express();

app.get("/getallcollege" , GetAllCollege);
app.post("/getalldepartment" , GetAllDepartment);

export default app;