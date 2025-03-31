import { asyncHandler } from "../utils/asynchandler.js";
import bcrypt from "bcrypt"

export const encryptPassword=asyncHandler(async(password)=>{
    const saltRounds=10;
    const hashedpassword=await bcrypt.hash(password,saltRounds);
    return hashedpassword;
})

export const comparePassword=asyncHandler(async(password,hashedpassword)=>{
    return await bcrypt.compare(password,hashedpassword);
})