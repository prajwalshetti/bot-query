import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import { comparePassword, encryptPassword } from "../helper/auth.helper.js";
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"

const register=asyncHandler( async (req,res)=>{
    const {username,email,password}=req.body;
    if(!username||!email||!password)
        res.status(400).json({message:"All fields are required"})

    const existedUserOnEmail=await User.findOne({email})
    const existedUserOnUserName=await User.findOne({username})
    if(existedUserOnEmail) res.status(400).json({message:"User Already exists with the same email"})
    if(existedUserOnUserName) res.status(400).json({message:"User Already exists with the same username"})
    
    const user=await User.create({
        username:username,
        email:email,
        password:password,
    })

    res.status(200).json(user)
})

const loginuser=asyncHandler( async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password) return res.status(400).json({message:"Email and passwords are required"})
    
    const user=await User.findOne({email})
    if(!user) return res.status(400).json({message:"User does not exists"})
    
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid) return res.status(400).json({message:"Wrong Password"});

    const accessToken=user.generateToken()
    console.log("Generated token")
    console.log(accessToken)

    res.cookie('token', accessToken, {
        httpOnly: true,       // Prevent client-side access
        secure: false,         // Send only over HTTPS
        sameSite: 'Strict',   // Prevent CSRF
        maxAge: 3600000       // Cookie expiration (1 hour)
    });

    res.status(200).send(user)
})

const logoutuser=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user.id);
    if(!user)throw new ApiError(400,"User is not logged in");

    const options={
        httpOnly:true,
        secure:false
    }

    res.status(200)
    .clearCookie("token",options)
    .json({message:"User logged out successfully"})
})

const getAllUsers=asyncHandler(async(req,res)=>{
    const users=await User.find()
    if(!users) throw new ApiError(400,"No users found")

    return res.status(200).send(users)
})

const getUserById=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    if(!id) throw new ApiError(400,"Id is required")

    const user=await User.findById(id)
    if(!user)throw new ApiError(500,"No user found")
    
    res.status(200).send(user)
})

export {register,loginuser,logoutuser,getAllUsers,getUserById}