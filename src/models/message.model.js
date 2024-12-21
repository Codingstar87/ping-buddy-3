import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true

    },
    receiverId:{
        type : mongoose.Schema.ObjectId ,
        ref : "User" ,
        required : true

    },
    text : {
        type : String,
    },
    image :{
        type : String,
    }
},{timestamps: true})

export const Message = mongoose.model("Message", messageSchema)