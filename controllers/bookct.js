import Booking from "../models/Book.js"
import Hotel from "../models/Hotel.js"
import Room from "../models/room.js"

const checkAvailability =async({checkInDate, checkOutDate, room})=>{
    try{
        const book =await Booking.find({
            room,
            checkInDate:{$lte: checkOutDate},
            checkOutDate:{$gte:checkInDate}
        })
        const isAvailable = book.length ===0 
        return isAvailable
    }
    catch(err){
        console.log(err.message);
        
    }
}
export const check =async(req,res)=>{
    try{
    const {room,checkOutDate,checkInDate}=req.body
    const isAvailable= await checkAvailability({checkInDate, checkOutDate,room})
    res.json({success:true}, isAvailable)
    }
    catch(err){
        res.json({success:false, message:err.message})
    }
}

export const createBook =async(req,res)=>{
    try{
        const{room, checkInDate,checkOutDate,guests}=req.body
        const user=req.user._id
        const isAvailable =await checkAvailability({checkInDate,checkOutDate,room})
        if(!isAvailable){
            return res.json({success:false, message:"Room is not avaialble"})
        }
        const roomData =await Room.findById(room).populate('hotel')
        let totalPrice=roomData.pricePerNight
        const checkIn =new Date(checkInDate)
        const checkOut =new Date(checkOutDate)
        const timeDiff =checkOut.getTime()- checkIn.getTime()
        const nights =Math.ceil(timeDiff/(1000*3600*24))
        totalPrice*=nights;
        const booking =await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice
        })
        res.json({success:true, message:"Booking created"})
        }
        catch(err){
            console.log(err);
            
            res.json({success:false, message:"failed"})
        }
}

export const getUserBook =async(req,res)=>{
    try{
        const user= req.user._id;
        const book=await Booking.find({user}).populate("room hotel").sort({created:-1})
        res.json({success:true, book})
    }
    catch(err){
        res.json({success:false, message:"failed"})
    }
}
export  const getHotelBook=async(req,res)=>{
   try{
     const hotel = await Hotel.findOne({owner:req.auth.userId})
    if(!hotel){
        return res.json({success:false, message:"No Hotel found"})
    }
    const book =await Booking.find({hotel:hotel._id}).populate("room hotel user").toSorted({createdAt:-1})
    const tb =book.length;
    const tr=book.reduce((acc,booking)=>acc+ booking.totalPrice,0)
    res.json({success:true, dashboardData:{book,tb,tr}})
   }
   catch(err){
    res.json({success:false, message:"Failed to fetch"})
   }
}