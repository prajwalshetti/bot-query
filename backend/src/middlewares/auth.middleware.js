import {asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const verifyJWT= asyncHandler( async (req,res,next) => {
    try {

        const token=req.cookies?.token
        ||req.header("Authorization")?.replace("Bearer ","")
        // console.log("Token is : ",token)||req.header("token")||req.headers.authorization
        // ||localStorage.getItem('token')
    
        if(!token) throw new ApiError(401,"Unauthorized request")
    
        const decodedToken=jwt.verify(token,process.env.JWT_TOKEN)
    
        const user=await User.findById(decodedToken._id).select("-password")
    
        if(!user)throw new ApiError(401,"Invalid Access Token")
        
        req.user=user
        console.log(`Logged in user : ${user.username}`)
        if(token)
            next()
    } catch (error) {
        throw new ApiError(401,"Invalid Access Token")
    }
} )