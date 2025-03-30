import mongoose, { Document, Schema, Model } from 'mongoose';

const NotificationSchema = new Schema(
    {
        userType: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        upperHeadding: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        allStudent: {
            type: [String], 
            required: true,
        },
        to:{
            type:String,
        }
    },
    { timestamps: true }
);

export interface MyNotification extends Document {
    userType: string;
    type: string;
    allStudent?: string[];
    upperHeadding: string;
    description: string;
    to?:string
}


const Notification: Model<MyNotification> = mongoose.model<MyNotification>('Notification', NotificationSchema);

export default Notification;
