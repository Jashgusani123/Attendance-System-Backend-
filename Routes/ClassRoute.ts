import express from "express";
import { CreateClass, GetAll } from '../Controllers/ClassControll';
import { GetUser } from "../Utils/Authentication";

const app = express();

app.post("/create" ,GetUser ,CreateClass)
app.post("/getAll" , GetAll)


export default app;
