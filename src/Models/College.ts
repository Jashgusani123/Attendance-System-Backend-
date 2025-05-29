import mongoose, { Document, Schema, Model } from 'mongoose';

const CollegeSchema = new Schema(
    {
     collegename:{
        type:String,
        require:true,
        unique:true
     },
     logoUrl:{
        type:String,
        require:true
     },
     imageUrl:{
        type:String,
        require:true
     },
     place:{
        type:String,
        require:true,
     },
     category: {
      type: [String],
      required: true,
    },
    department: {
      type: [String],
      required: true,
    },
    

    },
    { timestamps: true }
);

export interface ICollege extends Document {
  
    collegename:String,
    logoUrl:String,
    imageUrl:String,
    place:String,
    category:String[],
    department:String[],
    createdAt:Date
}


const Class: Model<ICollege> = mongoose.model<ICollege>('College', CollegeSchema);

export default Class;
