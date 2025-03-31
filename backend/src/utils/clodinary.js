import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret:process.env.CLOUDINARY_SECRET // Click 'View Credentials' below to copy your API secret
});

export const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath)return null
        //uploading the file
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        fs.unlinkSync(localFilePath)
        console.log("file uploaded successfully",response.url)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("upload failed")
        return null
    }
}