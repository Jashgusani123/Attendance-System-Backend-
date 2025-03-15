import express from "express";
import { CreateNotification, GetUserNotifications } from "../Controllers/NotificationControll";
import { GetUser } from "../Utils/Authentication";

const app = express();

app.post("/create" , GetUser ,CreateNotification )
app.post("/get" , GetUser ,GetUserNotifications )

export default app;
