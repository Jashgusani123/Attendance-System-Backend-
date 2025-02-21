import express from "express";
import { CreateClass, GetAll , Accept, GetLiveClass, GetUpcomingClass} from '../Controllers/ClassControll';
import { GetUser } from "../Utils/Authentication";

const app = express();

app.post("/create" ,GetUser ,CreateClass)
app.post("/getAll" , GetAll)
app.post("/accept" ,  GetUser,Accept)
app.post("/getliveclasses" , GetLiveClass)
app.post("/getupcomingclasses" , GetUpcomingClass)




export default app;
