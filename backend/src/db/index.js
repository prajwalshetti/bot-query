import mongoose from "mongoose";
import { dbname } from "../constants.js";

const connectDB=async()=>{
    try{
        const connectonInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${dbname}`)
        console.log(`mongodb connected${connectonInstance.connection.host}`)
    }catch(error){
        console.log("mongo db connection error",error)
        process.exit(1)
    }
}

export default connectDB