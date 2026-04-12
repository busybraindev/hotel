import User from "../models/User.js"
import { Webhook } from "svix"

const cw = async (req, res) => {
    console.log("Webhook hit!");

    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        const headers = {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature']
        }

        // ✅ FIXED verification
      const payload = req.body.toString()

     await whook.verify(payload, headers)

   const body = JSON.parse(payload)
    const { data, type } = body
        

        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            username: `${data.first_name || ""} ${data.last_name || ""}`,
            image: data.image_url
        }

        switch (type) {
            case "user.created":
                await User.create(userData)
                break;

            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData)
                break;

            case "user.deleted":
                await User.findByIdAndDelete(data.id)
                break;

            default:
                break;
        }

        return res.json({ success: true, message: "Webhook received" })

    } catch (err) {
        console.log("Error:", err.message);
        return res.json({ success: false, message: err.message })
    }
}

export default cw;