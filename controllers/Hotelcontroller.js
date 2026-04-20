import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const reg =async(req,res)=>{
    try{
        const{name,address,contact,city}=req.body
        const owner=req.user._id

        const hotel =await Hotel.findOne({owner})
        if(hotel){
            return res.json({success:false,message:"Hotel Already exists"})
        }
        await Hotel.create({name,address,contact,city,owner})
        await User.findByIdAndUpdate(owner,{role:"hotelOwner"})
        res.json({success:true,message:"Hotel registered Successfully"})
    }
    catch(err){
        console.log(err);
        
        res.json({success:false, message:"Hotel registration failed"})
    }
}