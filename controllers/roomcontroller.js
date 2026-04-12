import Hotel from "../models/Hotel.js"
import {v2 as cloudinary} from "cloudinary"
import Room from "../models/room.js"

export const createRoom=async(req,res)=>{
    try{
        const{roomType,pricePerNight, amenities}=req.body
        const hotel =await Hotel.findOne({owmer:req.auth.userId})
        if(!hotel){
            return res.json({success:false, message:"No hotel Found"})
        }
        const up =req.files.map(async(file)=>{
            const rs=await cloudinary.uploader.upload(file.path)
            return rs.secure_url
        })
          const images=await Promise.all(up)
          await Room.create({
            hotel : hotel._id,
            roomType,
            pricePerNight : +pricePerNight,
            amenities: JSON.parse(amenities),
            images
          })
          res.json({success:true, message:"Room created"})
    }
    catch(err){
        res.json({success:false, message:err.message})
    }
  

}
export const getRoom=async(req,res)=>{
    try{
        const rooms= await Room.find({isAvailable:true}).populate({
            path:"hotel",
            popualte:{
                path:"owner",
                select:"image"

            }
        }).sort({createdAt :-1})
        res.json({success:true, rooms})
    }
    catch(err){
        res.json({success:false, message:err.message})
    }
}
export const getOwnerRooms=async(req,res)=>{
    try{
   const hd=await Hotel.find({owner:req.auth.userId})
   const rooms=await Room.find({hotel:hd._id.toString()}).populate("hotel")
   res.json({success:true, rooms})
    }
     catch(err){
        res.json({success:false, message:err.message})
    }
}
export const toogleRoom=async(req,res)=>{
    try{
      const {roomId}=req.body;
      const {rd}=await Room.findById(roomId)
      rd.isAvailable= !rd.isAvailable;
      await rd.save()
      res.json({success:true, message: "Room Updated"})
    }
     catch(err){
        res.json({success:false, message:err.message})
    }
}