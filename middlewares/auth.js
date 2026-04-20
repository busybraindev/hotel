import User from "../models/User.js"
import {  getAuth } from '@clerk/express'
export const protect = async (req, res, next) => {
  const { userId } = getAuth(req);
  
  console.log(getAuth(req));

  console.log("USER ID:", userId);

  if (!userId) {
    return res.json({ success: false, message: "Not authorized" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.json({
      success: false,
      message: "User not yet created (webhook delay)",
    });
  }

  req.user = user;
  next();
};