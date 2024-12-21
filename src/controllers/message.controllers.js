import { getReceiverSocketId, io  } from "../app.js";
import cloudinary from "../lib/cloudinary.js";

import { Message } from "../models/message.model.js";
import { User } from "../models/users.models.js";

const getUserForSidebar = async(req,res) => {
    try {
        const loggedInUser = req.user._id
        const filteredUser = await User.find({_id: {$ne : loggedInUser}}).select("-password")
        res.status(200).json(filteredUser )     
    } catch (error) {
        console.log("Error in getUserForSidebar", error.message)
        res.status(500).json({message : "Error in getUserForSidebar"})
        
    }
}

const getmessages = async(req,res) => {
    try {
        const {id : userToChatId} = req.params
        const myId = req.user._id ;

        const messages = await Message.find({
            $or : [
                {senderId : myId , receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        })
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getmessages", error.message)
        res.status(500).json({message : "Error in getmessages"})
    }
}

const sendmessage = async(req,res) => {
    try {
        const {text , image} = req.body
        const {id: receiverId } = req.params

        const senderId = req.user._id

        let imageUrl ;
        if(image){
            const uploadRespose = await cloudinary.uploader.upload(image)
            imageUrl = uploadRespose.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }

        res.status(200).json(newMessage)
        
    } catch (error) {
        console.log("Error in sendmessage", error.message)
        res.status(500).json({message : "Error in sendmessage"})
    }
}

export  { getUserForSidebar ,getmessages ,sendmessage} ;