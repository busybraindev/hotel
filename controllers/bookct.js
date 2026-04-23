import transporter from "../config/nodemailer.js"
import Booking from "../models/Book.js"
import Hotel from "../models/Hotel.js"
import Room from "../models/room.js"
import axios from "axios"
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
  catch (err) {
  throw new Error(err.message);
}
}
export const check =async(req,res)=>{
    try{
    const {room,checkOutDate,checkInDate}=req.body
    const isAvailable= await checkAvailability({checkInDate, checkOutDate,room})
    res.json({success:true, isAvailable})
    }
    catch(err){
        res.json({success:false, message:err.message})
    }
}


export const createBook = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available",
      });
    }

    const roomData = await Room.findById(room).populate("hotel");

    let totalPrice = roomData.pricePerNight;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
    );

    totalPrice *= nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    // ✅ SEND RESPONSE FIRST
    res.json({ success: true, message: "Booking created" });

    // ✅ DEBUG USER INFO
    console.log("USER:", req.user);

    // ⚠️ Ensure email exists
    if (!req.user.email) {
      console.log("❌ No email found for user");
      return;
    }

    // ✅ SEND EMAIL (non-blocking)
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "Hotel Booking Details",
        html: `
          <h2>Booking Confirmed</h2>
          <p>Dear ${req.user.username}</p>
          <p>Thank you for your booking! Here are your details:</p>

          <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
            <li><strong>Location:</strong> ${roomData.hotel.address}</li>
            <li><strong>Date:</strong> ${new Date(
              booking.checkInDate
            ).toDateString()}</li>
            <li><strong>Amount:</strong> ${
              process.env.CURRENCY || "$"
            }${booking.totalPrice}</li>
          </ul>

          <p>We look forward to seeing you!</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent");
    } catch (err) {
      console.log("❌ Email failed:", err.message);
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "failed" });
  }
};
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
     const hotel = await Hotel.findOne({owner:req.user._id})
    if(!hotel){
        return res.json({success:false, message:"No Hotel found"})
    }
    const bookings =await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1})
    const totalBookings =bookings.length;
    const totalRevenue=bookings.reduce((acc,booking)=>acc+ booking.totalPrice,0)
    res.json({success:true, dashboardData:{bookings,totalBookings,totalRevenue}})
   }
   catch(err){
    res.json({success:false, message:"Failed to fetch"})
   }
}

export const Payment= async (req, res)=>{
  try{
    const {bookingId}= req.body
    const booking = await Booking.findById(bookingId)
    const roomData =await Room.findById(booking.room).populate("hotel")
  const totalPrice=booking.totalPrice
  const {origin}=req.headers
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.body.email, // MUST include
        amount: totalPrice * 100, // convert to kobo
        callback_url: `${origin}/verify?bookingId=${booking._id}`,
        metadata:{
          bookingId
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // 🔹 Send payment link
    res.json({
      success: true,
      session_url: response.data.data.authorization_url,
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error placing payment" });
  }
};

export const verify = async (req, res) => {
  try {
    const { bookingId, reference } = req.body;

    if (!bookingId || !reference) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;
    console.log(data);

    if (data.status === "success") {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paystackReference: reference,
        paidAt: new Date(),
      });

      return res.json({
        success: true,
        message: "Payment verified",
      });
    } else {
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: false,
        status: "failed",
      });

      return res.json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
  
  
